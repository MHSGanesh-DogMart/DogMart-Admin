import React, { useEffect, useState } from 'react';
import TopBar from '../components/Layout/TopBar';
import api from '../utils/api';
import { Search, Crown, X, Calendar, Activity, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SubModal = ({ sub, onClose, onCancel }) => {
    const [cancelling, setCancelling] = useState(false);

    const handleCancel = async () => {
        if (!confirm('Cancel this subscription?')) return;
        setCancelling(true);
        try {
            await api.patch(`/subscriptions/${sub.id}/status`, { status: 'cancelled' });
            onCancel(sub.id);
            onClose();
        } catch (e) {
            alert('Failed to cancel subscription');
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 500 }}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Crown size={20} />
                        </div>
                        <div>
                            <h2 className="modal-title">Subscription Details</h2>
                            <div style={{ fontSize: 13, color: 'var(--text3)' }}>{sub.planName} Plan</div>
                        </div>
                    </div>
                    <button className="modal-close" onClick={onClose}><X size={18} /></button>
                </div>

                <div className="grid-2" style={{ marginBottom: 20, marginTop: 20 }}>
                    <div className="card-sm">
                        <div className="text-xs text-muted">User ID</div>
                        <div style={{ marginTop: 4, fontWeight: 700 }}>{sub.userId}</div>
                    </div>
                    <div className="card-sm">
                        <div className="text-xs text-muted">Amount</div>
                        <div style={{ marginTop: 4, fontWeight: 700 }}>₹{sub.amount}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    {sub.status === 'active' && (
                        <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling} style={{ flex: 1, justifyContent: 'center' }}>
                            Cancel Access
                        </button>
                    )}
                    <button className="btn btn-outline" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default function Subscriptions() {
    const [subs, setSubs] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [stats, setStats] = useState({ activeCount: 0, mrr: 0 });
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        setLoading(true);
        try {
            const status = filter === 'all' ? '' : filter;
            const [subsRes, statsRes] = await Promise.all([
                api.get(`/subscriptions?status=${status}`),
                api.get('/subscriptions/stats/mrr')
            ]);
            setSubs(subsRes.data.subscriptions || []);
            setFiltered(subsRes.data.subscriptions || []);
            setStats(statsRes.data);
        } catch (e) {
            console.error('Failed to fetch subscriptions:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, [filter]);

    useEffect(() => {
        const r = subs.filter(s => s.userId?.toString().includes(search));
        setFiltered(r);
    }, [search, subs]);

    return (
        <div>
            <TopBar title="Subscriptions" />
            <div className="page-content">
                <div className="page-header">
                    <div><h2 className="page-title">Premium Access</h2><p className="page-subtitle">Manage paid subscriptions and platform revenue.</p></div>
                </div>

                <div className="grid-2" style={{ marginBottom: 24 }}>
                    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Activity size={24} color="#22c55e" />
                        </div>
                        <div>
                            <div className="text-muted text-sm">Active Subscribers</div>
                            <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.activeCount}</div>
                        </div>
                    </div>
                    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Crown size={24} color="#8b5cf6" />
                        </div>
                        <div>
                            <div className="text-muted text-sm">Monthly MRR</div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: '#8b5cf6' }}>₹{stats.mrr.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                    <div className="search-bar" style={{ flex: 1, minWidth: 280, maxWidth: 400 }}>
                        <Search size={15} />
                        <input placeholder="Search User ID..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="tabs">
                        {['all', 'active', 'expired', 'cancelled'].map(f => (
                            <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? <div className="loading-center"><div className="spinner" /></div> : (
                    <div className="table-wrapper">
                        <table>
                            <thead><tr><th>User ID</th><th>Plan</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={4}><div className="empty-state"><Calendar size={32} /><h3>No subscriptions found</h3></div></td></tr>
                                ) : filtered.map(s => (
                                    <tr key={s.id}>
                                        <td>{s.userId}</td>
                                        <td style={{ fontWeight: 600 }}>{s.planName} (₹{s.amount})</td>
                                        <td><span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{s.status}</span></td>
                                        <td><button className="btn btn-outline btn-sm" onClick={() => setSelected(s)}>View Details</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {selected && <SubModal sub={selected} onClose={() => setSelected(null)} onCancel={refresh} />}
        </div>
    );
}
