import React, { useEffect, useState } from 'react';
import TopBar from '../components/Layout/TopBar';
import api from '../utils/api';
import {
    Search, Filter, MoreVertical, Eye,
    CheckCircle, XCircle, Trash2, ExternalLink,
    ChevronLeft, ChevronRight, Dog, X, Tag, Star,
    ShieldCheck, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '../styles/DesignTokens';

const ListingModal = ({ listing, onClose, onRefresh }) => {
    const [actioning, setActioning] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [reason, setReason] = useState('');

    const handleStatusChange = async (status, note = '') => {
        if (status === 'rejected' && !note.trim()) {
            alert('Please provide a reason for rejecting the listing.');
            return;
        }
        setActioning(true);
        try {
            await api.patch(`/admin/listings/${listing.id}/status`, {
                status,
                adminNote: note
            });
            onRefresh();
            onClose();
        } catch (e) {
            console.error(e);
            alert('Failed to update listing');
        } finally {
            setActioning(false);
        }
    };

    const details = [
        ['Title', listing.title || ' '],
        ['Age', listing.age || ' '],
        ['Gender', listing.gender || ' '],
        ['Price', listing.price === 0 ? 'Free Adoption' : `₹${listing.price}`],
        ['Location', listing.city || ' '],
        ['Status', <span className="badge">{listing.status?.toUpperCase()}</span>],
    ];

    if (listing.adminNote) {
        details.push(['Admin Note', listing.adminNote]);
    }

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">Listing Details</h2>
                        <div style={{ fontSize: 13, color: 'var(--text3)' }}>{listing.isFeatured ? 'Featured Listing' : 'Standard Listing'}</div>
                    </div>
                    <button className="modal-close" onClick={onClose}><X size={18} /></button>
                </div>

                <div style={{ marginBottom: 20 }}>
                    <div className="form-label" style={{ marginBottom: 4 }}>Description</div>
                    <p style={{ fontSize: 14, color: 'var(--text2)', background: 'var(--surface2)', padding: 12, borderRadius: 8, margin: 0 }}>
                        {listing.description || 'No description provided.'}
                    </p>
                </div>

                {showReject ? (
                    <div style={{ display: 'grid', gap: 16 }}>
                        <p className="text-muted">Why are you rejecting this? The seller will be notified.</p>
                        <textarea
                            className="input"
                            placeholder="Reason for rejection..."
                            rows={3}
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                        />
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button className="btn btn-danger" onClick={() => handleStatusChange('rejected', reason)} disabled={actioning} style={{ flex: 1, justifyContent: 'center' }}>
                                Confirm Rejection
                            </button>
                            <button className="btn btn-outline" onClick={() => setShowReject(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gap: 10, marginBottom: 24 }}>
                            {details.map(([label, value]) => (
                                <div key={label} className="card-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
                                    <span className="text-muted text-sm">{label}</span>
                                    <span style={{ fontWeight: 600, fontSize: 13, textAlign: 'right', marginLeft: 10 }}>{value}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {listing.status === 'pending' && (
                                <>
                                    <button className="btn btn-success" onClick={() => handleStatusChange('active')} disabled={actioning} style={{ flex: 1, justifyContent: 'center' }}>
                                        <ShieldCheck size={16} /> Approve
                                    </button>
                                    <button className="btn btn-warning" onClick={() => setShowReject(true)} disabled={actioning} style={{ flex: 1, justifyContent: 'center' }}>
                                        <ShieldAlert size={16} /> Reject
                                    </button>
                                </>
                            )}
                            <button className="btn btn-danger" onClick={async () => {
                                if (window.confirm('Are you sure you want to permanently delete this listing?')) {
                                    setActioning(true);
                                    try {
                                        await api.delete(`/admin/listings/${listing.id}`);
                                        onRefresh();
                                        onClose();
                                    } catch (e) { alert('Failed to delete'); }
                                    setActioning(false);
                                }
                            }} disabled={actioning} style={{ flex: 1, justifyContent: 'center' }}>
                                <Trash2 size={16} /> Delete
                            </button>
                            <button className="btn btn-outline" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Close</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default function Services() {
    const [listings, setListings] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [tab, setTab] = useState('pending');
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        setLoading(true);
        try {
            const status = tab === 'all' ? '' : tab;
            const res = await api.get(`/admin/listings?type=service&status=${status}`);
            setListings(res.data.listings || []);
            setFiltered(res.data.listings || []);
        } catch (e) {
            console.error('Failed to fetch listings:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, [tab]);

    useEffect(() => {
        if (!search) {
            setFiltered(listings);
            return;
        }
        const r = listings.filter(b =>
            b.id?.includes(search) ||
            (b.title || '').toLowerCase().includes(search.toLowerCase()) ||
            (b.city || '').toLowerCase().includes(search.toLowerCase())
        );
        setFiltered(r);
    }, [search, listings]);

    return (
        <div>
            <TopBar title="Services Management" />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Moderation Queue</h2>
                        <p className="page-subtitle">Manage and verify service listings before they go live.</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                    <div className="search-bar" style={{ flex: 1, minWidth: 280, maxWidth: 400 }}>
                        <Search size={15} />
                        <input placeholder="Search title or ID..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="tabs">
                        {['all', 'pending', 'active', 'sold', 'rejected'].map(t => (
                            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? <div className="loading-center"><div className="spinner" /></div> : (
                    <div className="table-wrapper">
                        <table>
                            <thead><tr><th>Photo</th><th>Service</th><th>Location</th><th>Price</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={6}><div className="empty-state"><Tag size={32} /><h3>No listings found</h3></div></td></tr>
                                ) : filtered.map(l => (
                                    <tr key={l.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(l)}>
                                        <td>
                                            <div style={{ position: 'relative', width: 44, height: 44 }}>
                                                <img src={l.photos?.[0] || 'https://via.placeholder.com/150'} alt="Dog" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{l.title || '—'}</td>
                                        <td>{l.city || '—'}</td>
                                        <td>{l.price === 0 ? 'Free' : `₹${l.price}`}</td>
                                        <td><span className="badge">{l.status}</span></td>
                                        <td><button className="btn btn-outline btn-sm" onClick={() => setSelected(l)}>Review</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {selected && <ListingModal listing={selected} onClose={() => setSelected(null)} onRefresh={refresh} />}
        </div>
    );
}
