const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const protect = require("../middleware/authMiddleware");

const { registerValidator, loginValidator } = require("../validators/authValidator");
const validate = require("../middleware/validate");

const asyncHandler = require("../middleware/asyncHandler");

router.post("/register", registerValidator, validate, asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("User already exist");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  res.status(201).json({
    message: "User registered successfully",
    userId: user._id,
  });
}));

router.post("/login", loginValidator, validate, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("email and password are required")
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("Invalid credentials")
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(400);
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.status(200).json({
    message: "Login Successful",
    token,
  });
}));

router.get("/profile", protect, asyncHandler(async (req, res) => {
    res.status(200).json({
      message: "Profile accessed successfully",
      user: req.user
    });
}));

module.exports = router;
