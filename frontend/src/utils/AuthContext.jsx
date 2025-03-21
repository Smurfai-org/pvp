import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext({
  loggedIn: false,
  user: null,
  loading: true,
  logout: () => {},
});

const getData = async () => {
  try {
    const response = await fetch('http://localhost:5000/auth/validate', {
      method: 'GET',
      credentials: 'include', 
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Validated user data:", data); // Log to check the response
      return data;
    } else {
      console.log('No valid data from backend', await response.json());
      return null;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};



export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const data = await getData();

      if (data) {
        setLoggedIn(true);
        setUser(data.user);
      } else {
        setLoggedIn(false);
        setUser(null);
      }

      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  const logout = async () => {
    await fetch('http://localhost:5000/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  
    setLoggedIn(false);
    setUser(null);
  
    window.location.href = '/login';
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ loggedIn, user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
