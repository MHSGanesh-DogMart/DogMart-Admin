import React, { useEffect, useState } from 'react';
import TopBar from '../components/Layout/TopBar';
import { db } from '../firebase/config';
import { collection, getDocs, doc, updateDoc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { Star, Trash2, CheckCheck, AlertTriangle, ShieldOff } from 'lucide-react';

const stars = (n) => '⭐'.repeat(Math.max(0, n || 0));

export default function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [reports, setReports] = useState([]);
    const [tab, setTab] = useState('reviews');
    const [loading, setLoading] = useState(true);

    const refreshData = async () => {
        setLoading(true);
        try {
            const [revSnap, repSnap] = await Promise.all([
                getDocs(query(collection(db, 'reviews'), orderBy('createdAt', 'desc'))),
                getDocs(query(collection(db, 'reports'), orderBy('createdAt', 'desc')))
            ]);
            setReviews(revSnap.docs.map(d => ({ id: d.id, ...d.data() })));
            setReports(repSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
            console.error("Error fetching reviews/reports", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const handleAcknowledgeReview = async (id) => {
        await updateDoc(doc(db, 'reviews', id), { isFlagged: false });
        setReviews(prev => prev.map(r => r.id === id ? { ...r, isFlagged: false } : r));
    };

    const handleDeleteReview = async (id) => {
        if (!confirm('Permanently delete this review?')) return;
        await deleteDoc(doc(db, 'reviews', id));
        setReviews(prev => prev.filter(r => r.id !== id));
    };

    const handleResolveReport = async (reportId) => {
        await updateDoc(doc(db, 'reports', reportId), { status: 'resolved' });
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'resolved' } : r));
    };

    const handleTakeDownListing = async (listingId, reportId) => {
        if (!confirm('Take down the reported listing? This sets its status to "rejected".')) return;
        try {
            // Take down listing
            await updateDoc(doc(db, 'listings', listingId), { status: 'rejected', adminNote: 'Taken down due to user reports.' });
            // Mark report resolved
            await updateDoc(doc(db, 'reports', reportId), { status: 'resolved', actionTaken: 'Listing Taken Down' });
            setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'resolved', actionTaken: 'Listing Taken Down' } : r));
            alert('Listing taken down successfully.');
        } catch (e) {
            console.error(e);
            alert('Error taking down listing.');
        }
    };

    const unacknowledgedReports = reports.filter(r => r.status !== 'resolved').length;
    const flaggedReviews = reviews.filter(r => r.isFlagged).length;

    return (
        <div>
            <TopBar title="Reviews & Reports" />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Reviews & Reports</h2>
                        <p className="page-subtitle">Manage user feedback, flagged reviews, and reported listings.</p>
                    </div>
                </div>

                <div className="tabs" style={{ marginBottom: 20 }}>
                    <button className={`tab ${tab === 'reviews' ? 'tab-active' : ''}`} onClick={() => setTab('reviews')}>
                        Buyer Reviews {flaggedReviews > 0 && <span style={{ background: 'var(--warning)', color: 'white', padding: '2px 6px', borderRadius: 10, fontSize: 10, marginLeft: 6 }}>{flaggedReviews}</span>}
                    </button>
                    <button className={`tab ${tab === 'reports' ? 'tab-active' : ''}`} onClick={() => setTab('reports')}>
                        Reported Listings {unacknowledgedReports > 0 && <span style={{ background: 'var(--danger)', color: 'white', padding: '2px 6px', borderRadius: 10, fontSize: 10, marginLeft: 6 }}>{unacknowledgedReports}</span>}
                    </button>
                </div>

                {loading ? <div className="loading-center"><div className="spinner" /></div> : tab === 'reviews' ? (
                    // REVIEWS TAB
                    reviews.length === 0 ? (
                        <div className="empty-state"><Star size={40} /><h3>No reviews yet</h3></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {reviews.map(r => (
                                <div key={r.id} className="card" style={{ borderColor: r.isFlagged ? 'rgba(245,158,11,0.4)' : undefined }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: 18 }}>{stars(r.rating || 5)}</span>
                                                {r.isFlagged && <span className="badge badge-warning">🚩 Flagged</span>}
                                            </div>
                                            {r.comment && <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 8, fontStyle: 'italic' }}>"{r.comment}"</p>}
                                            <div className="text-xs text-muted">
                                                Reviewer: {r.reviewerName || r.reviewerId}   Target Seller: {r.sellerId}   {r.createdAt?.toDate?.() ? r.createdAt.toDate().toLocaleDateString('en-IN') : ' '}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                            {r.isFlagged && (
                                                <button className="btn btn-success btn-sm" onClick={() => handleAcknowledgeReview(r.id)}>
                                                    <CheckCheck size={13} /> Dismiss Flag
                                                </button>
                                            )}
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteReview(r.id)}><Trash2 size={13} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    // REPORTS TAB
                    reports.length === 0 ? (
                        <div className="empty-state"><CheckCheck size={40} color="var(--success)" /><h3>No reported listings</h3></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {reports.map((r) => (
                                <div key={r.id} className="card" style={{ borderColor: r.status !== 'resolved' ? 'rgba(239,68,68,0.4)' : 'var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                                                <AlertTriangle size={18} color={r.status !== 'resolved' ? 'var(--danger)' : 'var(--text3)'} />
                                                <span style={{ fontWeight: 600 }}>Reason: {r.reason || 'Spam / Scam'}</span>
                                                {r.status === 'resolved' && <span className="badge badge-success">✅ Resolved</span>}
                                            </div>
                                            {r.description && <p style={{ fontSize: 14, color: 'var(--text2)', background: 'var(--surface2)', padding: 8, borderRadius: 6, marginBottom: 8 }}>Details: {r.description}</p>}
                                            <div className="text-xs text-muted" style={{ marginBottom: 8 }}>
                                                Reported Listing ID: <span style={{ fontWeight: 600, color: 'var(--primary-light)' }}>{r.listingId}</span>
                                            </div>
                                            <div className="text-xs text-muted">
                                                Reported by: {r.reporterId}   {r.createdAt?.toDate?.() ? r.createdAt.toDate().toLocaleDateString('en-IN') : ' '}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: 'column' }}>
                                            {r.status !== 'resolved' && (
                                                <>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleTakeDownListing(r.listingId, r.id)} style={{ width: '100%', justifyContent: 'center' }}>
                                                        <ShieldOff size={13} /> Take Down Listing
                                                    </button>
                                                    <button className="btn btn-outline btn-sm" onClick={() => handleResolveReport(r.id)} style={{ width: '100%', justifyContent: 'center' }}>
                                                        <CheckCheck size={13} /> Dismiss Report
                                                    </button>
                                                </>
                                            )}
                                            {r.actionTaken && <span className="text-xs text-muted" style={{ alignSelf: 'flex-end' }}>Action: {r.actionTaken}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
