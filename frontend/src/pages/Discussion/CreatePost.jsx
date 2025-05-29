import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreatePost.css";
const API_BASE = "http://localhost:5000/forum";

function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) throw new Error("Failed to create post");

      navigate("/discussion");
    } catch (err) {
      alert("Klaida kuriant įrašą");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="so-create-post-container">
      <div className="so-create-post-header">
        <h1 className="so-create-post-title">Sukurti naują įrašą</h1>
        <div className="so-create-post-subtitle">
          Tavo žinios gali padėti kitiems
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="so-create-post-form">
        <div className="so-form-group">
          <label className="so-form-label">Pavadinimas</label>
          <div className="so-form-description">
            Būk konkretus ir įsivaizduok, kad klausi kito žmogaus
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="so-form-input"
            placeholder="pvz. Kaip vertikaliai centruoti div?"
          />
        </div>
        
        <div className="so-form-group">
          <label className="so-form-label">Turinys</label>
          <div className="so-form-description">
            Įtrauk visą informaciją, kurios gali prireikti atsakymui
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="so-form-textarea"
            rows={10}
            placeholder="Parašyk čia savo įrašo turinį..."
          />
        </div>
        
        <div className="so-form-actions">
          <button 
            type="submit" 
            className="so-submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Keliama..." : "Paskelbti klausimą"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePost;
