import React, { useEffect, useState } from 'react';
import TopBar from '../components/Layout/TopBar';
import { db } from '../firebase/config';
import { collection, getDocs, orderBy, query, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Search, Crown, X, Calendar, Activity, XCircle } from 'lucide-react';

const statusBadge = (s) => {
    const map = { active: 'badge-success', expired: 'badge-warning', cancelled: 'badge-danger' };
    return <span className="badge">{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Unknown'}</span>;
};

function SubModal({ sub, onClose, onCancel }) {
    const [cancelling, setCancelling] = useState(false);

    const handleCancel = async () => {
        if (!confirm('Cancel this subscription? The user will immediately lose Premium access.')) return;
        setCancelling(true);
        try {
            await updateDoc(doc(db, 'subscriptions', sub.id), {
                status: 'cancelled',
                cancelledAt: serverTimestamp(),
            });
            // Also need to remove isPremium from user document
            if (sub.userId) {
                await updateDoc(doc(db, 'users', sub.userId), { isPremium: false });
            }
            onCancel(sub.id);
            onClose();
        } catch (e) {
            console.error(e);
            alert('Failed to cancel subscription.');
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 500 }}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-light)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Crown size={20} />
                        </div>
                        <div>
                            <h2 className="modal-title">Subscription Details</h2>
                            <div style={{ fontSize: 13, color: 'var(--text3)' }}>Plan: ₹{sub.amount}/month</div>
                        </div>
                    </div>
                    <button className="modal-close" onClick={onClose}><X size={18} /></button>
                </div>

                <div className="grid-2" style={{ marginBottom: 20 }}>
                    <div className="card-sm">
                        <div className="text-xs text-muted">User ID</div>
                        <div style={{ marginTop: 4, fontWeight: 600, fontSize: 12, wordBreak: 'break-all' }}>{sub.userId || ' '}</div>
                    </div>
                    <div className="card-sm">
                        <div className="text-xs text-muted">Current Status</div>
                        <div style={{ marginTop: 4 }}>{statusBadge(sub.status)}</div>
                    </div>
                </div>

                <div className="grid-2" style={{ marginBottom: 20 }}>
                    <div className="card-sm">
                        <div className="text-xs text-muted">Started On</div>
                        <div style={{ marginTop: 4, fontWeight: 600 }}>{sub.startDate?.toDate?.() ? sub.startDate.toDate().toLocaleDateString('en-IN') : ' '}</div>
                    </div>
                    <div className="card-sm">
                        <div className="text-xs text-muted">Valid Until</div>
                        <div style={{ marginTop: 4, fontWeight: 600 }}>{sub.endDate?.toDate?.() ? sub.endDate.toDate().toLocaleDateString('en-IN') : ' '}</div>
                    </div>
                </div>

                <div className="card-sm" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="text-xs text-muted">Payment Reference</span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{sub.paymentId || ' '}</span>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    {sub.status === 'active' && (
                        <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling} style={{ flex: 1, justifyContent: 'center' }}>
                            <XCircle size={15} /> Cancel Access
                        </button>
                    )}
                    <button className="btn btn-outline" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Close</button>
                </div>
            </div>
        </div>
    );
}

export default function Subscriptions() {
    const [subs, setSubs] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('active');
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDocs(query(collection(db, 'subscriptions'), orderBy('startDate', 'desc')))
            .then(snap => {
                const s = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setSubs(s);
                setFiltered(s.filter(b => b.status === 'active'));
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let res = subs;
        if (filter !== 'all') {
            res = res.filter(s => s.status === filter);
        }
        if (search) res = res.filter(s => (s.userId || '').includes(search) || (s.paymentId || '').includes(search));
        setFiltered(res);
    }, [search, filter, subs]);

    const activeCount = subs.filter(s => s.status === 'active').length;
    const monthlyRev = subs.filter(s => s.status === 'active').reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

    const handleCancelSub = (id) => {
        setSubs(prev => prev.map(s => s.id === id ? { ...s, status: 'cancelled' } : s));
    };

    return (
        <div>
            <TopBar title="Subscriptions" />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Premium Subscriptions</h2>
                        <p className="page-subtitle">Track active paid members, track revenue, and manage access.</p>
                    </div>
                </div>

                <div className="grid-2" style={{ marginBottom: 24 }}>
                    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Activity size={24} color="#22c55e" />
                        </div>
                        <div>
                            <div className="text-muted text-sm">Active Subscribers</div>
                            <div style={{ fontSize: 24, fontWeight: 700 }}>{activeCount}</div>
                        </div>
                    </div>
                    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Crown size={24} color="#8b5cf6" />
                        </div>
                        <div>
                            <div className="text-muted text-sm">Monthly MRR</div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: '#8b5cf6' }}>₹{monthlyRev.toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                    <div className="search-bar" style={{ flex: 1, minWidth: 280, maxWidth: 400 }}>
                        <Search size={15} />
                        <input placeholder="Search User ID or Payment ID..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="tabs">
                        {['active', 'expired', 'cancelled', 'all'].map(f => (
                            <button key={f} className="tab" onClick={() => setFilter(f)}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? <div className="loading-center"><div className="spinner" /></div> : (
                    <div className="table-wrapper">
                        <table>
                            <thead><tr>
                                <th>User ID</th><th>Plan</th><th>Validity</th><th>Status</th><th>Action</th>
                            </tr></thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={5}><div className="empty-state"><Calendar size={32} /><h3>No subscriptions found</h3></div></td></tr>
                                ) : filtered.map(s => (
                                    <tr key={s.id}>
                                        <td style={{ fontSize: 12, color: 'var(--text2)' }}>{s.userId?.substring(0, 10)}...</td>
                                        <td style={{ fontWeight: 600 }}>₹{s.amount}/mo</td>
                                        <td>
                                            <div style={{ fontSize: 12 }}>
                                                {s.startDate?.toDate?.() ? s.startDate.toDate().toLocaleDateString('en-IN') : ' '}
                                                <span style={{ margin: '0 4px', color: 'var(--text3)' }}>-</span>
                                                {s.endDate?.toDate?.() ? s.endDate.toDate().toLocaleDateString('en-IN') : ' '}
                                            </div>
                                        </td>
                                        <td>{statusBadge(s.status)}</td>
                                        <td>
                                            <button className="btn btn-outline btn-sm" onClick={() => setSelected(s)}>
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {selected && <SubModal sub={selected} onClose={() => setSelected(null)} onCancel={handleCancelSub} />}
        </div>
    );
}
