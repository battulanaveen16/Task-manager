import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    const fakeUser = {
      id: 1,
      name: 'Naveen',
      email,
    };

    localStorage.setItem('user', JSON.stringify(fakeUser));

    setUser(fakeUser);

    return fakeUser;
  };

  const signup = async (name, email, password) => {
    const fakeUser = {
      id: 1,
      name,
      email,
    };

    localStorage.setItem('user', JSON.stringify(fakeUser));

    setUser(fakeUser);

    return fakeUser;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        loading: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);