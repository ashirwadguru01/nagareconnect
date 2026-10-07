import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { login as loginService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import styles from './Auth.module.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginService(form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      const role = res.data.user.role;
      navigate(role === 'admin' ? '/admin' : role === 'worker' ? '/worker' : '/citizen');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.bgGlow} />
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoEmoji}>🌿</span>
          <div>
            <h1 className={styles.logoTitle}>Nagar e-Connect</h1>
            <p className={styles.logoSub}>Clean Cities, Smart Citizens</p>
          </div>
        </div>

        <h2 className={styles.heading}>Welcome back</h2>
        <p className={styles.subheading}>Sign in to your account</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.demoCredentials}>
          <p className={styles.demoTitle}>🔑 Demo Credentials</p>
          <div className={styles.demoGrid}>
            <div className={styles.demoItem}>
              <span className={styles.demoRole}>Admin</span>
              <span>admin@nagareconnect.in</span>
              <span className={styles.demoPass}>Admin@123</span>
            </div>
          </div>
        </div>

        <p className={styles.switchText}>
          Don't have an account?{' '}
          <Link to="/register" className={styles.link}>Register here</Link>
        </p>
        <p className={styles.switchText}>
          <Link to="/" className={styles.link}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
