
import { firestore, serviceAccount } from "../firebaseAdmin.js";

export async function createPost({ title, content, author }) {
  return await firestore.collection("forumPosts").add({
    title,
    content,
    author: {
      id: author.id,
      username: author.username,
    },
    createdAt: new Date(),
    viewCount: 0,
  });
}
export async function updatePost(postId, { title, content }, userId) {
  const docRef = firestore.collection("forumPosts").doc(postId);
  const doc = await docRef.get();

  if (!doc.exists) throw new Error("Post not found");
  const post = doc.data();
  if (String(post.author.id) !== String(userId)) throw new Error("Unauthorized");

  await docRef.update({ title, content });
  return true;
}

export async function deletePost(postId, userId) {
  const docRef = firestore.collection("forumPosts").doc(postId);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error("Nerastą jokių žinučių");

  const post = doc.data();
  if (String(post.author.id) !== String(userId)) throw new Error("Unauthorized");
  await docRef.delete();
  return true;
}

export async function getPosts() {
  const snapshot = await firestore.collection("forumPosts").orderBy("createdAt", "desc").get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
export async function getPostById(id) {
  const doc = await firestore.collection("forumPosts").doc(id).get();
  if (!doc.exists) {
    throw new Error('Post not found');
  }
  return { id: doc.id, ...doc.data() };
}