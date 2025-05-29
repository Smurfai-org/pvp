import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CommentForm from "./CommentForm";
import Comment from "./Comment";
import AuthContext from "../../utils/AuthContext";
import defaultProfilePic from "../../assets/profile-default.svg";
import "./viewDetail.css";
import "./CommentForm.css";

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loggedIn } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // Fetch post and comments
  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`http://localhost:5000/forum/posts/${id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Post not found");
      const data = await res.json();
      setPost(data);
      setEditTitle(data.title);
      setEditContent(data.content);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`http://localhost:5000/comments/${id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load comments");
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  // Update post handler
  const handleUpdatePost = async () => {
    try {
      const res = await fetch(`http://localhost:5000/forum/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });

      if (!res.ok) throw new Error("Failed to update post");

      setIsEditing(false);
      fetchPost();
    } catch (err) {
      console.error("Error updating post:", err);
      setError(err.message);
    }
  };

  const handleDeletePost = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this post and all its comments?"
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/forum/posts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete post");

      navigate("/discussion");
    } catch (err) {
      console.error("Error deleting post:", err);
      setError(err.message);
    }
  };

  // Comment handlers
  const handleDeleteComment = async (commentId) => {
    try {
      const res = await fetch(`http://localhost:5000/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete comment");
      fetchComments();
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const handleUpdateComment = async (commentId, newContent) => {
    try {
      const res = await fetch(`http://localhost:5000/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ content: newContent }),
      });
      if (!res.ok) throw new Error("Failed to update comment");
      fetchComments();
    } catch (err) {
      console.error("Error updating comment:", err);
    }
  };

  if (error) return <div className="error-message">{error}</div>;
  if (!post) return <div className="loading">Loading...</div>;

  const isAuthor = user?.id && post?.author?.id && String(user.id) === String(post.author.id);

  return (
    <div className="post-detail">
      <div className="post-header">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="edit-title-input"
          />
        ) : (
          <h1 className="post-title">{post.title}</h1>
        )}

        <div className="post-meta">
          <div className="post-author">
            <img
              src={defaultProfilePic}
              alt="Author"
              className="author-profile-pic"
            />
            <span className="author-name">
              {post.author?.username || "Unknown author"}
            </span>
            <span className="post-time">
              {post.createdAt?._seconds
                ? new Intl.DateTimeFormat("lt-LT", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(post.createdAt._seconds * 1000))
                : "Unknown date"}
            </span>
          </div>

          {isAuthor && (
            <div className="post-actions">
              {isEditing ? (
                <>
                  <button
                    onClick={handleUpdatePost}
                    className="action-button save-button"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="action-button cancel-button"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="action-button edit-button"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDeletePost}
                    className="action-button delete-button"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="post-content">
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="edit-content-textarea"
            rows={10}
          />
        ) : (
          <p>{post.content}</p>
        )}
      </div>

      <div className="comments-section">
        <h3 className="comments-title">Comments ({comments.length})</h3>

        <div className="comments-list">
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              currentUserId={user?.id}
              onDelete={handleDeleteComment}
              onUpdate={handleUpdateComment}
            />
          ))}
        </div>

        {loggedIn && <CommentForm postId={id} onCommentAdded={fetchComments} />}
      </div>
    </div>
  );
}

export default PostDetail;
