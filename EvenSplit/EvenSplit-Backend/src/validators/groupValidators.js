const { body } = require("express-validator");

exports.createGroupValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Group name is required"),

  body("members")
    .optional()
    .isArray()
    .withMessage("Members must be a non-empty array")
];
