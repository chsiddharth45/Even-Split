const express = require("express");
const router = express.Router();

const Settlement = require("../models/Settlement");
const protect = require("../middleware/authMiddleware");

const asyncHandler = require("../middleware/asyncHandler");

router.post("/", protect, asyncHandler(async (req, res) => {
  const { from, to, amount, groupId } = req.body;

  if (!from || !to || !amount || !groupId) {
    res.status(400);
    throw new Error("All fields are required");
  }

    if(from !== req.user._id.toString()) {
      res.status(403);
      throw new Error("You can only settle your own dues");
    }

    const settlement = await Settlement.create({
      from,
      to,
      amount,
      group: groupId
    });

    res.status(201).json({
      message: "Settlement recorded successfully",
      settlement
    });
}));


module.exports = router;