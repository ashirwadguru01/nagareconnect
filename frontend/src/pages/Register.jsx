import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { register as registerService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import styles from './Auth.module.css';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'citizen' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await registerService(form);
      login(res.data.token, res.data.user);
      toast.success('Account created successfully! 🎉');
      navigate(res.data.user.role === 'worker' ? '/worker' : '/citizen');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
            <p className={styles.logoSub}>Join the Clean India Mission</p>
          </div>
        </div>

        <h2 className={styles.heading}>Create Account</h2>
        <p className={styles.subheading}>Start reporting issues and earning rewards</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" name="name" placeholder="Rahul Sharma" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" type="tel" name="phone" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Register As</label>
            <select className="form-select" name="role" value={form.role} onChange={handleChange}>
              <option value="citizen">Citizen</option>
              <option value="worker">Municipal Worker</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" name="password" placeholder="Minimum 6 characters" value={form.password} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
        <p className={styles.switchText}>
          <Link to="/" className={styles.link}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
