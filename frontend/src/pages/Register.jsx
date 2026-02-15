import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await authAPI.register({ name, email, password });
      const data = response.data;
      login({ _id: data._id, name: data.name, email: data.email, role: data.role }, data.token);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const colors = {
    bmsRed: "#F84464", // Standard BookMyShow Red
    darkest: "#0B0E13",
    cardBg: "rgba(255, 255, 255, 0.95)",
    textMain: "#333333",
  };

  const styles = {
    container: {
      position: "relative",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      backgroundColor: colors.darkest,
      overflow: "hidden",
      fontFamily: '"Inter", sans-serif',
    },
    // Realistic Movie Background
    bgReel: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundImage: `linear-gradient(rgba(11, 14, 19, 0.8), rgba(11, 14, 19, 0.8)), url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      zIndex: 0,
    },
    // The "Slanted Film Strip"
    slantedReel: {
      position: "absolute",
      display: "flex",
      gap: "15px",
      top: "10%",
      left: "-5%",
      transform: "rotate(-5deg)",
      zIndex: 1,
      opacity: 0.4,
      animation: "scrollReel 40s linear infinite",
    },
    filmCell: {
      width: "140px",
      height: "200px",
      borderRadius: "8px",
      background: "#222",
      border: "4px solid #000",
      overflow: "hidden",
      flexShrink: 0,
      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    },
    // Modern "BMS Type" Card
    card: {
      position: "relative",
      zIndex: 10,
      width: "100%",
      maxWidth: "400px",
      background: colors.cardBg,
      padding: "32px",
      borderRadius: "12px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
    },
    label: {
      display: "block",
      fontSize: "12px",
      fontWeight: "700",
      color: "#666",
      marginBottom: "6px",
      textTransform: "uppercase",
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      marginBottom: "20px",
      background: "#F2F2F2",
      border: "1px solid #E5E5E5",
      borderRadius: "8px",
      fontSize: "15px",
      color: "#222",
      outline: "none",
      boxSizing: "border-box",
      transition: "border-color 0.2s",
    },
    button: {
      width: "100%",
      padding: "14px",
      backgroundColor: isHovered ? "#E23755" : colors.bmsRed,
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      fontWeight: "bold",
      fontSize: "16px",
      cursor: "pointer",
      marginTop: "10px",
      transition: "0.2s ease-in-out",
    },
    grain: {
      position: "absolute",
      inset: 0,
      zIndex: 5,
      pointerEvents: "none",
      opacity: 0.05,
      backgroundImage: `url('https://www.transparenttextures.com/patterns/60-lines.png')`,
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes scrollReel {
          0% { transform: rotate(-5deg) translateX(0); }
          100% { transform: rotate(-5deg) translateX(-50%); }
        }
        input:focus { border-color: ${colors.bmsRed} !important; }
      `}</style>

      {/* Visual Layers */}
      <div style={styles.bgReel} />
      <div style={styles.grain} />
      
      {/* Background Animated Strip */}
      <div style={styles.slantedReel}>
        {[1,2,3,4,5,6,7,8].map((i) => (
          <div key={i} style={styles.filmCell}>
            <img 
              src={`https://picsum.photos/200/300?grayscale&sig=${i}`} 
              alt="movie" 
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} 
            />
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ color: colors.bmsRed, fontSize: "28px", fontWeight: "900", margin: 0, fontFamily: "serif" }}>
            CINE CARNIVAL
          </h1>
          <p style={{ color: "#888", fontSize: "14px", marginTop: "4px" }}>Create your account for the best experience</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ padding: "10px", backgroundColor: "#FFEDED", color: colors.bmsRed, borderRadius: "6px", marginBottom: "16px", fontSize: "13px", textAlign: "center", border: "1px solid #FFD1D1" }}>
              {error}
            </div>
          )}

          <label style={styles.label}>Full Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            style={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label style={styles.label}>Create Password</label>
          <input
            type="password"
            placeholder="Minimum 6 characters"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            style={styles.button}
            disabled={loading}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {loading ? "ADMITTING..." : "REGISTER"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "14px", color: "#666" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: colors.bmsRed, textDecoration: "none", fontWeight: "bold" }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}