import React, { useEffect, useState } from 'react';
import TopBar from '../components/Layout/TopBar';
import { Search, X, Eye, CheckCircle, XCircle, Ban } from 'lucide-react';

const STATUS_COLORS = {
    pending: 'var(--warning)',
    confirmed: 'var(--success)',
    active: 'var(--accent)',
    completed: 'var(--primary)',
    rejected: 'var(--danger)',
    cancelled: 'var(--text3)',
};

const STATUS_EMOJIS = {
    pending: '⏳', confirmed: '✅', active: '🚀',
    completed: '🎉', rejected: '❌', cancelled: '🚫',
};

function BookingModal({ booking, onClose, onCancel }) {
    const [saving, setSaving] = useState(false);

    const handleCancel = async () => {
        setSaving(true);
        try {
            await onCancel(booking.id);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    const field = (label, value) => (
        <div style={{ marginBottom: 12 }}>
            <div className="text-xs text-muted">{label}</div>
            <div style={{ fontWeight: 600, marginTop: 2 }}>{value || '—'}</div>
        </div>
    );

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 560 }}>
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">Booking #{booking.id?.slice(-6).toUpperCase()}</h2>
                        <div style={{ fontSize: 13, color: 'var(--text3)' }}>Service Booking Details</div>
                    </div>
                    <button className="modal-close" onClick={onClose}><X size={18} /></button>
                </div>

                <div className="grid-2">
                    {field('Service Type', `${STATUS_EMOJIS[booking.status] || ''} ${booking.serviceType}`)}
                    {field('Dog', booking.dogName)}
                    {field('Date', booking.date)}
                    {field('Time', booking.time)}
                    {field('Location', booking.locationType)}
                </div>

                <div className="grid-2" style={{ marginTop: 12 }}>
                    {field('Gross Amount', `₹${booking.amount ?? 0}`)}
                    {field('Platform Commission', `₹${booking.platformCommission ?? 0}`)}
                    {field('Provider Earns', `₹${booking.providerEarning ?? 0}`)}
                    {field('Payment ID', booking.paymentId)}
                </div>

                {booking.specialInstructions && (
                    <div style={{ marginTop: 12, padding: 12, background: 'var(--surface2)', borderRadius: 8 }}>
                        <div className="text-xs text-muted">Special Instructions</div>
                        <div style={{ marginTop: 4 }}>{booking.specialInstructions}</div>
                    </div>
                )}

                {booking.providerNote && (
                    <div style={{ marginTop: 12, padding: 12, background: 'var(--danger)22', borderRadius: 8 }}>
                        <div className="text-xs" style={{ color: 'var(--danger)' }}>Provider Note / Rejection Reason</div>
                        <div style={{ marginTop: 4 }}>{booking.providerNote}</div>
                    </div>
                )}

                {['pending', 'confirmed', 'active'].includes(booking.status) && (
                    <button
                        className="btn btn-danger"
                        style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}
                        onClick={handleCancel}
                        disabled={saving}
                    >
                        <Ban size={14} /> Cancel Booking & Refund
                    </button>
                )}
            </div>
        </div>
    );
}

export default function ServiceBookings() {
    const [bookings, setBookings] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://65.2.129.246:3001';

    useEffect(() => {
        fetch(`${BACKEND}/api/service-bookings`)
            .then(r => r.json())
            .then(({ bookings }) => {
                setBookings(bookings || []);
                setFiltered(bookings || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let res = bookings;
        if (statusFilter !== 'all') res = res.filter(b => b.status === statusFilter);
        if (search) {
            const q = search.toLowerCase();
            res = res.filter(b =>
                (b.serviceType || '').toLowerCase().includes(q) ||
                (b.dogName || '').toLowerCase().includes(q)
            );
        }
        setFiltered(res);
    }, [search, statusFilter, bookings]);

    const handleCancel = async (bookingId) => {
        await fetch(`${BACKEND}/api/service-bookings/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId, reason: 'Cancelled by admin' }),
        });
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
    };

    const STATUSES = ['all', 'pending', 'confirmed', 'active', 'completed', 'rejected', 'cancelled'];

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        active: bookings.filter(b => b.status === 'active').length,
        revenue: bookings.filter(b => b.status === 'completed')
            .reduce((s, b) => s + (b.platformCommission || 0), 0),
    };

    return (
        <div>
            <TopBar title="Service Bookings" />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Service Bookings</h2>
                        <p className="page-subtitle">Grooming, Walking & Boarding bookings across the platform 🐾</p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="stats-grid" style={{ marginBottom: 24 }}>
                    {[
                        { label: 'Total Bookings', value: stats.total, color: 'var(--primary)' },
                        { label: 'Pending', value: stats.pending, color: 'var(--warning)' },
                        { label: 'Active Now', value: stats.active, color: 'var(--success)' },
                        { label: 'Commission Earned', value: `₹${stats.revenue.toLocaleString()}`, color: 'var(--primary-light)' },
                    ].map(s => (
                        <div key={s.label} className="stat-card">
                            <div className="stat-number" style={{ color: s.color }}>{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                    <div className="search-bar">
                        <Search size={15} />
                        <input
                            placeholder="Search by service or dog name..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="tabs">
                        {STATUSES.map(s => (
                            <button
                                key={s}
                                className={`tab ${statusFilter === s ? 'active' : ''}`}
                                onClick={() => setStatusFilter(s)}
                            >
                                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                                {s === 'pending' && stats.pending > 0 && (
                                    <span style={{ background: 'var(--danger)', color: 'white', padding: '2px 6px', borderRadius: 10, fontSize: 10, marginLeft: 6 }}>
                                        {stats.pending}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="loading-center"><div className="spinner" /></div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Booking</th>
                                    <th>Service</th>
                                    <th>Dog</th>
                                    <th>Date & Time</th>
                                    <th>Amount</th>
                                    <th>Commission</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={8}>
                                        <div className="empty-state">
                                            <span style={{ fontSize: 32 }}>📭</span>
                                            <h3>No bookings found</h3>
                                        </div>
                                    </td></tr>
                                ) : filtered.map(b => (
                                    <tr key={b.id}>
                                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>
                                            #{b.id?.slice(-6).toUpperCase()}
                                        </td>
                                        <td>
                                            {STATUS_EMOJIS[b.status]} {b.serviceType}
                                        </td>
                                        <td>{b.dogName || '—'}</td>
                                        <td style={{ fontSize: 12 }}>
                                            {b.date}<br />
                                            <span style={{ color: 'var(--text3)' }}>{b.time}</span>
                                        </td>
                                        <td>₹{b.amount ?? 0}</td>
                                        <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                                            ₹{b.platformCommission ?? 0}
                                        </td>
                                        <td>
                                            <span style={{
                                                background: (STATUS_COLORS[b.status] || 'var(--text3)') + '22',
                                                color: STATUS_COLORS[b.status] || 'var(--text3)',
                                                padding: '3px 8px',
                                                borderRadius: 6,
                                                fontSize: 11,
                                                fontWeight: 700,
                                            }}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-outline btn-sm" onClick={() => setSelected(b)}>
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

            {selected && (
                <BookingModal
                    booking={selected}
                    onClose={() => setSelected(null)}
                    onCancel={handleCancel}
                />
            )}
        </div>
    );
}
