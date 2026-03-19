import React, { useEffect, useState } from 'react';
import TopBar from '../components/Layout/TopBar';
import { db } from '../firebase/config';
import { collection, getDocs, where, query, orderBy } from 'firebase/firestore';
import { IndianRupee, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const SESSION_TYPES = ['Morning Walk', 'Coffee Chat', 'Temple Visit', 'Hospital Support', 'Story Listener'];
const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function Payments() {
    const [txns, setTxns] = useState([]);
    const [summary, setSummary] = useState({ total: 0, thisWeek: 0, thisMonth: 0 });
    const [byType, setByType] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDocs(query(collection(db, 'bookings'), where('status', '==', 'completed'), orderBy('createdAt', 'desc')))
            .then(snap => {
                const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setTxns(all);

                const now = new Date();
                const startWeek = new Date(now); startWeek.setDate(now.getDate() - 7);
                const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);

                setSummary({
                    total: all.reduce((s, b) => s + (b.amountPaid || 0), 0),
                    thisWeek: all.filter(b => new Date(b.createdAt?.toDate?.() || 0) >= startWeek).reduce((s, b) => s + (b.amountPaid || 0), 0),
                    thisMonth: all.filter(b => new Date(b.createdAt?.toDate?.() || 0) >= startMonth).reduce((s, b) => s + (b.amountPaid || 0), 0),
                });

                const typeMap = {};
                all.forEach(b => { const t = b.sessionType || 'Other'; typeMap[t] = (typeMap[t] || 0) + (b.amountPaid || 0); });
                setByType(Object.entries(typeMap).map(([name, earnings], i) => ({ name, earnings, fill: COLORS[i % COLORS.length] })));
            })
            .finally(() => setLoading(false));
    }, []);

    const exportCSV = () => {
        const rows = [['Date', 'Session', 'Amount', 'Payment ID']];
        txns.forEach(t => rows.push([
            t.createdAt?.toDate?.() ? t.createdAt.toDate().toLocaleDateString('en-IN') : '—',
            t.sessionType || '—', `₹${t.amountPaid || 0}`, t.paymentId || '—'
        ]));
        const csv = rows.map(r => r.join(',')).join('\n');
        const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
        a.download = 'dogmart_earnings.csv'; a.click();
    };

    return (
        <div>
            <TopBar title="Payments & Earnings" />
            <div className="page-content">
                <div className="page-header">
                    <div><h2 className="page-title">Payments & Earnings</h2><p className="page-subtitle">{txns.length} completed transactions</p></div>
                    <button className="btn btn-outline" onClick={exportCSV}><Download size={15} /> Export CSV</button>
                </div>
                {loading ? <div className="loading-center"><div className="spinner" /></div> : (
                    <>
                        <div className="grid-3" style={{ marginBottom: 28 }}>
                            {[['Total Earnings', summary.total, 'purple'], ['This Month', summary.thisMonth, 'teal'], ['This Week', summary.thisWeek, 'green']].map(([label, val, color]) => (
                                <div key={label} className={`stats-card ${color}`}>
                                    <div className="icon"><IndianRupee size={20} /></div>
                                    <div className="label">{label}</div>
                                    <div className="value">₹{val.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>

                        <div className="grid-2" style={{ gap: 24, marginBottom: 28 }}>
                            <div className="card">
                                <h3 style={{ marginBottom: 20, fontWeight: 700 }}>Earnings by Session Type</h3>
                                <ResponsiveContainer width="100%" height={230}>
                                    <BarChart data={byType} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                                        <XAxis type="number" stroke="var(--text3)" fontSize={11} tickFormatter={v => `₹${v}`} />
                                        <YAxis dataKey="name" type="category" stroke="var(--text3)" fontSize={11} width={100} />
                                        <Tooltip formatter={(v) => [`₹${v}`, 'Earnings']} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                                        <Bar dataKey="earnings" radius={[0, 6, 6, 0]} fill="var(--primary)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="card">
                                <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Type Breakdown</h3>
                                {byType.map((t, i) => (
                                    <div key={t.name} style={{ marginBottom: 14 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                                            <span>{t.name}</span><span style={{ fontWeight: 700 }}>₹{t.earnings.toLocaleString()}</span>
                                        </div>
                                        <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${Math.min(100, (t.earnings / (summary.total || 1)) * 100)}%`, background: COLORS[i % COLORS.length], borderRadius: 3, transition: 'width 0.5s' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '20px 20px 0', fontWeight: 700 }}>All Transactions</div>
                            <div className="table-wrapper" style={{ border: 'none' }}>
                                <table>
                                    <thead><tr><th>Date</th><th>Session Type</th><th>Amount</th><th>Razorpay ID</th></tr></thead>
                                    <tbody>
                                        {txns.length === 0 ? (
                                            <tr><td colSpan={4}><div className="empty-state"><IndianRupee size={32} /><h3>No transactions yet</h3></div></td></tr>
                                        ) : txns.slice(0, 50).map(t => (
                                            <tr key={t.id}>
                                                <td>{t.createdAt?.toDate?.() ? t.createdAt.toDate().toLocaleDateString('en-IN') : '—'}</td>
                                                <td>{t.sessionType || '—'}</td>
                                                <td style={{ color: 'var(--success)', fontWeight: 700 }}>₹{t.amountPaid || 0}</td>
                                                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{t.paymentId || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
