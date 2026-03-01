import React, { useEffect, useState } from 'react';
import TopBar from '../components/Layout/TopBar';
import { db } from '../firebase/config';
import { collection, getDocs, doc, updateDoc, orderBy, query, where, serverTimestamp } from 'firebase/firestore';
import { Search, X, CheckCircle, XCircle, Eye, ShieldAlert, FileText, UserCheck } from 'lucide-react';

const statusBadge = (s) => {
    const map = { pending: 'badge-warning', verified: 'badge-success', rejected: 'badge-danger' };
    return <span className="badge">{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Unknown'}</span>;
};

function SellerModal({ seller, onClose, onUpdateStatus }) {
    const [status, setStatus] = useState(seller.sellerStatus || 'pending');
    const [rejectReason, setRejectReason] = useState('');
    const [saving, setSaving] = useState(false);

    const handleUpdate = async (newStatus) => {
        if (newStatus === 'rejected' && !rejectReason.trim()) {
            alert('Please provide a reason for rejection.');
            return;
        }

        setSaving(true);
        try {
            await updateDoc(doc(db, 'users', seller.id), {
                sellerStatus: newStatus,
                sellerVerifiedAt: newStatus === 'verified' ? serverTimestamp() : null,
                sellerRejectReason: newStatus === 'rejected' ? rejectReason : null,
            });
            onUpdateStatus(seller.id, newStatus);
            onClose();
        } catch (e) {
            console.error(e);
            alert('Failed to update status');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 600 }}>
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">Verify Seller</h2>
                        <div style={{ fontSize: 13, color: 'var(--text3)' }}>Review KYC Documents before approving</div>
                    </div>
                    <button className="modal-close" onClick={onClose}><X size={18} /></button>
                </div>

                <div className="grid-2" style={{ marginBottom: 20 }}>
                    <div className="card-sm">
                        <div className="text-xs text-muted">Legal Name / Kennel</div>
                        <div style={{ marginTop: 4, fontWeight: 600 }}>{seller.sellerLegalName || seller.name || ' '}</div>
                    </div>
                    <div className="card-sm">
                        <div className="text-xs text-muted">Seller Type</div>
                        <div style={{ marginTop: 4, fontWeight: 600 }}>{seller.sellerType || 'Individual'}</div>
                    </div>
                    <div className="card-sm">
                        <div className="text-xs text-muted">Phone Number</div>
                        <div style={{ marginTop: 4, fontWeight: 600 }}>{seller.phone || ' '}</div>
                    </div>
                    <div className="card-sm">
                        <div className="text-xs text-muted">Current Status</div>
                        <div style={{ marginTop: 4 }}>{statusBadge(seller.sellerStatus)}</div>
                    </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                    <div className="form-label" style={{ marginBottom: 8 }}><FileText size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} /> Aadhaar Details</div>
                    <div style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface2)' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Aadhaar Number: {seller.aadhaarNumber || 'Not provided'}</div>
                        {seller.aadhaarUrl ? (
                            <a href={seller.aadhaarUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                                <Eye size={14} /> View Aadhaar Document
                            </a>
                        ) : <span className="text-sm text-muted">No document uploaded</span>}
                    </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                    <div className="form-label" style={{ marginBottom: 8 }}><FileText size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} /> PAN Details</div>
                    <div style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface2)' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>PAN Number: {seller.panNumber || 'Not provided'}</div>
                        {seller.panUrl ? (
                            <a href={seller.panUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                                <Eye size={14} /> View PAN Document
                            </a>
                        ) : <span className="text-sm text-muted">No document uploaded</span>}
                    </div>
                </div>

                {/* Always show Reject Reason input if clicking reject or already rejected */}
                <div className="form-group">
                    <label className="form-label">Rejection Reason (If rejecting)</label>
                    <input
                        className="form-input"
                        placeholder="e.g. Document image is blurry / Name mismatch"
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                    <button className="btn btn-success" onClick={() => handleUpdate('verified')} disabled={saving || seller.sellerStatus === 'verified'} style={{ flex: 1, justifyContent: 'center' }}>
                        <CheckCircle size={15} /> Approve & Verify
                    </button>
                    <button className="btn btn-danger" onClick={() => handleUpdate('rejected')} disabled={saving || (!rejectReason.trim() && seller.sellerStatus !== 'rejected')} style={{ flex: 1, justifyContent: 'center' }}>
                        <XCircle size={15} /> Reject KYC
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Sellers() {
    const [sellers, setSellers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('pending');
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch users who have applied to be sellers (have some seller fields or status)
        getDocs(query(collection(db, 'users'), where('isSellerInfoSubmitted', '==', true)))
            .then(snap => {
                const s = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                // Sort client side since we can't easily compound query without index
                s.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                setSellers(s);
                setFiltered(s.filter(u => u.sellerStatus === 'pending' || !u.sellerStatus));
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let res = sellers;
        if (filter !== 'all') {
            res = res.filter(s => (s.sellerStatus || 'pending') === filter);
        }
        if (search) res = res.filter(s => (s.name || '').toLowerCase().includes(search.toLowerCase()) || (s.phone || '').includes(search));
        setFiltered(res);
    }, [search, filter, sellers]);

    const handleUpdateStatus = (id, newStatus) => {
        setSellers(prev => prev.map(s => s.id === id ? { ...s, sellerStatus: newStatus } : s));
    };

    return (
        <div>
            <TopBar title="Sellers Verification" />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Sellers Verification</h2>
                        <p className="page-subtitle">Review KYC documents (Aadhaar/PAN) before granting the Verified Seller badge ✅</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <div className="search-bar">
                            <Search size={15} />
                            <input placeholder="Search name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div className="tabs">
                            {['pending', 'verified', 'rejected', 'all'].map(f => (
                                <button key={f} className="tab" onClick={() => setFilter(f)}>
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                    {f === 'pending' && sellers.filter(s => (s.sellerStatus || 'pending') === 'pending').length > 0 && (
                                        <span style={{ background: 'var(--danger)', color: 'white', padding: '2px 6px', borderRadius: 10, fontSize: 10, marginLeft: 6 }}>
                                            {sellers.filter(s => (s.sellerStatus || 'pending') === 'pending').length}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? <div className="loading-center"><div className="spinner" /></div> : (
                    <div className="table-wrapper">
                        <table>
                            <thead><tr>
                                <th>Applicant Name</th><th>Type</th><th>Phone</th><th>Status</th><th>Action</th>
                            </tr></thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={5}><div className="empty-state"><ShieldAlert size={32} /><h3>No sellers found</h3></div></td></tr>
                                ) : filtered.map(s => (
                                    <tr key={s.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--primary-light)', flexShrink: 0 }}>
                                                    {(s.name || '?')[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div>{s.sellerLegalName || s.name || 'Unknown'}</div>
                                                    {s.sellerStatus === 'verified' && <div style={{ fontSize: 11, color: 'var(--success)' }}>✅ Verified</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{s.sellerType || 'Individual'}</td>
                                        <td>{s.phone || ' '}</td>
                                        <td>{statusBadge(s.sellerStatus || 'pending')}</td>
                                        <td>
                                            <button className="btn btn-outline btn-sm" onClick={() => setSelected(s)}>
                                                <UserCheck size={13} /> Review KYC
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {selected && <SellerModal seller={selected} onClose={() => setSelected(null)} onUpdateStatus={handleUpdateStatus} />}
        </div>
    );
}
