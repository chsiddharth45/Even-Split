const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { addExpense, getGroupExpenses, getBalances, getSettlements, getExpenseById, deleteExpense, updateExpense } = require("../controllers/expenseController");

const { addExpenseValidator } = require("../validators/ExpenseValidator");
const validate = require("../middleware/validate");

router.post("/", protect, addExpenseValidator, validate, addExpense);
router.get("/group/:groupId", protect, getGroupExpenses);
router.get("/balance/:groupId", protect, getBalances);
router.get("/settlements/:groupId", protect, getSettlements);
router.get("/:expenseId", protect, getExpenseById);
router.delete("/:expenseId", protect, deleteExpense);
router.put("/:expenseId", protect, updateExpense);
module.exports = router;