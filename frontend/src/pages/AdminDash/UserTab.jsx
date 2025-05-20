import React, { useEffect, useState } from 'react';
import Button from '../../components/Button';
import { SearchBar } from '../../components/SearchBar';
import Dropdown from '../../components/Dropdown';
import ToggleSwitch from '../../components/Toggle';
import EditUserModal from './UserEditModal';
import cookies from "js-cookie";
import './AdminDash.css';

const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

function UserTab() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [selectOptions, setSelectOptions] = useState(['A-Z', 'Z-A', 'Sukūrimo datą']);


  const tokenCookie = cookies.get("token");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${serverUrl}/user/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Klaida gaunant vartotojus');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Vartotojų gavimo klaida:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (term) => setSearchTerm(term);
  const handleSort = (option) => setSortOption(option);
  const handleToggleDeleted = () => setShowDeleted((prev) => !prev);

  const handleDeleteUser = async (id) => {
    if (window.confirm('Ar tikrai norite ištrinti šį vartotoją?')) {
      try {
        const response = await fetch(`${serverUrl}/user/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenCookie}`,
          },
          credentials: 'include',
        });
        if (response.status === 204) {
          fetchUsers();
        } else {
          const errorData = await response.json();
          console.error('Klaida tryniant vartotoją:', errorData.message);
        }
      } catch (error) {
        console.error('Vartotojo trynimo klaida:', error);
      }
    }
  };

  const handleSaveEdit = async (updatedUser) => {
    try {
      const response = await fetch(`${serverUrl}/user/${updatedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenCookie}`,
        },
        credentials: 'include',
        body: JSON.stringify(updatedUser),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Klaida redaguojant vartotoją:', errorData.message);
      } else {
        fetchUsers();
        setEditUser(null);
      }
    } catch (error) {
      console.error('Vartotojo redagavimo klaida:', error);
    }
  };

  const filteredUsers = users
    .filter((user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((user) => (showDeleted ? user.deleted : user.deleted === 0))
    .sort((a, b) => {
      if (sortOption === 'A-Z') return a.username.localeCompare(b.username);
      if (sortOption === 'Z-A') return b.username.localeCompare(a.username);
      if(sortOption === 'Sukūrimo datą') return a.creation_date.localeCompare(b.creation_date);
      return 0;
    });

  return (
    <div className="dashboard">
      <h1>Naudotojai</h1>

      <div className="admin-dash-actions">
        <SearchBar onSearch={handleSearch} />
        <Dropdown placeholder="Rikiuoti" options={selectOptions} onSelect={handleSort}/>
        <ToggleSwitch onToggleChange={handleToggleDeleted}>
          {showDeleted ? 'Ištrinti vartotojai' : 'Esami vartotojai'}
        </ToggleSwitch>
      </div>

      <div className="user-list">
        {loading ? (
          <p>Įkeliama...</p>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user.id} className="user-card">
              <p><strong>Vardas:</strong> {user.username}</p>
              <p><strong>El. paštas:</strong> {user.email || 'Nėra'}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <div className="user-actions">
                <Button onClick={() => setEditUser(user)}>Redaguoti</Button>
                {
                  showDeleted ?
                  ''
                  :
                  <Button onClick={() => handleDeleteUser(user.id)} extra='bright'>
                  Ištrinti
                  </Button>
                }
              </div>
            </div>
          ))
        ) : (
          <p>Vartotojų nerasta.</p>
        )}
      </div>

      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

export default UserTab;
