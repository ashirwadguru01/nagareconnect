import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/authService';
import toast from 'react-hot-toast';

const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  background: '#0f1318',
  border: '1px solid #1e2530',
  borderRadius: '10px',
  color: '#f1f5f9',
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'Poppins, sans-serif',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const labelStyle = {
  display: 'block',
  marginBottom: '7px',
  fontSize: '13px',
  fontWeight: '500',
  color: '#64748b',
  fontFamily: 'Poppins, sans-serif',
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [visible, setVisible]   = useState(false);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 40); return () => clearTimeout(t); }, []);

  const onFocus = e => { e.target.style.borderColor = '#22c55e'; e.target.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.1)'; };
  const onBlur  = e => { e.target.style.borderColor = '#1e2530'; e.target.style.boxShadow = 'none'; };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginApi({ email, password });
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}`);
      const role = res.data.user.role;
      navigate(role === 'admin' ? '/admin' : role === 'worker' ? '/worker' : '/citizen');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080b0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'Poppins, sans-serif',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.45s ease, transform 0.45s ease',
      }}>

        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', textDecoration: 'none' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#22c55e',
            boxShadow: '0 0 10px #22c55e',
            animation: 'glow 2s ease-in-out infinite',
          }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#22c55e', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Nagar e-Connect
          </span>
        </Link>

        {/* Card */}
        <div style={{
          background: '#0f1318',
          border: '1px solid #1e2530',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#f1f5f9',
            marginBottom: '6px',
            fontFamily: 'Poppins, sans-serif',
            letterSpacing: '-0.02em',
          }}>
            Sign in
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px', fontFamily: 'Poppins, sans-serif' }}>
            Access your municipal dashboard
          </p>

          <form onSubmit={handleSubmit} autoComplete="on">

            {/* Email */}
            <div style={{ marginBottom: '18px' }}>
              <label style={labelStyle} htmlFor="login-email">Email address</label>
              <input
                id="login-email" type="email" name="email" autoComplete="email"
                placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                onFocus={onFocus} onBlur={onBlur}
                required style={inputStyle}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '28px' }}>
              <label style={labelStyle} htmlFor="login-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password" type={showPass ? 'text' : 'password'}
                  name="password" autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  onFocus={onFocus} onBlur={onBlur}
                  required style={{ ...inputStyle, paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  title={showPass ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: '#475569', cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                    padding: '4px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#22c55e'}
                  onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                >
                  {showPass ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                background: loading ? '#15803d' : '#22c55e',
                color: '#000',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '15px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Poppins, sans-serif',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#16a34a'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { e.currentTarget.style.background = loading ? '#15803d' : '#22c55e'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {loading ? (
                <>
                  <div style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{ marginTop: '24px', padding: '14px 16px', background: '#080b0f', border: '1px solid #1e2530', borderRadius: '10px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Demo credentials
            </p>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
              Admin: <span style={{ color: '#22c55e', userSelect: 'all', fontWeight: 600 }}>admin@nagareconnect.in / Admin@123</span>
            </p>
          </div>

          {/* Links */}
          <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#64748b', fontFamily: 'Poppins, sans-serif' }}>
            New here?{' '}
            <Link to="/register" style={{ color: '#22c55e', fontWeight: 600 }}>Create account</Link>
          </p>
          <p style={{ marginTop: '10px', textAlign: 'center' }}>
            <Link to="/" style={{ fontSize: '12px', color: '#475569' }}>Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
