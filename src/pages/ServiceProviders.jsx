import React, { useEffect, useState } from 'react';
import TopBar from '../components/Layout/TopBar';
import { db } from '../firebase/config';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Search, X, CheckCircle, XCircle, Eye, ShieldAlert, FileText, Briefcase } from 'lucide-react';

const statusBadge = (isVerified) => {
    return isVerified
        ? <span className="badge badge-success">Verified</span>
        : <span className="badge badge-warning">Pending</span>;
};

function ProviderModal({ provider, onClose, onUpdateStatus }) {
    const [saving, setSaving] = useState(false);

    const handleUpdate = async (verifyStatus) => {
        setSaving(true);
        try {
            await updateDoc(doc(db, 'service_providers', provider.id), {
                isVerified: verifyStatus,
            });
            onUpdateStatus(provider.id, verifyStatus);
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
                        <h2 className="modal-title">Verify Service Provider</h2>
                        <div style={{ fontSize: 13, color: 'var(--text3)' }}>Review Aadhaar before approving provider</div>
                    </div>
                    <button className="modal-close" onClick={onClose}><X size={18} /></button>
                </div>

                <div className="grid-2" style={{ marginBottom: 20 }}>
                    <div className="card-sm">
                        <div className="text-xs text-muted">Legal Name</div>
                        <div style={{ marginTop: 4, fontWeight: 600 }}>{provider.name || 'Unknown'}</div>
                    </div>
                    <div className="card-sm">
                        <div className="text-xs text-muted">Services Offered</div>
                        <div style={{ marginTop: 4, fontWeight: 600 }}>{(provider.services || []).join(', ')}</div>
                    </div>
                    <div className="card-sm">
                        <div className="text-xs text-muted">Operating Radius</div>
                        <div style={{ marginTop: 4, fontWeight: 600 }}>{provider.operatingRadius} km</div>
                    </div>
                    <div className="card-sm">
                        <div className="text-xs text-muted">Verification Status</div>
                        <div style={{ marginTop: 4 }}>{statusBadge(provider.isVerified)}</div>
                    </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                    <div className="form-label" style={{ marginBottom: 8 }}><FileText size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} /> Bio / Experience</div>
                    <div style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface2)', fontSize: 13, lineHeight: '1.5' }}>
                        {provider.bio || 'No bio provided'}
                    </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                    <div className="form-label" style={{ marginBottom: 8 }}><FileText size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} /> Aadhaar Document</div>
                    <div style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface2)' }}>
                        {provider.aadhaarUrl ? (
                            <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
                                <img src={provider.aadhaarUrl} alt="Aadhaar" style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid var(--border)' }} />
                                <a href={provider.aadhaarUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}>
                                    <Eye size={14} /> View Full Image
                                </a>
                            </div>
                        ) : <span className="text-sm text-muted">No document uploaded</span>}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                    <button className="btn btn-success" onClick={() => handleUpdate(true)} disabled={saving || provider.isVerified === true} style={{ flex: 1, justifyContent: 'center' }}>
                        <CheckCircle size={15} /> Approve & Verify
                    </button>
                    <button className="btn btn-danger" onClick={() => handleUpdate(false)} disabled={saving || provider.isVerified === false} style={{ flex: 1, justifyContent: 'center' }}>
                        <XCircle size={15} /> Revoke Verification
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ServiceProviders() {
    const [providers, setProviders] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('pending');
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDocs(collection(db, 'service_providers'))
            .then(snap => {
                const p = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                p.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                setProviders(p);
                setFiltered(p.filter(x => !x.isVerified));
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let res = providers;
        if (filter === 'pending') res = res.filter(p => !p.isVerified);
        if (filter === 'verified') res = res.filter(p => p.isVerified);
        if (search) res = res.filter(p => (p.name || '').toLowerCase().includes(search.toLowerCase()));
        setFiltered(res);
    }, [search, filter, providers]);

    const handleUpdateStatus = (id, newVerifyStatus) => {
        setProviders(prev => prev.map(p => p.id === id ? { ...p, isVerified: newVerifyStatus } : p));
    };

    return (
        <div>
            <TopBar title="Service Providers" />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Service Providers</h2>
                        <p className="page-subtitle">Review applications for Groomers, Dog Walkers, and Boarding Hosts ✂️</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <div className="search-bar">
                            <Search size={15} />
                            <input placeholder="Search provider name..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div className="tabs">
                            {['pending', 'verified', 'all'].map(f => (
                                <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                    {f === 'pending' && providers.filter(p => !p.isVerified).length > 0 && (
                                        <span style={{ background: 'var(--danger)', color: 'white', padding: '2px 6px', borderRadius: 10, fontSize: 10, marginLeft: 6 }}>
                                            {providers.filter(p => !p.isVerified).length}
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
                                <th>Provider Name</th><th>Services</th><th>Rating</th><th>Status</th><th>Action</th>
                            </tr></thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={5}><div className="empty-state"><ShieldAlert size={32} /><h3>No providers found</h3></div></td></tr>
                                ) : filtered.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--primary-light)', flexShrink: 0 }}>
                                                    {(p.name || '?')[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{p.name || 'Unknown'}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--textMuted)' }}>Radius: {p.operatingRadius}km</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                                {(p.services || []).map(svc => (
                                                    <span key={svc} style={{ background: 'var(--surface2)', padding: '2px 8px', borderRadius: 8, fontSize: 11, border: '1px solid var(--border)' }}>
                                                        {svc}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>⭐ {p.rating ? p.rating.toFixed(1) : 'New'} ({p.numReviews || 0})</td>
                                        <td>{statusBadge(p.isVerified)}</td>
                                        <td>
                                            <button className="btn btn-outline btn-sm" onClick={() => setSelected(p)}>
                                                <Briefcase size={13} /> Review App
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {selected && <ProviderModal provider={selected} onClose={() => setSelected(null)} onUpdateStatus={handleUpdateStatus} />}
        </div>
    );
}
