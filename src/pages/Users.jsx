import React, { useEffect, useState } from 'react';
import TopBar from '../components/Layout/TopBar';
import { db } from '../firebase/config';
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { Search, X, ShieldCheck, ShieldOff, Eye, User } from 'lucide-react';

const statusBadge = (u) => {
    if (u.isBlocked) return <span className="badge badge-danger">🚫 Blocked</span>;
    return <span className="badge badge-success">✅ Active</span>;
};

function UserModal({ user, onClose, onToggleBlock }) {
    const [listings, setListings] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [blocking, setBlocking] = useState(false);

    useEffect(() => {
        const load = async () => {
            const [lSnap, rSnap] = await Promise.all([
                getDocs(query(collection(db, 'listings'), where('sellerId', '==', user.id))),
                getDocs(query(collection(db, 'reviews'), where('reviewerId', '==', user.id))),
            ]);
            setListings(lSnap.docs.map(d => ({ id: d.id, ...d.data() })));
            setReviews(rSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        };
        load();
    }, [user.id]);

    const handleBlock = async () => {
        setBlocking(true);
        await updateDoc(doc(db, 'users', user.id), { isBlocked: !user.isBlocked });
        onToggleBlock(user.id, !user.isBlocked);
        setBlocking(false);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}><User size={20} color="white" /></div>
                        <div>
                            <h2 className="modal-title">{user.name || 'Unknown'}</h2>
                            <div style={{ fontSize: 13, color: 'var(--text3)' }}>{user.phone}</div>
                        </div>
                    </div>
                    <button className="modal-close" onClick={onClose}><X size={18} /></button>
                </div>

                {user.profilePhoto && (
                    <div style={{ marginBottom: 20 }}>
                        <div className="form-label" style={{ marginBottom: 8 }}>Profile Photo</div>
                        <img src={user.profilePhoto} alt="profile" style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', border: '2px solid var(--border)' }} />
                    </div>
                )}

                <div className="grid-2" style={{ marginBottom: 20 }}>
                    <div className="card-sm">
                        <div className="text-xs text-muted">Subscription Plan</div>
                        <div style={{ marginTop: 4, fontWeight: 600, color: user.isPremium ? 'var(--primary-light)' : 'var(--text)' }}>
                            {user.isPremium ? '💎 Premium' : 'Free Plan'}
                        </div>
                    </div>
                    <div className="card-sm">
                        <div className="text-xs text-muted">Member Since</div>
                        <div style={{ marginTop: 4, fontWeight: 600 }}>
                            {user.createdAt?.toDate?.() ? user.createdAt.toDate().toLocaleDateString('en-IN') : '—'}
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 700, marginBottom: 12 }}>Their Listings ({listings.length})</div>
                    {listings.length === 0 ? <div className="text-sm text-muted">No listings yet</div> : listings.slice(0, 5).map(l => (
                        <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                            <span>{l.breed || 'Dog'}</span>
                            <span className="text-muted">{l.price === 0 ? 'Free' : `₹${l.price}`}</span>
                        </div>
                    ))}
                </div>

                <div style={{ marginBottom: 24 }}>
                    <div style={{ fontWeight: 700, marginBottom: 12 }}>Reviews Given ({reviews.length})</div>
                    {reviews.length === 0 ? <div className="text-sm text-muted">No reviews yet</div> : reviews.slice(0, 3).map(r => (
                        <div key={r.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                            <div>{'⭐'.repeat(r.rating || 0)}</div>
                            <div className="text-muted" style={{ marginTop: 2 }}>{r.writtenReview || '—'}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <button className={`btn ${user.isBlocked ? 'btn-success' : 'btn-danger'}`} onClick={handleBlock} disabled={blocking} style={{ flex: 1, justifyContent: 'center' }}>
                        {user.isBlocked ? <><ShieldCheck size={15} /> Unblock User</> : <><ShieldOff size={15} /> Block User</>}
                    </button>
                    <button className="btn btn-outline" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Close</button>
                </div>
            </div>
        </div>
    );
}

export default function Users() {
    const [users, setUsers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')))
            .then(snap => { const u = snap.docs.map(d => ({ id: d.id, ...d.data() })); setUsers(u); setFiltered(u); })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let res = users;
        if (filter === 'blocked') res = res.filter(u => u.isBlocked);
        if (filter === 'premium') res = res.filter(u => u.isPremium);
        if (filter === 'free') res = res.filter(u => !u.isPremium && !u.isBlocked);
        if (search) res = res.filter(u => (u.name || '').toLowerCase().includes(search.toLowerCase()) || (u.phone || '').includes(search));
        setFiltered(res);
    }, [search, filter, users]);

    const handleToggleBlock = (id, isBlocked) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, isBlocked } : u));
    };

    return (
        <div>
            <TopBar title="Users" />
            <div className="page-content">
                <div className="page-header">
                    <div><h2 className="page-title">Users</h2><p className="page-subtitle">{users.length} total registered users</p></div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <div className="search-bar">
                            <Search size={15} />
                            <input placeholder="Search name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div className="tabs">
                            {['all', 'premium', 'free', 'blocked'].map(f => (
                                <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? <div className="loading-center"><div className="spinner" /></div> : (
                    <div className="table-wrapper">
                        <table>
                            <thead><tr>
                                <th>Name</th><th>Phone</th><th>Joined</th><th>Plan</th><th>Status</th><th>Action</th>
                            </tr></thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={5}><div className="empty-state"><User size={32} /><h3>No users found</h3></div></td></tr>
                                ) : filtered.map(u => (
                                    <tr key={u.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--primary-light)', flexShrink: 0 }}>
                                                    {(u.name || '?')[0].toUpperCase()}
                                                </div>
                                                {u.name || 'Unknown'}
                                            </div>
                                        </td>
                                        <td>{u.phone || '—'}</td>
                                        <td>{u.createdAt?.toDate?.() ? u.createdAt.toDate().toLocaleDateString('en-IN') : '—'}</td>
                                        <td>{u.isPremium ? <span className="text-purple-500 font-bold">💎 Premium</span> : 'Free'}</td>
                                        <td>{statusBadge(u)}</td>
                                        <td>
                                            <button className="btn btn-outline btn-sm" onClick={() => setSelected(u)}>
                                                <Eye size={13} /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {selected && <UserModal user={selected} onClose={() => setSelected(null)} onToggleBlock={handleToggleBlock} />}
        </div>
    );
}
