import express from "express";
import {
  createComment,
  getCommentsForPost,
  deleteComment,
  updateComment
} from "../services/comments.js";
import { getCommentCountByPostId } from "../services/comments.js"
import { validateToken } from "./auth.js";

const router = express.Router();

// Create comment
router.post("/", async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    const validation = await validateToken(token);
    if (!validation.valid) return res.status(401).json({ message: "Unauthorized" });

    const { postId, content } = req.body;
    const author = validation.data.user;

    const commentId = await createComment({ postId, content, author });
    res.status(201).json({ id: commentId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create comment" });
  }
});

// Get comments for a post
router.get("/:postId", async (req, res) => {
  try {
    const comments = await getCommentsForPost(req.params.postId);
    res.status(200).json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

// Update comment
router.put("/:commentId", async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    const validation = await validateToken(token);
    if (!validation.valid) return res.status(401).json({ message: "Unauthorized" });

    const userId = validation.data.user.id;
    await updateComment(req.params.commentId, req.body.content, userId);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: err.message });
  }
});

// Delete comment
router.delete("/:commentId", async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    const validation = await validateToken(token);
    if (!validation.valid) return res.status(401).json({ message: "Unauthorized" });

    const userId = validation.data.user.id;
    await deleteComment(req.params.commentId, userId);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: err.message });
  }
});
router.get("/:id/count", async (req, res) => {
  try {
    const postId = req.params.id;
    const count = await getCommentCountByPostId(postId);
    res.json({ count });
  } catch (err) {
    console.error("Error counting comments:", err);
    res.status(500).json({ message: "Error counting comments" });
  }
});
export default router;
