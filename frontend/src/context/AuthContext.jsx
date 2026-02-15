import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
  Load user from localStorage on startup
  */
  useEffect(() => {

    try {

      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (storedUser && token) {

        setUser(JSON.parse(storedUser));

      }

    }
    catch {

      localStorage.removeItem("user");
      localStorage.removeItem("token");

    }

    setLoading(false);

  }, []);

  /*
  Login
  */
  const login = (userData, token) => {

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);

    setUser(userData);

  };

  /*
  Logout
  */
  const logout = () => {

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);

  };

  /*
  Update user
  */
  const updateUser = (userData) => {

    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );

}

export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;

}
