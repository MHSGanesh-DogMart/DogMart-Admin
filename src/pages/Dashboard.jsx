import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, ShoppingBag, DollarSign, AlertCircle,
    TrendingUp, Clock, CheckCircle, ArrowRight,
    ShieldAlert, CalendarDays, IndianRupee, AlertTriangle, ArrowUpRight
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import api from '../utils/api';
import TopBar from '../components/Layout/TopBar';
import { tokens } from '../styles/DesignTokens';

const StatCard = ({ label, value, icon: Icon, color, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, ...tokens.animations.transition }}
        className={`stats-card ${color}`}
        style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
        }}
    >
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: 4,
            background: tokens.colors.primary.gradient
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="icon" style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'rgba(255, 123, 84, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--primary)', marginBottom: 16
            }}>
                <Icon size={22} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--success)', fontSize: 12, fontWeight: 700 }}>
                <ArrowUpRight size={14} /> 12%
            </div>
        </div>

        <div className="label" style={{ color: 'var(--text3)', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{label}</div>
        <div className="value" style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)' }}>{value}</div>
    </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length)
        return (
            <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                padding: '12px 16px',
                borderRadius: 12,
                border: '1px solid var(--border)',
                boxShadow: tokens.shadows.lg
            }}>
                <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>
                    ₹{payload[0].value.toLocaleString()}
                </div>
            </div>
        );
    return null;
};

export default function Dashboard() {
    const [stats, setStats] = useState({ users: 0, listings: 0, active: 0, reports: 0, earnings: 0, subs: 0 });
    const [recentListings, setRecentListings] = useState([]);
    const [weekData, setWeekData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/admin/stats');
                setStats(response.data);

                // Fetch recent listings too
                const listingsRes = await api.get('/admin/listings?limit=8');
                setRecentListings(listingsRes.data.listings || []);

                // Placeholder for week data until backend supports it
                setWeekData([
                    { day: 'Mon', earnings: 4500 },
                    { day: 'Tue', earnings: 5200 },
                    { day: 'Wed', earnings: 4800 },
                    { day: 'Thu', earnings: 6100 },
                    { day: 'Fri', earnings: 5900 },
                    { day: 'Sat', earnings: 7200 },
                    { day: 'Sun', earnings: 6800 },
                ]);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statusBadge = (s) => {
        const map = { active: 'badge-success', pending: 'badge-warning', sold: 'badge-purple', rejected: 'badge-danger' };
        return <span className={`badge ${map[s] || 'badge-gray'}`} style={{ borderRadius: 8 }}>{s || 'Unknown'}</span>;
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <TopBar title="Overview" />
            <div className="page-content">
                {loading ? <div className="loading-center"><div className="spinner" /></div> : (
                    <>
                        <div className="grid-5" style={{ marginBottom: 32 }}>
                            <StatCard index={0} label="Total Users" value={stats.users} icon={Users} color="orange" />
                            <StatCard index={1} label="Active Pets" value={stats.active} icon={TrendingUp} color="orange" />
                            <StatCard index={2} label="Active Products" value={stats.products || 0} icon={ShoppingBag} color="orange" />
                            <StatCard index={3} label="Active Subscriptions" value={stats.subs || 0} icon={CalendarDays} color="orange" />
                            <StatCard index={4} label="Unresolved Reports" value={stats.reports} icon={AlertTriangle} color="red" />
                        </div>

                        {stats.reports > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{
                                    background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)',
                                    borderRadius: 16, padding: '16px 24px', marginBottom: 32,
                                    display: 'flex', alignItems: 'center', gap: 16
                                }}
                            >
                                <div style={{
                                    width: 40, height: 40, borderRadius: 12, background: 'var(--danger)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                                }}>
                                    <AlertTriangle size={20} className="pulse" />
                                </div>
                                <div>
                                    <div style={{ color: 'var(--danger)', fontWeight: 800, fontSize: 15 }}>Urgent Action Required</div>
                                    <div style={{ color: 'var(--danger)', opacity: 0.8, fontSize: 13 }}>{stats.reports} active report{stats.reports > 1 ? 's' : ''} on listings — please review immediately.</div>
                                </div>
                            </motion.div>
                        )}

                        <div className="grid-2" style={{ gap: 32 }}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="card"
                                style={{ padding: 28, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, boxShadow: tokens.shadows.md }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 800 }}>Earning Analytics</h3>
                                    <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>Last 7 Days</div>
                                </div>
                                <ResponsiveContainer width="100%" height={260}>
                                    <AreaChart data={weekData}>
                                        <defs>
                                            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--text3)', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text3)', fontSize: 12 }} tickFormatter={v => `₹${v}`} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="earnings" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="card"
                                style={{ padding: 0, overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, boxShadow: tokens.shadows.md }}
                            >
                                <div style={{ padding: '24px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 800 }}>Queue Moderation</h3>
                                    <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, background: 'rgba(255,123,84,0.1)', padding: '4px 10px', borderRadius: 20 }}>
                                        {recentListings.length} Pending
                                    </span>
                                </div>
                                {recentListings.length === 0 ? (
                                    <div className="empty-state" style={{ padding: '40px 0' }}><CalendarDays size={48} /><h3 style={{ marginTop: 12 }}>Inbox Zero!</h3><p>All listings have been reviewed.</p></div>
                                ) : (
                                    <div style={{ overflowY: 'auto', maxHeight: 300 }}>
                                        {recentListings.map((b, i) => (
                                            <motion.div
                                                key={b.id}
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.6 + (i * 0.05) }}
                                                style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '16px 24px', borderTop: '1px solid var(--border)',
                                                    transition: 'background 0.2s',
                                                }}
                                                className="list-item-hover"
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--surface2)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                                        <img src={b.photos?.[0] || 'https://via.placeholder.com/150'} alt="dog" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{b.breed || 'Dog Listing'}</div>
                                                        <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>{b.price === 0 ? 'Free Adoption' : `₹${b.price.toLocaleString()}`}</div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    {statusBadge(b.status)}
                                                    <button style={{
                                                        background: 'var(--surface2)', border: 'none', width: 32, height: 32,
                                                        borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: 'var(--text2)', cursor: 'pointer'
                                                    }}>
                                                        <ArrowUpRight size={16} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
}
