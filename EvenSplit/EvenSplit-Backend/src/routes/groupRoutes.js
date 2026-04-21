const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {createGroup, deleteGroup, getGroupById, getMyGroups, addMember} = require("../controllers/groupController");

const { createGroupValidator } = require("../validators/groupValidators");
const validate = require("../middleware/validate");

router.post("/", protect, createGroupValidator, validate, createGroup);
router.post("/:groupId/add-member", protect, addMember);
router.delete("/:groupId", protect, deleteGroup);
router.get("/:groupId", protect, getGroupById);
router.get("/", protect, getMyGroups);

module.exports = router;