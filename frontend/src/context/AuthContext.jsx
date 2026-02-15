import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
  Load user from localStorage on first load
  */
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("Auth load error:", err);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
    }

    setLoading(false);
  }, []);

  /*
  Login function
  */
  const login = (userData, token) => {

    const cleanUser = {
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
    };

    localStorage.setItem('user', JSON.stringify(cleanUser));
    localStorage.setItem('token', token);

    setUser(cleanUser);
  };

  /*
  Logout function
  */
  const logout = () => {

    localStorage.removeItem('user');
    localStorage.removeItem('token');

    setUser(null);

    window.location.href = "/login";
  };

  /*
  Update user
  */
  const updateUser = (userData) => {

    const cleanUser = {
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
    };

    localStorage.setItem('user', JSON.stringify(cleanUser));
    setUser(cleanUser);
  };

  /*
  Check admin
  */
  const isAdmin = user?.role === "admin";

  /*
  Context value
  */
  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAdmin,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

/*
Hook
*/
export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
