import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

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
    } catch (error) {
      console.error("Auth load error:", error);

      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }

    setLoading(false);
  }, []);

  /*
  Login function
  */
  const login = (userData, token) => {
    console.log("LOGIN SUCCESS:", userData);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);

    setUser(userData);

    navigate("/", { replace: true });
  };

  /*
  Logout function
  */
  const logout = () => {
    console.log("LOGOUT");

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);

    navigate("/login", { replace: true });
  };

  /*
  Update user
  */
  const updateUser = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
  };

  /*
  Helper flags
  */
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
        isAdmin,
      }}
    >
      {!loading && children}
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
