import { useState, useEffect } from 'react';
import { getCatalog, getMyPoints, getTransactions, redeemReward } from '../../services/rewardService';
import toast from 'react-hot-toast';
import { FiStar, FiGift, FiClock } from 'react-icons/fi';
import styles from './Rewards.module.css';

const Rewards = () => {
  const [catalog, setCatalog] = useState([]);
  const [pointsData, setPointsData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);
  const [activeTab, setActiveTab] = useState('catalog');

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
      toast.success(`Redeemed "${item.name}" successfully! 🎉`);
      setLoading(true);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Redemption failed');
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper animate-fadeIn">
      <div className="page-header">
        <h1>🎁 Reward Marketplace</h1>
        <p>Redeem your points for amazing rewards</p>
      </div>

      {/* Points Banner */}
      <div className={styles.pointsBanner}>
        <div className={styles.bannerLeft}>
          <div className={styles.bannerIcon}><FiStar /></div>
          <div>
            <div className={styles.bannerPoints}>{pointsData?.current_points ?? 0}</div>
            <div className={styles.bannerLabel}>Available Points</div>
          </div>
        </div>
        <div className={styles.bannerStats}>
          <div className={styles.bStat}>
            <span className={styles.bStatVal}>{pointsData?.total_earned ?? 0}</span>
            <span className={styles.bStatLabel}>Total Earned</span>
          </div>
          <div className={styles.bDivider} />
          <div className={styles.bStat}>
            <span className={styles.bStatVal}>{pointsData?.total_redeemed ?? 0}</span>
            <span className={styles.bStatLabel}>Redeemed</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'catalog' ? styles.activeTab : ''}`} onClick={() => setActiveTab('catalog')}><FiGift /> Rewards Catalog</button>
        <button className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`} onClick={() => setActiveTab('history')}><FiClock /> Transaction History</button>
      </div>

      {activeTab === 'catalog' && (
        <div className={styles.catalogGrid}>
          {catalog.map(item => {
            const canAfford = (pointsData?.current_points ?? 0) >= item.points_required;
            return (
              <div key={item.id} className={`${styles.rewardCard} ${!canAfford ? styles.locked : ''}`}>
                <div className={styles.rewardEmoji}>
                  {item.category === 'Shopping' ? '🛍️' : item.category === 'Cashback' ? '💸' : item.category === 'Entertainment' ? '🎬' : item.category === 'Civic' ? '🏛️' : item.category === 'Transport' ? '🚌' : '🌱'}
                </div>
                <div className={styles.rewardCategory}>{item.category}</div>
                <h3 className={styles.rewardName}>{item.name}</h3>
                <p className={styles.rewardDesc}>{item.description}</p>
                <div className={styles.rewardFooter}>
                  <div className={styles.rewardPoints}><FiStar /> {item.points_required} pts</div>
                  <button
                    className={`btn ${canAfford ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                    onClick={() => canAfford && handleRedeem(item)}
                    disabled={!canAfford || redeeming === item.id}
                  >
                    {redeeming === item.id ? 'Redeeming...' : canAfford ? 'Redeem' : 'Not enough pts'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card">
          {transactions.length === 0 ? (
            <div className="empty-state"><span>📋</span><h3>No transactions yet</h3></div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Type</th><th>Description</th><th>Points</th><th>Date</th></tr></thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td><span className={`badge ${t.type === 'earned' ? 'badge-resolved' : 'badge-rejected'}`}>{t.type}</span></td>
                      <td>{t.description}</td>
                      <td style={{ fontWeight: 700, color: t.type === 'earned' ? 'var(--primary)' : 'var(--danger)' }}>
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
