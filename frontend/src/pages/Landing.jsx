import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Landing.module.css';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after mount
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={styles.root}>
      {/* ── Top Header ── */}
      <header className={styles.header}>
        <div className={styles.headerBrand}>
          <div className={styles.dot} style={{ width: 8, height: 8 }} />
          <span style={{ fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.02em', fontSize: '15px' }}>Nagar e-Connect</span>
        </div>
      </header>

      {/* Subtle grid background */}
      <div className={styles.grid} />

      {/* Corner glow */}
      <div className={styles.glow} />

      {/* Centre content */}
      <div className={`${styles.center} ${visible ? styles.visible : ''}`}>
        {/* Badge */}
        <div className={styles.badge}>
          <span className={styles.dot} />
          Swachh Bharat Initiative
        </div>

        {/* Main title */}
        <h1 className={styles.title}>
          <span className={styles.titleLine1}>Nagar</span>
          <span className={styles.titleLine2}>e-Connect</span>
        </h1>

        {/* Tagline */}
        <p className={styles.tagline}>
          Report garbage · Track resolution · Earn rewards
        </p>

        {/* Sign in button */}
        <div className={styles.actions}>
          <Link to="/login" className={styles.signinBtn}>Sign In</Link>
          <Link to="/register" className={styles.registerLink}>Create account</Link>
        </div>

        {/* Footer hint */}
        <div className={styles.hint}>
          स्वच्छ नगर · स्वस्थ जीवन
        </div>
      </div>
    </div>
  );
};

export default Landing;
