import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function Login() {

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {

      const response = await authAPI.login({

        email: emailRef.current.value,
        password: passwordRef.current.value

      });

      const data = response.data;

      login(
        {
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role
        },
        data.token
      );

      navigate("/", { replace: true });

    }
    catch (err) {

      setError(
        err.response?.data?.message ||
        "Invalid email or password"
      );

      setLoading(false);

    }

  };

  const colors = {

    bmsRed: "#F84464",
    darkest: "#0B0E13",
    cardBg: "rgba(255, 255, 255, 0.95)"

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
      filter: "contrast(1.05) sepia(0.05)"
    },

    bgReel: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundImage:
        `linear-gradient(rgba(11,14,19,0.85), rgba(11,14,19,0.85)),
        url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      zIndex: 0
    },

    slantedReel: {
      position: "absolute",
      display: "flex",
      gap: "15px",
      top: "15%",
      left: "-10%",
      transform: "rotate(-5deg)",
      zIndex: 1,
      opacity: 0.3,
      animation: "scrollReel 45s linear infinite"
    },

    filmCell: {
      width: "140px",
      height: "200px",
      borderRadius: "4px",
      background: "#222",
      border: "4px solid #000",
      overflow: "hidden",
      flexShrink: 0,
      boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
    },

    card: {
      position: "relative",
      zIndex: 10,
      width: "100%",
      maxWidth: "400px",
      background: colors.cardBg,
      padding: "40px 32px",
      borderRadius: "12px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
    },

    label: {
      display: "block",
      fontSize: "12px",
      fontWeight: "700",
      color: "#666",
      marginBottom: "6px",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
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
      boxSizing: "border-box"
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
      letterSpacing: "1px"
    },

    grain: {
      position: "absolute",
      inset: 0,
      zIndex: 5,
      pointerEvents: "none",
      opacity: 0.04,
      backgroundImage:
        `url('https://www.transparenttextures.com/patterns/60-lines.png')`,
      animation: "flicker 0.2s infinite"
    }

  };

  return (

    <div style={styles.container}>

      <style>{`

        @keyframes scrollReel {
          0% { transform: rotate(-5deg) translateX(0); }
          100% { transform: rotate(-5deg) translateX(-50%); }
        }

        @keyframes flicker {
          0% { opacity: 0.03; }
          50% { opacity: 0.05; }
          100% { opacity: 0.03; }
        }

        input:focus {
          border-color: ${colors.bmsRed} !important;
        }

      `}</style>

      <div style={styles.bgReel} />
      <div style={styles.grain} />

      <div style={styles.slantedReel}>

        {[1,2,3,4,5,6,7,8,9,10].map(i => (

          <div key={i} style={styles.filmCell}>

            <img
              src={`https://picsum.photos/200/300?grayscale&sig=${i+20}`}
              alt="movie"
              loading="lazy"
              style={{
                width:"100%",
                height:"100%",
                objectFit:"cover",
                opacity:0.6
              }}
            />

          </div>

        ))}

      </div>

      <div style={styles.card}>

        <div style={{ textAlign:"center", marginBottom:"32px" }}>

          <h1 style={{
            color: colors.bmsRed,
            fontSize:"32px",
            fontWeight:"900",
            margin:0,
            fontFamily:"serif"
          }}>
            CINE CARNIVAL
          </h1>

          <p style={{
            color:"#888",
            fontSize:"14px",
            marginTop:"6px"
          }}>
            Welcome back! Please sign in.
          </p>

        </div>

        <form onSubmit={handleSubmit}>

          {error && (

            <div style={{
              padding:"12px",
              background:"#FFEDED",
              color:colors.bmsRed,
              borderRadius:"8px",
              marginBottom:"20px",
              fontSize:"13px",
              textAlign:"center"
            }}>
              {error}
            </div>

          )}

          <label style={styles.label}>Email Address</label>

          <input
            type="email"
            placeholder="Enter your email"
            style={styles.input}
            ref={emailRef}
            required
          />

          <label style={styles.label}>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            style={styles.input}
            ref={passwordRef}
            required
          />

          <button
            type="submit"
            style={styles.button}
            disabled={loading}
            onMouseEnter={()=>setIsHovered(true)}
            onMouseLeave={()=>setIsHovered(false)}
          >
            {loading ? "ADMITTING..." : "SIGN IN"}
          </button>

        </form>

        <div style={{
          marginTop:"28px",
          textAlign:"center",
          fontSize:"14px",
          color:"#666"
        }}>

          Don't have an account?{" "}

          <Link
            to="/register"
            style={{
              color: colors.bmsRed,
              textDecoration:"none",
              fontWeight:"bold"
            }}
          >
            Register Now
          </Link>

        </div>

      </div>

    </div>

  );

}
