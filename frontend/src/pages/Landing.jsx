import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Landing.module.css';

const features = [
  { icon: '📸', title: 'Report with Photo', desc: 'Upload images of garbage issues with one tap. Auto-detect your location.' },
  { icon: '🗺️', title: 'Live Map Tracking', desc: 'See all reported complaints on an interactive map. Track resolution in real time.' },
  { icon: '🎁', title: 'Earn Rewards', desc: 'Get points for every verified complaint. Redeem for vouchers and civic benefits.' },
  { icon: '⚡', title: 'Fast Resolution', desc: 'Complaints are assigned to nearest workers. Track status: Pending → In Progress → Resolved.' },
  { icon: '👷', title: 'Worker Navigation', desc: 'Municipal workers get GPS navigation to complaints. Bonus for top performers.' },
  { icon: '📊', title: 'Admin Dashboard', desc: 'Real-time analytics, worker performance, and city-wide complaint management.' },
];

const stats = [
  { value: '50K+', label: 'Complaints Resolved' },
  { value: '12K+', label: 'Active Citizens' },
  { value: '800+', label: 'Municipal Workers' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const Landing = () => {
  const { user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/login';
    return user.role === 'admin' ? '/admin' : user.role === 'worker' ? '/worker' : '/citizen';
  };

  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <span className={styles.navLogoIcon}>🌿</span>
          <span className={styles.navLogoText}>Nagar <span>e-Connect</span></span>
        </div>
        <div className={styles.navActions}>
          {user ? (
            <Link to={getDashboardLink()} className="btn btn-primary">Dashboard →</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Sign In</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>🇮🇳 &nbsp;Swachh Bharat Initiative</div>
          <h1 className={styles.heroTitle}>
            Report. Track. <span className={styles.heroAccent}>Resolve.</span>
          </h1>
          <p className={styles.heroDesc}>
            Nagar e-Connect bridges citizens and municipal workers. Report garbage issues, track resolution in real time, and earn rewards for keeping your city clean.
          </p>
          <div className={styles.heroActions}>
            <Link to="/register" className={`btn btn-primary btn-lg ${styles.heroCta}`}>
              🚀 Start Reporting Free
            </Link>
            <Link to="/login" className="btn btn-ghost btn-lg">
              Sign In
            </Link>
          </div>
        </div>

        {/* Floating cards */}
        <div className={styles.heroCards}>
          <div className={`${styles.floatCard} ${styles.card1}`}>
            <span>🗑️</span>
            <div>
              <div className={styles.floatTitle}>Issue Reported</div>
              <div className={styles.floatSub}>Sector 14, Mumbai</div>
            </div>
            <span className="badge badge-pending">Pending</span>
          </div>
          <div className={`${styles.floatCard} ${styles.card2}`}>
            <span>👷</span>
            <div>
              <div className={styles.floatTitle}>Worker Assigned</div>
              <div className={styles.floatSub}>ETA: 45 mins</div>
            </div>
            <span className="badge badge-in_progress">Active</span>
          </div>
          <div className={`${styles.floatCard} ${styles.card3}`}>
            <span>🎁</span>
            <div>
              <div className={styles.floatTitle}>+20 Points Earned</div>
              <div className={styles.floatSub}>Complaint Resolved!</div>
            </div>
            <span className="badge badge-resolved">Done</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.statsSection}>
        {stats.map((s, i) => (
          <div key={i} className={styles.statItem}>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Everything you need to keep cities clean</h2>
          <p className={styles.sectionDesc}>A complete platform for citizens, workers, and administrators</p>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaGlow} />
        <h2 className={styles.ctaTitle}>Ready to make a difference?</h2>
        <p className={styles.ctaDesc}>Join thousands of citizens making Indian cities cleaner, one report at a time.</p>
        <Link to="/register" className={`btn btn-primary btn-lg ${styles.ctaBtn}`}>
          Join Nagar e-Connect →
        </Link>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>🌿 Nagar e-Connect</span>
        <span>© 2024 — Built for Clean Cities</span>
      </footer>
    </div>
  );
};

export default Landing;
