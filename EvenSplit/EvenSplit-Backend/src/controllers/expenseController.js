const Expense = require("../models/Expense");
const Group = require("../models/groups");

const asyncHandler = require("../middleware/asyncHandler");
// const { ExpressValidator } = require("express-validator");

exports.addExpense = asyncHandler(async (req, res) => {
   const {groupId, amount, description, participants, splitType, splitsInput} = req.body;

    if (!groupId || !amount || !participants || participants.length === 0) {
        res.status(400);
        throw new Error("Missing required fields");
    }

    if(amount < 0) {
        res.status(400);
        throw new Error("Amount must be greater than zero");
    }

    const group = await Group.findById(groupId);
    if(!group) {
        res.status(404);
        throw new Error("Group not found");
    }

    if(!group.members.map(id => id.toString()).includes(req.user._id.toString())) {
        res.status(403);
        throw new Error("You are not a member of this group")
    }

    const allMembers = group.members.map(id => id.toString());
    const invalidUsers = participants.filter(
        id => !allMembers.includes(id)
    );

    if(invalidUsers.length > 0) {
        res.status(400);
        throw new Error("Some participants are not group members");
    }

    let splits = [];

    if(splitType === "equal") {
        const splitAmount = Number((amount/participants.length).toFixed(2));
        
        splits = participants.map(userId => ({
            user: userId,
            amount: splitAmount
        }));
    } else if(splitType === "exact") {
        const total = splitsInput.reduce((sum, s) => sum + s.amount, 0);

        if(Math.abs(total-amount) > 0.01) {
            res.status(400);
            throw new Error("Exact amounts do not match total");
        }
        splits = splitsInput;
    } else if(splitType === "percentage") {
        const totalPercent = splitsInput.reduce((sum, s) => sum + s.percentage, 0)
        if(totalPercent != 100) {
            res.status(400);
            throw new Error("Total percentage must be 100");
        }

        splits = splitsInput.map(s => ({
            user: s.user,
            amount: Number(((s.percentage/100)*amount).toFixed(2))
        }));
    } else {
        res.status(400);
        throw new Error("Invalid split type");
    }

    const expense = await Expense.create({
        description,
        amount,
        paidBy: req.user._id,
        group: groupId,
        splits
    });

    res.status(201).json({
        message: "Expense created successfully",
        expense
    });
});

exports.getGroupExpenses = asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page-1)*limit;

    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    const group = await Group.findById(groupId);
    if(!group) {
        res.status(404);
        throw new Error("Group not found");
    }

    const isMember = group.members
        .map(id => id.toString())
        .includes(req.user._id.toString())

    if(!isMember) {
        res.status(403);
        throw new Error("You are not a member of this group");
    }

    const query = { group: groupId };

    if(req.query.minAmount) {
        query.amount = { ...query.amount, $gte: Number(req.query.minAmount)}
    }

    if(req.query.maxAmount) {
        query.amount = { ...query.amount, $lte: Number(req.query.maxAmount)}
    }
    

    const totalExpenses = await Expense.countDocuments(query);

    const expenses = await Expense.find(query)
        .populate("paidBy", "name email")
        .populate("splits.user", "name email")
        .sort({ [sortBy] : order })
        .skip(skip)
        .limit(limit)
        .lean()
    
    res.status(200).json({
        page,
        limit,
        totalExpenses,
        totalPages : Math.ceil(totalExpenses/limit),
        expenses
    });
});

exports.getBalances = asyncHandler(async(req, res) => {
    const { groupId } = req.params;

    const expenses = await Expense.find({group: groupId});
    const balances = {};

    expenses.forEach((expense) => {
        const payer = expense.paidBy.toString();

        if(!balances[payer]) balances[payer] = 0;
        balances[payer] += expense.amount;

        expense.splits.forEach((split) => {
            const user = split.user.toString();
            if(!balances[user]) balances[user] = 0;
            balances[user] -= split.amount;
        })
    })

    res.status(200).json({balances});
});

exports.getSettlements = asyncHandler(async(req, res) => {
    const { groupId } = req.params;
    const expenses = await Expense.find({ group: groupId });

    const balances = {};

    expenses.forEach((expense) => {
        const payer = expense.paidBy.toString();

        if(!balances[payer]) balances[payer] = 0;
        balances[payer] += expense.amount;

        expense.splits.forEach((split) => {
            const user = split.user.toString();

            if(!balances[user]) balances[user] = 0;
            balances[user] -= split.amount;
        });
    });

    let creditors = [];
    let debtors = [];

    for(let user in balances) {
        if(balances[user] > 0) creditors.push({user, amount: balances[user]});
        if(balances[user] < 0) debtors.push({user, amount: balances[user]});
    }

    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => a.amount - b.amount);

    const settlements = [];
    let i = 0, j = 0;

    while(i < creditors.length && j < debtors.length) {
        let credit = creditors[i].amount;
        let debt = Math.abs(debtors[j].amount);

        let settledAmount = Math.min(credit, debt);

        settlements.push({
            from: debtors[j].user,
            to: creditors[i].user,
            amount: Number(settledAmount.toFixed(2))
        });

        creditors[i].amount -= settledAmount;
        debtors[j].amount += settledAmount;

        if(creditors[i].amount === 0) i++;
        if(debtors[j].amount === 0) j++;
    }
    res.status(200).json({ settlements });
});

exports.getExpenseById = asyncHandler(async (req, res) => {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId)
        .populate("paidBy", "name")
        .populate("splits.user", "name")
        .populate("group"); 
    
    if(!expense) {
        res.status(404);
        throw new Error("Expense not found");
    }

    res.status(200).json({expense});
});

exports.deleteExpense = asyncHandler(async (req, res) => {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId);

    if (!expense) {
        res.status(404);
        throw new Error("Expense not found");
    }

    await expense.deleteOne();

    res.status(200).json({
        message: "Expense deleted successfully"
    });
});

exports.updateExpense = asyncHandler(async (req, res) => {
    const { expenseId } = req.params;
    const { description, amount } = req.body;

    const expense = await Expense.findById(expenseId);

    if (!expense) {
        res.status(404);
        throw new Error("Expense not found");
    }

    expense.description = description || expense.description;
    expense.amount = amount || expense.amount;

    await expense.save();

    res.status(200).json({
        message: "Expense updated",
        expense
    });
});