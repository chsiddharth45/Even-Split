const mongoose = require("mongoose");

const settlementSchema = new mongoose.Schema(
    {
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = new mongoose.model("Settlement", settlementSchema);