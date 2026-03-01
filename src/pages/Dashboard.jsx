import React, { useEffect, useState } from 'react';
import TopBar from '../components/Layout/TopBar';
import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { Users, CalendarDays, Star, IndianRupee, AlertTriangle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const StatCard = ({ label, value, icon: Icon, color, prefix = '' }) => (
    <div className={`stats-card ${color}`}>
        <div className="icon"><Icon size={20} /></div>
        <div className="label">{label}</div>
        <div className="value">{prefix}{value}</div>
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length)
        return <div className="card-sm" style={{ fontSize: 13 }}><strong>{label}</strong><br />₹{payload[0].value}</div>;
    return null;
};

export default function Dashboard() {
    const [stats, setStats] = useState({ users: 0, bookings: 0, reviews: 0, earnings: 0, active: 0, sos: 0 });
    const [recentBookings, setRecentBookings] = useState([]);
    const [weekData, setWeekData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [usersSnap, listingsSnap, subsSnap, reportsSnap] = await Promise.all([
                    getDocs(collection(db, 'users')),
                    getDocs(collection(db, 'listings')),
                    getDocs(query(collection(db, 'subscriptions'), where('status', '==', 'active'))),
                    getDocs(query(collection(db, 'reports'), where('resolved', '==', false))),
                ]);

                // For earnings, we would ideally query a payments/transactions collection 
                // but since Razorpay creates subscriptions, we'll estimate from active subs for the demo
                // Or if we have a transactions collection, we query that. 
                // Let's assume a dummy earnings calculation or fetch from subscriptions if amount is there.
                let earnings = 0;
                subsSnap.forEach(doc => {
                    const data = doc.data();
                    earnings += (data.amount || 99);
                });

                const activeListings = listingsSnap.docs.filter(d => d.data().status === 'active').length;
                const pendingListingsDoc = listingsSnap.docs.filter(d => d.data().status === 'pending');
                const pendingListings = pendingListingsDoc.length;

                setStats({
                    users: usersSnap.size,
                    listings: pendingListings, // Show pending in stats card
                    active: activeListings,
                    reports: reportsSnap.size,
                    earnings,
                    subs: subsSnap.size
                });

                const recent = pendingListingsDoc.slice(0, 8).map(d => ({ id: d.id, ...d.data() }));
                setRecentBookings(recent); // Reusing state name for recent listings

                // Last 7 days earnings (dummy logic based on subscriptions for now to keep chart alive)
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const today = new Date();
                const weekChart = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(today); d.setDate(today.getDate() - (6 - i));
                    const dayName = days[d.getDay()];
                    const amt = subsSnap.docs.filter(b => {
                        const bd = b.data().startDate?.toDate?.() ? b.data().startDate.toDate() : new Date(b.data().startDate || 0);
                        return bd.toDateString() === d.toDateString();
                    }).reduce((s, b) => s + (b.data().amount || 99), 0);
                    return { day: dayName, earnings: amt };
                });
                setWeekData(weekChart);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    const statusBadge = (s) => {
        const map = { active: 'badge-success', pending: 'badge-warning', sold: 'badge-purple', rejected: 'badge-danger' };
        return <span className={`badge ${map[s] || 'badge-gray'}`}>{s || 'Unknown'}</span>;
    };

    return (
        <div>
            <TopBar title="Dashboard" />
            <div className="page-content">
                {loading ? <div className="loading-center"><div className="spinner" /></div> : (
                    <>
                        {/* Stats */}
                        <div className="grid-5" style={{ marginBottom: 28 }}>
                            <StatCard label="Total Users" value={stats.users} icon={Users} color="purple" />
                            <StatCard label="Pending Listings" value={stats.listings} icon={CalendarDays} color="teal" />
                            <StatCard label="Active Listings" value={stats.active} icon={TrendingUp} color="green" />
                            <StatCard label="Unresolved Reports" value={stats.reports} icon={AlertTriangle} color="amber" />
                            <StatCard label="Monthly Revenue" value={`₹${stats.earnings.toLocaleString()}`} icon={IndianRupee} color="purple" />
                        </div>

                        {stats.reports > 0 && (
                            <div style={{
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: 12, padding: '14px 20px', marginBottom: 24,
                                display: 'flex', alignItems: 'center', gap: 12
                            }}>
                                <AlertTriangle size={18} color="var(--danger)" className="pulse" />
                                <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{stats.reports} active report{stats.reports > 1 ? 's' : ''} on listings — review immediately</span>
                            </div>
                        )}

                        <div className="grid-2" style={{ gap: 24 }}>
                            {/* Chart */}
                            <div className="card">
                                <h3 style={{ marginBottom: 20, fontWeight: 700 }}>Earnings This Week</h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={weekData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                        <XAxis dataKey="day" stroke="var(--text3)" fontSize={12} />
                                        <YAxis stroke="var(--text3)" fontSize={12} tickFormatter={v => `₹${v}`} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="earnings" fill="url(#grad)" radius={[6, 6, 0, 0]} />
                                        <defs>
                                            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#a855f7" />
                                                <stop offset="100%" stopColor="#7c3aed" />
                                            </linearGradient>
                                        </defs>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Recent Listings */}
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '20px 20px 0', fontWeight: 700 }}>Pending Listings</div>
                                {recentBookings.length === 0 ? (
                                    <div className="empty-state"><CalendarDays size={36} /><h3>No pending listings</h3></div>
                                ) : (
                                    <div style={{ overflowY: 'auto', maxHeight: 280, marginTop: 12 }}>
                                        {recentBookings.map(b => (
                                            <div key={b.id} style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                padding: '12px 20px', borderTop: '1px solid var(--border)'
                                            }}>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{b.breed || 'Dog Listing'}</div>
                                                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{b.price === 0 ? 'Free Adoption' : `₹${b.price}`}</div>
                                                </div>
                                                {statusBadge(b.status)}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
