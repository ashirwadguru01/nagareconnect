import { useState, useEffect } from 'react';
import { getCatalog, getMyPoints, getTransactions, redeemReward } from '../../services/rewardService';
import toast from 'react-hot-toast';
import { FiStar, FiSearch, FiGrid, FiClock } from 'react-icons/fi';

// Real Unsplash images per category
const cardDesigns = {
  Shopping:      {
    bg: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #1565c0 100%)',
    accent: '#90caf9',
    img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80',
  },
  Cashback:      {
    bg: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)',
    accent: '#a5d6a7',
    img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80',
  },
  Entertainment: {
    bg: 'linear-gradient(135deg, #4a148c 0%, #6a1b9a 50%, #7b1fa2 100%)',
    accent: '#ce93d8',
    img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80',
  },
  Civic:         {
    bg: 'linear-gradient(135deg, #bf360c 0%, #d84315 50%, #e64a19 100%)',
    accent: '#ffccbc',
    img: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80',
  },
  Environment:   {
    bg: 'linear-gradient(135deg, #33691e 0%, #558b2f 50%, #689f38 100%)',
    accent: '#dcedc8',
    img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80',
  },
  Transport:     {
    bg: 'linear-gradient(135deg, #e65100 0%, #f57c00 50%, #fb8c00 100%)',
    accent: '#ffe0b2',
    img: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&q=80',
  },
};

const categories = ['All', 'Shopping', 'Cashback', 'Entertainment', 'Civic', 'Environment', 'Transport'];

const GiftCard = ({ item, canAfford, redeeming, onRedeem }) => {
  const design = cardDesigns[item.category] || cardDesigns.Shopping;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column',
        borderRadius: '14px', overflow: 'hidden',
        border: hovered ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.06)',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: hovered ? '0 16px 40px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        opacity: canAfford ? 1 : 0.75,
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      {/* Card image area */}
      <div style={{
        position: 'relative',
        height: '160px',
        overflow: 'hidden',
      }}>
        {/* Real photo background */}
        <img
          src={design.img}
          alt={item.category}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.4s ease',
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
            display: 'block',
          }}
          onError={e => { e.target.style.display = 'none'; e.target.parentNode.style.background = design.bg; }}
        />
        {/* Dark overlay for text readability */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%)',
        }} />

        {/* Category chip */}
        <div style={{
          position: 'absolute', top: '12px', left: '12px',
          display: 'inline-flex', alignItems: 'center',
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
          padding: '3px 10px', borderRadius: '999px',
          fontSize: '9px', fontWeight: 700, color: design.accent,
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          {item.category}
        </div>
      </div>

      {/* Card info */}
      <div style={{
        background: '#161b23',
        padding: '14px 16px',
        flex: 1, display: 'flex', flexDirection: 'column', gap: '6px',
      }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: design.accent, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {item.category}
        </div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9', lineHeight: 1.3, fontFamily: 'Poppins, sans-serif' }}>
          {item.name}
        </div>
        <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4, flex: 1 }}>
          {item.description}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f59e0b', fontWeight: 700, fontSize: '13px' }}>
            <FiStar style={{ fill: '#f59e0b' }} />
            {item.points_required} pts
          </div>
          <button
            onClick={() => canAfford && onRedeem(item)}
            disabled={!canAfford || redeeming === item.id}
            style={{
              padding: '5px 14px',
              background: canAfford ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(255,255,255,0.06)',
              color: canAfford ? '#000' : '#475569',
              border: 'none', borderRadius: '8px',
              fontSize: '11px', fontWeight: 700, cursor: canAfford ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            {redeeming === item.id ? '...' : canAfford ? 'Redeem' : 'Not enough pts'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Rewards = () => {
  const [catalog, setCatalog] = useState([]);
  const [pointsData, setPointsData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);
  const [activeTab, setActiveTab] = useState('catalog');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  const loadData = () =>
    Promise.all([getCatalog(), getMyPoints(), getTransactions()])
      .then(([c, p, t]) => { setCatalog(c.data); setPointsData(p.data); setTransactions(t.data); })
      .finally(() => setLoading(false));

  useEffect(() => { loadData(); }, []);

  const handleRedeem = async (item) => {
    if (!window.confirm(`Redeem "${item.name}" for ${item.points_required} points?`)) return;
    setRedeeming(item.id);
    try {
      await redeemReward(item.id);
      toast.success(`Redeemed "${item.name}" successfully!`);
      setLoading(true);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Redemption failed');
    } finally {
      setRedeeming(null);
    }
  };

  const filtered = catalog
    .filter(i => selectedCategory === 'All' || i.category === selectedCategory)
    .filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.description?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1400px', animation: 'pageFadeIn 0.4s ease', fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px', fontFamily: 'Poppins, sans-serif' }}>
          Reward Marketplace
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>Redeem your points for amazing rewards</p>
      </div>

      {/* Points Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f1a0f 0%, #0d1f18 50%, #0a1628 100%)',
        border: '1px solid rgba(34,197,94,0.2)',
        borderRadius: '16px', padding: '20px 28px', marginBottom: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 0 40px rgba(34,197,94,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))',
            border: '1px solid rgba(34,197,94,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'glow 2s ease-in-out infinite',
          }}>
            <FiStar size={22} color="#22c55e" style={{ fill: '#22c55e' }} />
          </div>
          <div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#f1f5f9', lineHeight: 1, fontFamily: 'Poppins, sans-serif' }}>
              {pointsData?.current_points ?? 0}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Available Points
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '40px' }}>
          {[['Total Earned', pointsData?.total_earned ?? 0], ['Redeemed', pointsData?.total_redeemed ?? 0]].map(([label, val]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#f1f5f9', fontFamily: 'Poppins, sans-serif' }}>{val}</div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0' }}>
        {[['catalog', 'Rewards Catalog'], ['history', 'Transaction History']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            padding: '10px 20px', border: 'none', cursor: 'pointer',
            background: activeTab === id ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'transparent',
            color: activeTab === id ? '#000' : '#64748b',
            borderRadius: '10px 10px 0 0', fontSize: '13px', fontWeight: 600,
            fontFamily: 'Poppins, sans-serif', transition: 'all 0.2s',
            marginBottom: '-1px',
            borderBottom: activeTab === id ? 'none' : '1px solid transparent',
          }}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'catalog' && (
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* Left sidebar - categories */}
          <div style={{ width: '180px', flexShrink: 0 }}>
            <div style={{ background: '#161b23', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Categories
              </div>
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 12px', borderRadius: '8px', border: 'none',
                  background: selectedCategory === cat ? 'rgba(34,197,94,0.12)' : 'transparent',
                  color: selectedCategory === cat ? '#22c55e' : '#94a3b8',
                  fontSize: '13px', fontWeight: selectedCategory === cat ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.15s', marginBottom: '2px',
                  fontFamily: 'Poppins, sans-serif',
                  borderLeft: selectedCategory === cat ? '2px solid #22c55e' : '2px solid transparent',
                }}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Points guide */}
            <div style={{ background: '#161b23', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Earn Points
              </div>
              {[['Submit complaint', '+5 pts'], ['Resolved', '+20 pts']].map(([a, b]) => (
                <div key={a} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', fontFamily: 'Poppins, sans-serif' }}>
                  <span style={{ color: '#64748b' }}>{a}</span>
                  <span style={{ color: '#22c55e', fontWeight: 700 }}>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main grid */}
          <div style={{ flex: 1 }}>
            {/* Search bar */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <FiSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input
                type="text" placeholder="Search rewards..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px 10px 40px',
                  background: '#161b23', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none',
                  fontFamily: 'Poppins, sans-serif', transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#22c55e'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            {/* Results count */}
            <div style={{ fontSize: '12px', color: '#475569', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Poppins, sans-serif' }}>
              <FiGrid /> {filtered.length} reward{filtered.length !== 1 ? 's' : ''} found
            </div>

            {/* Gift card grid */}
            {filtered.length === 0 ? (
              <div className="empty-state">
                <h3>No rewards found</h3>
                <p>Try a different category or search term</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {filtered.map((item, i) => (
                  <div key={item.id} style={{ animation: `slideUp 0.35s ease ${i * 60}ms both` }}>
                    <GiftCard
                      item={item}
                      canAfford={(pointsData?.current_points ?? 0) >= item.points_required}
                      redeeming={redeeming}
                      onRedeem={handleRedeem}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card animate-fadeIn">
          {transactions.length === 0 ? (
            <div className="empty-state">
              <FiClock size={40} color="#374151" />
              <h3>No transactions yet</h3>
              <p>Redeem rewards to see your history</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Type</th><th>Description</th><th>Points</th><th>Date</th></tr></thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td><span className={`badge ${t.type === 'earned' ? 'badge-resolved' : 'badge-rejected'}`}>{t.type}</span></td>
                      <td>{t.description}</td>
                      <td style={{ fontWeight: 700, color: t.type === 'earned' ? '#22c55e' : '#ef4444' }}>
                        {t.type === 'earned' ? '+' : '-'}{t.points}
                      </td>
                      <td>{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Rewards;
