import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores user info & role
  const [loading, setLoading] = useState(true);

  // This function runs when Google returns a success
  const login = (userData, role) => {
    setUser({ ...userData, role });
    // You can also save to sessionStorage here to persist login on refresh
    sessionStorage.setItem('cyberUser', JSON.stringify({ ...userData, role }));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('cyberUser');
  };

  useEffect(() => {
    const savedUser = sessionStorage.getItem('cyberUser');
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);