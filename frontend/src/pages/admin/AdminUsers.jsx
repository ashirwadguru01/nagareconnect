import { useState, useEffect } from 'react';
import { getUsers, toggleUser, changeRole } from '../../services/adminService';
import toast from 'react-hot-toast';
import { FiSearch, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = () => getUsers().then(r => setUsers(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleToggle = async (id) => {
    try { await toggleUser(id); toast.success('User status updated'); load(); }
    catch { toast.error('Failed to update status'); }
  };

  const handleRole = async (id, role) => {
    try { await changeRole(id, role); toast.success('Role updated'); load(); }
    catch { toast.error('Failed to update role'); }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper animate-fadeIn">
      <div className="page-header">
        <h1>User Management</h1>
        <p>{users.length} registered users</p>
      </div>

      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '36px' }} />
          </div>
          <select className="form-select" style={{ width: 'auto', minWidth: '130px' }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="citizen">Citizens</option>
            <option value="worker">Workers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead><tr><th>User</th><th>Role</th><th>Points</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select className="form-select" style={{ width: 'auto', padding: '4px 8px', fontSize: '12px' }} value={u.role} onChange={e => handleRole(u.id, e.target.value)}>
                      <option value="citizen">Citizen</option>
                      <option value="worker">Worker</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{u.points}</td>
                  <td><span className={`badge ${u.is_active ? 'badge-resolved' : 'badge-rejected'}`}>{u.is_active ? 'Active' : 'Disabled'}</span></td>
                  <td style={{ fontSize: '12px' }}>{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                  <td>
                    <button className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-ghost'}`} onClick={() => handleToggle(u.id)}>
                      {u.is_active ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
