const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth");

const { addComment, getComments, deleteComment } = require("../controllers/commentControllers");

router.post("/:postId", protect, addComment);
router.get("/:postId", getComments);
router.delete("/:id", protect, deleteComment);

module.exports = router;