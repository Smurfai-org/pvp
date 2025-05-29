import firestore from "../firebaseAdmin.js";

export async function createComment({ postId, content, author }) {
  const docRef = await firestore.collection("comments").add({
    postId,
    content,
    author: {
      id: author.id,
      username: author.username,
    },
    createdAt: new Date(),
  });
  return docRef.id;
}

export async function updateComment(commentId, content, userId) {
    const docRef = firestore.collection("comments").doc(commentId);
    const doc = await docRef.get();
  
    if (!doc.exists) throw new Error("Comment not found");
  
    const comment = doc.data();
    if (comment.author.id !== userId) throw new Error("Unauthorized");
  
    await docRef.update({ content });
    return true;
  }
  
  export async function deleteComment(commentId, userId) {
    const docRef = firestore.collection("comments").doc(commentId);
    const doc = await docRef.get();
  
    if (!doc.exists) throw new Error("Comment not found");
  
    const comment = doc.data();
    if (comment.author.id !== userId) throw new Error("Unauthorized");
  
    await docRef.delete();
    return true;
  }
  

export async function getCommentsForPost(postId) {
  const snapshot = await firestore
    .collection("comments")
    .where("postId", "==", postId)
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
export async function getCommentCountByPostId(postId) {
  const snapshot = await firestore
    .collection("comments")
    .where("postId", "==", postId)
    .get();

  return snapshot.size;
}
