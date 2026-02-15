import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";

export default function Login() {

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setError("");
      setLoading(true);

      console.log("LOGIN ATTEMPT:", email);

      const response = await authAPI.login({
        email,
        password
      });

      console.log("LOGIN RESPONSE:", response.data);

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

    }
    catch (error) {

      console.error("LOGIN ERROR:", error);

      setError(
        error.response?.data?.message ||
        "Invalid email or password"
      );

    }
    finally {

      setLoading(false);

    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-carnival-dark">

      <div className="w-full max-w-md">

        <div className="text-center mb-6">
          <Link
            to="/"
            className="text-3xl font-bold text-red-500"
          >
            Cine Carnival
          </Link>

          <p className="text-white/60 mt-2">
            Sign in to book tickets
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-carnival-card p-6 rounded-xl border border-white/10"
        >

          {error && (
            <div className="mb-4 text-red-400">
              {error}
            </div>
          )}

          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full mb-3 p-3 bg-black text-white rounded"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full mb-4 p-3 bg-black text-white rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 p-3 rounded text-white"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="mt-4 text-center text-white/60">
            Don't have account?

            <Link
              to="/register"
              className="text-red-500 ml-2"
            >
              Register
            </Link>

          </p>

        </form>

      </div>

    </div>
  );
}
