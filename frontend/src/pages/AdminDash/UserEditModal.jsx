import React, { useState, useEffect } from 'react';
import Button from '../../components/Button';

function EditUserModal({ user, onClose, onSave }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave({ id: user.id, username, email });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Redaguoti vartotoją</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Vartotojo vardas:
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label>
            El. paštas:
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <div className="modal-actions">
            <Button type="submit">Išsaugoti</Button>
            <Button type="button" onClick={onClose} variant="danger">Atšaukti</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserModal;
