const Group = require("../models/groups");
const User = require("../models/user");
const asyncHandler = require("../middleware/asyncHandler");

exports.createGroup = asyncHandler(async (req, res) => {
    const {name, members} = req.body;

    if(!name) {
        res.status(400);
        throw new Error("Group names and members are required");
    }

    const group = await Group.create({
        name,
        createdBy: req.user._id,
        members: [...new Set([req.user._id.toString(), ...(members || [])])]
    });

    res.status(201).json({
        message: "Group created successfully",
        group
    });
});

exports.deleteGroup = asyncHandler(async (req, res) => {
    const {groupId} = req.params;
        
    const group = await Group.findById(groupId);
    if(!group) {
        res.status(404);
        throw new Error("Group not found");
    }

    if(group.createdBy.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("You Are Not The Creator Of This Group, Please Contact the creator to delete the group");
    }

    await group.deleteOne();

    res.status(200).json({
        message: "Group deleted successfully"
    });
});

exports.getGroupById = asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
        .populate("members", "name email")
        .populate("createdBy", "name email")
    
    if(!group) {
        res.status(404);
        throw new Error("Group not found");
    }

    const isMember = group.members.some(
        member => member._id.toString() === req.user._id.toString()
    )

    if(!isMember) {
        res.status(403);
        throw new Error("You're not a member of this group");
    }

    res.status(200).json({
        group
    });
});

exports.getMyGroups = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page-1)*limit;

    const totalGroups = await Group.countDocuments({
        members: req.user._id
    });

    const groups = await Group.find({
        members: req.user._id
    })
        .populate("createdBy", "name email")
        .sort({ createdBy: -1 })
        .skip(skip)
        .limit(limit)
        .lean()

    res.status(200).json({
        page,
        limit,
        totalGroups,
        totalPages: Math.ceil(totalGroups / limit),
        groups
    });    
});

exports.addMember = asyncHandler(async(req, res) => {
    const { groupId } = req.params;
    const { email } = req.body;

    const group = await Group.findById(groupId);
    if(!group) {
        res.status(404);
        throw new Error("Group not found");
    }

    const user = await User.findOne({ email });
    if(!user) {
        res.status(404);
        throw new Error("User not found");
    }

    if(group.members.includes(user._id)) {
        res.status(400);
        throw new Error("User already exists in the group");
    }

    group.members.push(user._id);
    await group.save();

    res.json({
        message: "Member added",
        group
    });
});