import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import defaultProfilePic from "../../assets/profile-default.svg";
import "./Discussion.css";

const API_BASE = "http://localhost:5000/forum";
const POSTS_PER_PAGE = 5;

export default function Discussion() {
  const [allPosts, setAllPosts] = useState([]);
  const [currentPosts, setCurrentPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch(`${API_BASE}/posts`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();
        setAllPosts(data);
        setTotalPages(Math.ceil(data.length / POSTS_PER_PAGE));
      } catch (error) {
        console.error(error);
      }
    }

    fetchPosts();
  }, []);

  useEffect(() => {
    const indexOfLastPost = currentPage * POSTS_PER_PAGE;
    const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
    setCurrentPosts(allPosts.slice(indexOfFirstPost, indexOfLastPost));
  }, [currentPage, allPosts]);

  const handleNavigationCreate = () => {
    navigate("/discussion/create");
  };

  const handleViewPost = (id) => {
    navigate(`/discussion/view/${id}`);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="main-block">
      <h1 className="main-title">Diskusijų forumas</h1>
      <div className="create-button-container">
        <button
          className="create-button"
          onClick={handleNavigationCreate}
          title="Sukurti naują pranešimą"
        >
          +
        </button>
      </div>
      <div className="wrapper">
        {currentPosts.length > 0 ? (
          currentPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => handleViewPost(post.id)}
              className="post-card"
            >
              <div className="post-stats">
                <div className="stat">
                  <span className="stat-number">0</span>
                  <span className="stat-label">balsų</span>
                </div>
                <div className="stat">
                  <span className="stat-number">0</span>
                  <span className="stat-label">atsakymų</span>
                </div>
                <div className="stat">
                  <span className="stat-number">0</span>
                  <span className="stat-label">peržiūrų</span>
                </div>
              </div>
              <div className="post-content">
                <h3 className="discussion-post-title">{post.title}</h3>
                <p className="post-excerpt">
                  {post.content.length > 150
                    ? `${post.content.substring(0, 150)}...`
                    : post.content}
                </p>
                <div className="post-meta">
                  <div className="post-author">
                    <img
                      src={defaultProfilePic}
                      alt="Author"
                      className="author-profile-pic"
                    />
                    <span className="post-time">
                      {post.createdAt?._seconds
                        ? new Intl.DateTimeFormat("lt-LT", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(post.createdAt._seconds * 1000))
                        : "Nežinoma data"}
                    </span>
                    <span className="author-name">
                      {post.author?.username ?? "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No posts available.</p>
        )}
      </div>

      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || totalPages === 0}
        >
          « Atgal
        </button>

        {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map(
          (page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={currentPage === page ? "active" : ""}
              disabled={totalPages === 0}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Pirmyn »
        </button>
      </div>
    </div>
  );
}