import React, { useEffect, useState } from 'react';
import TopBar from '../components/Layout/TopBar';
import api from '../utils/api';
import { Search, X, ShieldCheck, ShieldOff, Eye, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserModal = ({ user, onClose, onToggleBlock }) => {
    const [blocking, setBlocking] = useState(false);

    const handleBlock = async () => {
        setBlocking(true);
        try {
            await api.patch(`/users/${user.id}/status`, { isBlocked: !user.isBlocked });
            onToggleBlock(user.id, !user.isBlocked);
            onClose();
        } catch (e) {
            alert('Failed to update status');
        } finally {
            setBlocking(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: '50%',
                            background: 'var(--primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}><User size={20} color="white" /></div>
                        <div>
                            <h2 className="modal-title">{user.name || 'User'}</h2>
                            <div style={{ fontSize: 13, color: 'var(--text3)' }}>{user.email}</div>
                        </div>
                    </div>
                    <button className="modal-close" onClick={onClose}><X size={18} /></button>
                </div>

                <div className="grid-2" style={{ marginBottom: 24, marginTop: 20 }}>
                    <div className="card-sm">
                        <div className="text-xs text-muted">Status</div>
                        <div style={{ marginTop: 4, fontWeight: 700 }}>
                            {user.isBlocked ? '🚫 Blocked' : '✅ Active'}
                        </div>
                    </div>
                    <div className="card-sm">
                        <div className="text-xs text-muted">Phone</div>
                        <div style={{ marginTop: 4, fontWeight: 700 }}>{user.phone || '—'}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <button className={`btn ${user.isBlocked ? 'btn-success' : 'btn-danger'}`} onClick={handleBlock} disabled={blocking} style={{ flex: 1, justifyContent: 'center' }}>
                        {user.isBlocked ? 'Unblock User' : 'Block User'}
                    </button>
                    <button className="btn btn-outline" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default function Users() {
    const [users, setUsers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users');
            setUsers(res.data.users || []);
            setFiltered(res.data.users || []);
        } catch (e) {
            console.error('Failed to fetch users:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const onToggleBlock = (id, isBlocked) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, isBlocked } : u));
    };

    useEffect(() => {
        let res = users;
        if (filter === 'blocked') res = res.filter(u => u.isBlocked);
        if (filter === 'active') res = res.filter(u => !u.isBlocked);
        if (search) res = res.filter(u => (u.name || '').toLowerCase().includes(search.toLowerCase()) || (u.phone || '').includes(search));
        setFiltered(res);
    }, [search, filter, users]);

    return (
        <div>
            <TopBar title="User Management" />
            <div className="page-content">
                <div className="page-header">
                    <div><h2 className="page-title">Platform Users</h2><p className="page-subtitle">Manage accounts and platform access.</p></div>
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                    <div className="search-bar" style={{ flex: 1, minWidth: 280, maxWidth: 400 }}>
                        <Search size={15} />
                        <input placeholder="Search name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="tabs">
                        {['all', 'active', 'blocked'].map(f => (
                            <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? <div className="loading-center"><div className="spinner" /></div> : (
                    <div className="table-wrapper">
                        <table>
                            <thead><tr><th>Name</th><th>Email/Phone</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={4}><div className="empty-state"><User size={32} /><h3>No users found</h3></div></td></tr>
                                ) : filtered.map(u => (
                                    <tr key={u.id}>
                                        <td style={{ fontWeight: 600 }}>{u.name || 'Unknown'}</td>
                                        <td>
                                            <div style={{ fontSize: 13 }}>{u.email}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{u.phone}</div>
                                        </td>
                                        <td><span className={`badge ${u.isBlocked ? 'badge-danger' : 'badge-success'}`}>{u.isBlocked ? 'Blocked' : 'Active'}</span></td>
                                        <td><button className="btn btn-outline btn-sm" onClick={() => setSelected(u)}>View Profile</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {selected && <UserModal user={selected} onClose={() => setSelected(null)} onToggleBlock={onToggleBlock} />}
        </div>
    );
}
