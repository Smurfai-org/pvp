import express from "express";
import { createPost, getPosts, getPostById, updatePost } from "../services/forumService.js";
import { validateToken } from "./auth.js";
import { firestore } from "../firebaseAdmin.js"; // Import firestore for DELETE route

const router = express.Router();

router.post("/posts", async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    const validation = await validateToken(token);
    if (!validation.valid) return res.status(401).json({ message: "Unauthorized" });
    const { title, content } = req.body;
    const author = validation.data.user;

    const postId = (await createPost({ title, content, author })).id; // Get ID from Firestore add
    res.status(201).json({ id: postId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/posts", async (req, res) => {
  try {
    const posts = await getPosts();
    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/posts/:id", async (req, res) => {
  try {
    const post = await getPostById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: "Post not found" });
  }
});

router.put("/posts/:id", async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    const validation = await validateToken(token);
    if (!validation.valid) return res.status(401).json({ message: "Unauthorized" });

    const userId = String(validation.data.user.id);
    await updatePost(req.params.id, req.body, userId);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: err.message });
  }
});

router.delete("/posts/:id", async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    const validation = await validateToken(token);
    if (!validation.valid) return res.status(401).json({ message: "Unauthorized" });

    const userId = String(validation.data.user.id);
    const postId = req.params.id;

    const postRef = firestore.collection("forumPosts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (String(postDoc.data().author.id) !== String(userId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const commentsSnapshot = await firestore.collection("comments")
      .where("postId", "==", postId)
      .get();

    const deleteComments = commentsSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deleteComments);

    await postRef.delete();

    res.sendStatus(200);
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;