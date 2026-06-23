import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/authService';
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiSave, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Field = ({ icon, label, type = 'text', value, onChange, placeholder, disabled }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      {label}
    </label>
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: 8,
      padding: '0 12px', transition: 'border-color 0.15s, background 0.3s ease',
    }}
      onFocus={e => e.currentTarget.style.borderColor = '#22c55e55'}
      onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>{icon}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="profile-input"
        style={{
          flex: 1, background: 'none', border: 'none', outline: 'none',
          color: disabled ? 'var(--text-secondary)' : 'var(--text-primary)',
          fontSize: 13, padding: '11px 0',
          cursor: disabled ? 'not-allowed' : 'text',
          fontFamily: 'Poppins, sans-serif'
        }}
      />
    </div>
  </div>
);

const ProfileModal = ({ onClose }) => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name:    user?.name    || '',
    email:   user?.email   || '',
    phone:   user?.phone   || '',
    address: user?.address || '',
    dob:     user?.dob     ? user.dob.split('T')[0] : '',
  });
  const [saving, setSaving]   = useState(false);
  const [saved,  setSaved]    = useState(false);

  // trap Escape
  useEffect(() => {
    const h = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const res = await updateProfile(form);
      updateUser(res.data);
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 1200);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const roleColor = user?.role === 'admin' ? '#f59e0b'
    : user?.role === 'worker' ? '#3b82f6' : '#22c55e';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 300,
          animation: 'fadeIn 0.18s ease',
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(440px, 94vw)',
        background: 'var(--bg-800)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        zIndex: 301,
        animation: 'slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        fontFamily: 'Poppins, sans-serif',
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-900)',
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Avatar */}
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              border: `2px solid ${roleColor}`,
              background: `${roleColor}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700, fontFamily: 'Poppins,sans-serif',
              color: roleColor,
              boxShadow: `0 0 16px ${roleColor}40`,
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: 'Poppins,sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                Edit Profile
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                {user?.role} · member since {new Date(user?.created_at || Date.now()).getFullYear()}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: 8,
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef444444'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <FiX size={15} />
          </button>
        </div>

        {/* Fields */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field icon={<FiUser size={14} />}     label="Full Name"    value={form.name}    onChange={set('name')}    placeholder="Your full name" />
          <Field icon={<FiMail size={14} />}     label="Email"        value={form.email}   onChange={set('email')}   placeholder="your@email.com" type="email" />
          <Field icon={<FiPhone size={14} />}    label="Phone Number" value={form.phone}   onChange={set('phone')}   placeholder="+91 XXXXX XXXXX" />
          <Field icon={<FiMapPin size={14} />}   label="Address"      value={form.address} onChange={set('address')} placeholder="Street, City, State" />
          <Field icon={<FiCalendar size={14} />} label="Date of Birth" value={form.dob}    onChange={set('dob')}    type="date" />

          {/* Role badge — read only */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: 8, transition: 'background 0.3s ease' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Role</span>
            <span style={{
              marginLeft: 'auto',
              fontSize: 11, fontWeight: 700, padding: '3px 10px',
              borderRadius: 6, textTransform: 'capitalize',
              background: `${roleColor}18`, color: roleColor,
              border: `1px solid ${roleColor}30`,
            }}>{user?.role}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          background: 'var(--bg-900)',
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 18px', borderRadius: 8, background: 'var(--bg-700)',
              border: '1px solid var(--border)', color: 'var(--text-secondary)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            style={{
              padding: '9px 22px', borderRadius: 8,
              background: saved ? '#16a34a' : 'linear-gradient(135deg,#22c55e,#16a34a)',
              border: 'none', color: '#000',
              fontSize: 13, fontWeight: 700,
              cursor: saving ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 7,
              transition: 'opacity 0.15s, transform 0.15s',
              opacity: saving ? 0.7 : 1,
              boxShadow: '0 4px 14px rgba(34,197,94,0.35)',
            }}
            onMouseEnter={e => !saving && (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {saved ? <FiCheckCircle size={14} /> : <FiSave size={14} />}
            {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%,-46%) scale(0.96); } to { opacity: 1; transform: translate(-50%,-50%) scale(1); } }
        /* invert icon in dark mode, keep original in light mode */
        html[data-theme="light"] input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0); cursor: pointer; }
        html:not([data-theme="light"]) input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.4); cursor: pointer; }
      `}</style>
    </>
  );
};

export default ProfileModal;
