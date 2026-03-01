import React, { useEffect, useState } from 'react';
import TopBar from '../components/Layout/TopBar';
import { db } from '../firebase/config';
import { collection, getDocs, doc, updateDoc, addDoc, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { Search, X, Tag, ShieldCheck, ShieldAlert, Star, Eye } from 'lucide-react';

const statusColor = { active: 'badge-success', pending: 'badge-warning', rejected: 'badge-danger', sold: 'badge-purple' };

function ListingModal({ listing, onClose, onRefresh }) {
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
            await updateDoc(doc(db, 'listings', listing.id), {
                status,
                adminNote: note,
                updatedAt: serverTimestamp()
            });

            // Send In-App Notification to Seller
            let nTitle = status === 'active' ? 'Listing Approved! 🎉' : 'Listing Rejected 🚨';
            let nBody = status === 'active'
                ? `Your listing for ${listing.breed || 'a dog'} is now live on the marketplace.`
                : `Your listing was rejected. Reason: ${note}`;

            await addDoc(collection(db, 'notifications'), {
                targetUserId: listing.sellerId,
                title: nTitle,
                body: nBody,
                isRead: false,
                createdAt: serverTimestamp()
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

    const toggleFeature = async () => {
        setActioning(true);
        try {
            await updateDoc(doc(db, 'listings', listing.id), {
                isFeatured: !listing.isFeatured,
                updatedAt: serverTimestamp()
            });
            onRefresh();
            onClose();
        } catch (e) {
            console.error(e);
            alert('Failed to toggle feature');
        } finally {
            setActioning(false);
        }
    };

    const details = [
        ['Breed', listing.breed || ' '],
        ['Age', listing.age || ' '],
        ['Gender', listing.gender || ' '],
        ['Color', listing.color || ' '],
        ['Price', listing.price === 0 ? 'Free Adoption' : `₹${listing.price}`],
        ['Location', listing.city || ' '],
        ['Health', listing.healthNotes || ' '],
        ['Seller ID', listing.sellerId || ' '],
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

                {/* Photos Gallery */}
                {listing.photos && listing.photos.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                        <div className="form-label" style={{ marginBottom: 8 }}>Photos ({listing.photos.length})</div>
                        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 10 }}>
                            {listing.photos.map((url, i) => (
                                <img key={i} src={url} alt="Dog" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--border)', flexShrink: 0 }} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Document Section */}
                {listing.vetCertificateUrl && (
                    <div style={{ marginBottom: 20 }}>
                        <div className="form-label" style={{ marginBottom: 8 }}>Documents</div>
                        <div style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface2)' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Vet Certificate Provided</div>
                            <a href={listing.vetCertificateUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                                <Eye size={14} /> View Certificate
                            </a>
                        </div>
                    </div>
                )}

                {/* Description */}
                <div style={{ marginBottom: 20 }}>
                    <div className="form-label" style={{ marginBottom: 4 }}>Description</div>
                    <p style={{ fontSize: 14, color: 'var(--text2)', background: 'var(--surface2)', padding: 12, borderRadius: 8, margin: 0 }}>
                        {listing.description || 'No description provided.'}
                    </p>
                </div>

                {showReject ? (
                    <div style={{ display: 'grid', gap: 16 }}>
                        <p className="text-muted">Why are you rejecting this listing? The seller will see this message.</p>
                        <textarea
                            className="input"
                            placeholder="e.g. Blurry photo, suspicious pricing, no vet cert..."
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
                                    <button className="btn btn-success" onClick={() => handleStatusChange('active')} disabled={actioning} style={{ flex: 1, justifyContent: 'center', minWidth: '140px' }}>
                                        <ShieldCheck size={16} /> Approve Listing
                                    </button>
                                    <button className="btn btn-danger" onClick={() => setShowReject(true)} disabled={actioning} style={{ flex: 1, justifyContent: 'center', minWidth: '140px' }}>
                                        <ShieldAlert size={16} /> Reject
                                    </button>
                                </>
                            )}
                            {listing.status === 'active' && (
                                <>
                                    <button className="btn btn-outline" onClick={toggleFeature} disabled={actioning} style={{ flex: 1, justifyContent: 'center', color: listing.isFeatured ? 'var(--text)' : 'var(--primary-light)', borderColor: listing.isFeatured ? 'var(--border)' : 'var(--primary-light)', minWidth: '140px' }}>
                                        <Star size={16} fill={listing.isFeatured ? 'currentColor' : 'none'} /> {listing.isFeatured ? 'Remove Feature' : 'Feature Listing'}
                                    </button>
                                    <button className="btn btn-danger" onClick={() => setShowReject(true)} disabled={actioning} style={{ flex: 1, justifyContent: 'center', minWidth: '140px' }}>
                                        Take Down
                                    </button>
                                </>
                            )}
                            <button className="btn btn-outline" onClick={onClose} style={{ flex: 1, justifyContent: 'center', minWidth: '100px' }}>Close</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

const TABS = ['all', 'pending', 'active', 'sold', 'rejected'];

export default function Listings() {
    const [listings, setListings] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [tab, setTab] = useState('pending');
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    const refresh = () => {
        setLoading(true);
        getDocs(query(collection(db, 'listings'), orderBy('createdAt', 'desc')))
            .then(snap => { const l = snap.docs.map(d => ({ id: d.id, ...d.data() })); setListings(l); setFiltered(l); })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        refresh();
    }, []);

    useEffect(() => {
        let r = listings;
        if (tab !== 'all') r = r.filter(b => b.status === tab);
        if (search) r = r.filter(b => b.id?.includes(search) || (b.breed || '').toLowerCase().includes(search.toLowerCase()) || (b.city || '').toLowerCase().includes(search.toLowerCase()));
        setFiltered(r);
    }, [tab, search, listings]);

    return (
        <div>
            <TopBar title="Listings Management" />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Listings Moderation</h2>
                        <p className="page-subtitle">Approve new dog listings, verify vet certificates, and manage active marketplace.</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                    <div className="search-bar" style={{ flex: 1, minWidth: 280, maxWidth: 400 }}>
                        <Search size={15} />
                        <input placeholder="Search breed, city, or ID..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="tabs">
                        {TABS.map(t => (
                            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                                {t === 'pending' && listings.filter(s => s.status === 'pending').length > 0 && (
                                    <span style={{ background: 'var(--danger)', color: 'white', padding: '2px 6px', borderRadius: 10, fontSize: 10, marginLeft: 6 }}>
                                        {listings.filter(s => s.status === 'pending').length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? <div className="loading-center"><div className="spinner" /></div> : (
                    <div className="table-wrapper">
                        <table>
                            <thead><tr><th>Photo</th><th>Breed</th><th>Location</th><th>Price</th><th>Added</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={7}><div className="empty-state"><Tag size={32} /><h3>No listings found</h3></div></td></tr>
                                ) : filtered.map(l => (
                                    <tr key={l.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(l)}>
                                        <td>
                                            <div style={{ position: 'relative', width: 44, height: 44 }}>
                                                <img src={l.photos?.[0] || 'https://via.placeholder.com/150'} alt="Dog" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                                {l.isFeatured && <div style={{ position: 'absolute', top: -4, right: -4, background: '#ffc107', borderRadius: '50%', padding: '2px' }}><Star size={10} fill="white" color="white" /></div>}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, fontSize: 13 }}>{l.breed || ' '}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{l.age}   {l.gender}</div>
                                        </td>
                                        <td>{l.city || ' '}</td>
                                        <td>{l.price === 0 ? 'Free' : `₹${l.price}`}</td>
                                        <td>{l.createdAt?.toDate?.() ? l.createdAt.toDate().toLocaleDateString('en-IN') : ' '}</td>
                                        <td><span className="badge">{l.status || ' '}</span></td>
                                        <td onClick={e => e.stopPropagation()}>
                                            <button className="btn btn-outline btn-sm" onClick={() => setSelected(l)}>
                                                <Eye size={14} /> Review
                                            </button>
                                        </td>
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
