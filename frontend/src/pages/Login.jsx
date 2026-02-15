import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email, password });
      login(
        { _id: data._id, name: data.name, email: data.email, role: data.role },
        data.token
      );
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8 bg-carnival-dark bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-carnival-primary/20 via-carnival-dark to-carnival-dark">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="text-2xl sm:text-3xl font-bold text-carnival-primary">Cine Carnival</Link>
          <p className="text-white/60 mt-2 text-sm sm:text-base">Sign in to book tickets</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-carnival-card rounded-2xl p-5 sm:p-8 shadow-xl border border-white/10">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">{error}</div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-carnival-primary"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-carnival-primary"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-3 rounded-lg bg-carnival-primary font-semibold text-white hover:bg-red-600 transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="mt-4 text-center text-white/60 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-carnival-primary hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
