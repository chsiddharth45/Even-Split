const { body } = require("express-validator");

exports.addExpenseValidator = [
    body("groupId")
        .notEmpty().withMessage("Group Id is required"),

    body("amount")
        .isFloat({ gt:0 }).withMessage("Amount must be greater than zero"),

    body("participants")
        .isArray({ min:1 }).withMessage("Participants must be a non-empty array")
];