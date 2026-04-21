const { body } = require("express-validator");

exports.registerValidator = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required"),

    body("email")
        .trim()
        .isEmail().withMessage("Valid email is required")
        .normalizeEmail(),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must me atleast 6 characters")
];

exports.loginValidator = [
    body("email")
        .trim()
        .isEmail().withMessage("Valid email is required")
        .normalizeEmail(),
    
    body("password")
        .notEmpty().withMessage("Password is required")
];