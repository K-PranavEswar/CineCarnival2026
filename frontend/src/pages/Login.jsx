import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";

export default function Login() {

  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setLoading(true);

    try {

      const response = await authAPI.login({
        email,
        password
      });

      const data = response.data;

      const userData = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role
      };

      login(userData, data.token);

      // important delay to ensure context updates
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 100);

    }
    catch (err) {

      setError(
        err.response?.data?.message ||
        "Invalid email or password"
      );

    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-carnival-dark">

      <form onSubmit={handleSubmit}
        className="bg-carnival-card p-8 rounded-xl w-96">

        {error &&
          <div className="text-red-400 mb-4">
            {error}
          </div>
        }

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
          className="w-full mb-4 p-3 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
          className="w-full mb-4 p-3 rounded"
        />

        <button
          disabled={loading}
          className="w-full bg-red-500 p-3 rounded text-white">

          {loading ? "Signing in..." : "Sign In"}

        </button>

        <div className="mt-4 text-center">

          <Link to="/register">
            Register
          </Link>

        </div>

      </form>

    </div>
  );
}
