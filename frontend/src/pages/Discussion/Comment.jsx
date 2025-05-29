import React, { useState } from "react";
import "./comment.css";
import defaultProfilePic from "../../assets/profile-default.svg";

function Comment({ comment, currentUserId, onDelete, onUpdate, onAddComment }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [voteCount, setVoteCount] = useState(comment.votes || 0);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  const isAuthor = currentUserId === comment.author?.id;

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDelete = () => {
    setIsDropdownOpen(false);
    onDelete(comment.id);
  };

  const handleUpdate = () => {
    onUpdate(comment.id, editedContent);
    setIsEditing(false);
  };

  const handleVote = (direction) => {
    setVoteCount(prev => direction === 'up' ? prev + 1 : prev - 1);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Nežinoma data';
    
    if (timestamp._seconds) {
      return new Intl.DateTimeFormat("lt-LT", {
        dateStyle: "medium",
        timeStyle: "medium",
      }).format(new Date(timestamp._seconds * 1000 + timestamp._nanoseconds/1000000));
    }
    
    return 'Nežinoma data';
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(comment.id, newComment);
      setNewComment('');
      setShowCommentForm(false);
    }
  };

  return (
    <div className="comment-container">
      <div className="comment-votes">
        <button className="vote-up" onClick={() => handleVote('up')}>
          ▲
        </button>
        <div className="vote-count">{voteCount}</div>
        <button className="vote-down" onClick={() => handleVote('down')}>
          ▼
        </button>
      </div>

      {/* Content section */}
      <div className="comment-content-container">
        {isEditing ? (
          <div className="comment-edit">
            <textarea
              className="comment-edit-textarea"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={4}
            />
            <div className="comment-edit-buttons">
              <button className="save-button" onClick={handleUpdate}>
                Išsaugoti
              </button>
              <button className="cancel-button" onClick={() => setIsEditing(false)}>
                Atšaukti
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="comment-body">
              <div className="comment-text">{comment.content}</div>
            </div>
            
            <div className="comment-footer">
              <div className="comment-actions">
                {isAuthor && (
                  <>
                    <button className="comment-action" onClick={() => setIsEditing(true)}>
                      Redaguoti
                    </button>
                    <button className="comment-action" onClick={handleDelete}>
                      Ištrinti
                    </button>
                  </>
                )}
              </div>

              <div className="comment-author-info">
                <span className="comment-time">
                  {formatTime(comment.createdAt)}
                </span>
                <div className="comment-author-badge">
                  <img 
                    src={comment.author?.avatar || defaultProfilePic} 
                    alt="Autorius" 
                    className="comment-author-avatar"
                  />
                  <span className="comment-author-name">
                    {comment.author?.username || "Anonimas"}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {showCommentForm && (
          <div className="comment-form" style={{ marginTop: '12px', paddingLeft: '16px', borderLeft: '2px solid #e4e6e8' }}>
            <textarea
              className="comment-edit-textarea"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Įrašyk komentarą..."
              rows={3}
            />
            <div className="comment-edit-buttons">
              <button className="save-button" onClick={handleAddComment}>
                Pridėti komentarą
              </button>
              <button className="cancel-button" onClick={() => {
                setShowCommentForm(false);
                setNewComment('');
              }}>
                Atšaukti
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Comment;
