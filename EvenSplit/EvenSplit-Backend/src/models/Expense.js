const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
    {
        description: {
            type: String,
            required: true,
            default: ""
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        paidBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true
        },
        splits: [
            {
               user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
               },
                amount: {
                    type: Number,
                    required: true
                },
            }
        ]
    },
    {
        timestamps: true
    }
);

expenseSchema.index({ group: 1});
expenseSchema.index({ paidBy: 1});
expenseSchema.index({ createdAt: -1});

module.exports = mongoose.model("Expense", expenseSchema);