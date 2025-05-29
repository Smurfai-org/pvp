import { useState } from "react";

function CommentForm({ postId, onCommentAdded }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const API_BASE = "http://localhost:5000"; 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/comments`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId, content }),
      });

      if (!res.ok) throw new Error("Failed to create comment");

      setContent("");
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      console.error("Error creating comment:", err);
      alert("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Rašykite komentarą..."
        rows={3}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Siunčiama..." : "Paskelbti komentarą"}
      </button>
    </form>
  );
}

export default CommentForm;