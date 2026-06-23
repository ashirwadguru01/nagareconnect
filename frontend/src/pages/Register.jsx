import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerApi } from '../services/authService';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiCheckCircle, FiCircle } from 'react-icons/fi';

// Password rules
const rules = [
  { id: 'len',   label: 'At least 8 characters',          test: p => p.length >= 8 },
  { id: 'upper', label: 'One uppercase letter (A–Z)',      test: p => /[A-Z]/.test(p) },
  { id: 'lower', label: 'One lowercase letter (a–z)',      test: p => /[a-z]/.test(p) },
  { id: 'num',   label: 'One number (0–9)',                test: p => /[0-9]/.test(p) },
  { id: 'sym',   label: 'One special character (!@#$…)',   test: p => /[^A-Za-z0-9]/.test(p) },
];

const getStrength = (password) => {
  const passed = rules.filter(r => r.test(password)).length;
  if (passed <= 1) return { score: passed, label: 'Very Weak', color: '#ef4444' };
  if (passed === 2) return { score: passed, label: 'Weak',      color: '#f97316' };
  if (passed === 3) return { score: passed, label: 'Fair',      color: '#f59e0b' };
  if (passed === 4) return { score: passed, label: 'Strong',    color: '#22c55e' };
  return               { score: passed, label: 'Very Strong', color: '#10b981' };
};

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'citizen', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const strength = getStrength(form.password);
  const allPassed = rules.every(r => r.test(form.password));

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allPassed) {
      toast.error('Password does not meet security requirements');
      setShowRules(true);
      return;
    }
    setLoading(true);
    try {
      const res = await registerApi(form);
      login(res.data.token, res.data.user);
      toast.success('Account created! Welcome aboard');
      navigate(form.role === 'worker' ? '/worker' : '/citizen');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    background: 'var(--bg-800)', border: '1px solid var(--border)',
    borderRadius: '10px', color: '#f1f5f9', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'Poppins, sans-serif',
  };
  const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: 600,
    color: 'var(--text-3)', letterSpacing: '0.08em',
    textTransform: 'uppercase', marginBottom: '6px',
  };
  const onFocus = e => { e.target.style.borderColor = '#22c55e'; e.target.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.12)'; };
  const onBlur  = e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-900)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)', top: '-80px', left: '-80px', animation: 'float 7s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)', bottom: '-60px', right: '-60px', animation: 'float 9s ease-in-out infinite reverse', pointerEvents: 'none' }} />

      <div style={{
        width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1,
        opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '28px', textDecoration: 'none' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(34,197,94,0.4)', animation: 'glow 2s ease-in-out infinite' }}>
            <span style={{ fontSize: '18px', color: '#fff', fontWeight: 800 }}>N</span>
          </div>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 700, color: '#22c55e', letterSpacing: '0.05em' }}>NAGAR E-CONNECT</span>
        </Link>

        {/* Card */}
        <div style={{ background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: '20px', padding: '36px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '26px', fontWeight: 700, color: '#f1f5f9', marginBottom: '6px', letterSpacing: '-0.02em' }}>Create Account</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '28px' }}>Join the Swachh Bharat movement</p>

          <form onSubmit={handleSubmit} autoComplete="on">
            {/* Full Name */}
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Full Name</label>
              <input id="reg-name" name="name" type="text" autoComplete="name" placeholder="Enter your name"
                value={form.name} onChange={handleChange} onFocus={onFocus} onBlur={onBlur} required style={inputStyle} />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Email Address</label>
              <input id="reg-email" name="email" type="email" autoComplete="email" placeholder="you@example.com"
                value={form.email} onChange={handleChange} onFocus={onFocus} onBlur={onBlur} required style={inputStyle} />
            </div>

            {/* Phone */}
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Phone Number <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
              <input id="reg-phone" name="phone" type="tel" autoComplete="tel" placeholder="Enter phone number"
                value={form.phone} onChange={handleChange} onFocus={onFocus} onBlur={onBlur} style={inputStyle} />
            </div>

            {/* Role */}
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Register As</label>
              <select id="reg-role" name="role" value={form.role} onChange={handleChange} onFocus={onFocus} onBlur={onBlur}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="citizen">Citizen</option>
                <option value="worker">Municipal Worker</option>
              </select>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '8px' }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-password" name="password" type={showPass ? 'text' : 'password'}
                  autoComplete="new-password" placeholder="Create a strong password"
                  value={form.password}
                  onChange={e => { handleChange(e); setShowRules(true); }}
                  onFocus={() => setShowRules(true)}
                  onBlur={onBlur}
                  required
                  style={{ ...inputStyle, paddingRight: '44px', borderColor: form.password && !allPassed ? '#f97316' : allPassed && form.password ? '#22c55e' : 'var(--border)' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer',
                  fontSize: '16px', padding: '2px', transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#22c55e'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                  title={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Strength bar */}
            {form.password && (
              <div style={{ marginBottom: '12px', animation: 'fadeIn 0.2s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>Password strength</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: strength.color }}>{strength.label}</span>
                </div>
                <div style={{ height: '4px', background: 'var(--bg-600)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '99px',
                    width: `${(strength.score / 5) * 100}%`,
                    background: strength.color,
                    transition: 'width 0.3s ease, background 0.3s ease',
                    boxShadow: `0 0 8px ${strength.color}60`,
                  }} />
                </div>
              </div>
            )}

            {/* Rules checklist */}
            {showRules && (
              <div style={{
                marginBottom: '18px', padding: '12px 14px',
                background: 'var(--bg-800)', border: '1px solid var(--border)',
                borderRadius: '10px', animation: 'slideDown 0.25s ease',
              }}>
                {rules.map(r => {
                  const ok = r.test(form.password);
                  return (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '12px', transition: 'color 0.2s' }}>
                      <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', transition: 'transform 0.2s', transform: ok ? 'scale(1.2)' : 'scale(1)', color: ok ? '#22c55e' : 'var(--text-3)' }}>
                        {ok ? <FiCheckCircle size={14} /> : <FiCircle size={14} />}
                      </span>
                      <span style={{ color: ok ? '#22c55e' : 'var(--text-3)', fontWeight: ok ? 500 : 400 }}>{r.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading || !allPassed} style={{
              width: '100%', padding: '13px',
              background: allPassed ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'var(--bg-600)',
              color: allPassed ? '#000' : 'var(--text-3)',
              border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '15px',
              cursor: (loading || !allPassed) ? 'not-allowed' : 'pointer',
              transition: 'all 0.25s', fontFamily: 'Poppins, sans-serif',
              boxShadow: allPassed && !loading ? '0 4px 20px rgba(34,197,94,0.3)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
              onMouseEnter={e => { if (allPassed && !loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(34,197,94,0.45)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = allPassed && !loading ? '0 4px 20px rgba(34,197,94,0.3)' : 'none'; }}
            >
              {loading ? (
                <>
                  <div style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Creating account...
                </>
              ) : allPassed ? 'Create Account →' : 'Complete password requirements'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-3)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#22c55e', fontWeight: 600 }}>Sign in</Link>
          </div>
          <div style={{ marginTop: '10px', textAlign: 'center' }}>
            <Link to="/" style={{ fontSize: '12px', color: 'var(--text-3)' }}>← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
