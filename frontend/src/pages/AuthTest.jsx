import React, { useContext } from 'react';
import AuthContext from '../utils/AuthContext';

const Profile = () => {
  const { loggedIn, user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!loggedIn) {
    return <div>You are not logged in.</div>;
  }

  if (!user) {
    return <div>No user data available.</div>;
  }

  return (
    <div>
      <h2>Profile</h2>
      <p>User ID: {user.id}</p>
      <p>Role: {user.role}</p>
      <p>Email: {user.email}</p>
      <p>Username: {user.username}</p>
      <img src={user.profile_pic} alt="Profile" />
    </div>
  );
};

export default Profile;
