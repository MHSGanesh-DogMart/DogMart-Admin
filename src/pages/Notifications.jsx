import React, { useEffect, useState } from 'react';
import TopBar from '../components/Layout/TopBar';
import api from '../utils/api';
import { Bell, Send, Users, User, Clock, CheckCircle, AlertCircle, Megaphone, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_OPTIONS = [
    { value: 'announcement', label: '📢 Announcement', desc: 'General news and updates' },
    { value: 'promotion', label: '🎉 Promotion', desc: 'Offers and deals' },
    { value: 'maintenance', label: '🛠️ Maintenance', desc: 'Service downtime alerts' },
    { value: 'general', label: '🔔 General', desc: 'Miscellaneous alert' },
];

export default function Notifications() {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [type, setType] = useState('announcement');
    const [targetMode, setTargetMode] = useState('all'); // 'all' | 'user'
    const [targetUserId, setTargetUserId] = useState('');
    const [users, setUsers] = useState([]);
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState(null); // { success, message }
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data.users || []);
        } catch (e) {
            console.error('Failed to fetch users:', e);
        }
    };

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await api.get('/admin/notify/history');
            setHistory(res.data.notifications || []);
        } catch (e) {
            console.error('Failed to fetch notification history:', e);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchHistory();
    }, []);

    const handleSend = async () => {
        if (!title.trim() || !body.trim()) {
            setResult({ success: false, message: 'Title and message are required.' });
            return;
        }
        setSending(true);
        setResult(null);
        try {
            const payload = { title, body, type };
            if (targetMode === 'user' && targetUserId) {
                payload.targetUserId = targetUserId;
            }
            const res = await api.post('/admin/notify', payload);
            const data = res.data;
            const msg = targetMode === 'all'
                ? `✅ Sent to ${data.sent} users (${data.fcmSent} devices notified)`
                : `✅ Sent to the selected user`;
            setResult({ success: true, message: msg });
            setTitle('');
            setBody('');
            setTargetUserId('');
            fetchHistory();
        } catch (e) {
            setResult({ success: false, message: e.response?.data?.error || 'Failed to send notification' });
        } finally {
            setSending(false);
        }
    };

    const charLeftBody = 200 - body.length;

    return (
        <div>
            <TopBar title="Push Notifications" />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Broadcast Notifications</h2>
                        <p className="page-subtitle">Send announcements and push alerts to users directly.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
                    {/* Compose Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card"
                        style={{ padding: 28 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: 12,
                                background: 'linear-gradient(135deg, #FF7B54, #FF4F81)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Megaphone size={18} color="white" />
                            </div>
                            <h3 style={{ fontWeight: 700, fontSize: 16 }}>Compose Notification</h3>
                        </div>

                        {/* Target */}
                        <div style={{ marginBottom: 20 }}>
                            <label className="label">Send To</label>
                            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                                {[
                                    { v: 'all', icon: <Users size={14} />, label: 'All Users' },
                                    { v: 'user', icon: <User size={14} />, label: 'Specific User' },
                                ].map(opt => (
                                    <button
                                        key={opt.v}
                                        onClick={() => setTargetMode(opt.v)}
                                        className={`btn ${targetMode === opt.v ? 'btn-primary' : 'btn-outline'}`}
                                        style={{ flex: 1, gap: 6, justifyContent: 'center' }}
                                    >
                                        {opt.icon}{opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <AnimatePresence>
                            {targetMode === 'user' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ marginBottom: 20, overflow: 'hidden' }}
                                >
                                    <label className="label">Select User</label>
                                    <select
                                        value={targetUserId}
                                        onChange={e => setTargetUserId(e.target.value)}
                                        style={{
                                            width: '100%', padding: '10px 14px', marginTop: 8,
                                            borderRadius: 10, border: '1.5px solid var(--border)',
                                            background: 'var(--surface)', fontSize: 14, outline: 'none'
                                        }}
                                    >
                                        <option value="">— Choose a user —</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name || 'Unknown'} ({u.email})</option>
                                        ))}
                                    </select>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Type */}
                        <div style={{ marginBottom: 20 }}>
                            <label className="label">Notification Type</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                                {TYPE_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setType(opt.value)}
                                        style={{
                                            padding: '10px 12px', borderRadius: 10, textAlign: 'left',
                                            border: `1.5px solid ${type === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                                            background: type === opt.value ? 'var(--primary-light, rgba(255,123,84,0.08))' : 'var(--surface)',
                                            cursor: 'pointer', transition: 'all 0.15s'
                                        }}
                                    >
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{opt.label}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{opt.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Title */}
                        <div style={{ marginBottom: 16 }}>
                            <label className="label">Title</label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. 🎉 New Feature Alert!"
                                maxLength={80}
                                style={{
                                    width: '100%', marginTop: 8, padding: '10px 14px',
                                    borderRadius: 10, border: '1.5px solid var(--border)',
                                    background: 'var(--surface)', fontSize: 14, outline: 'none'
                                }}
                            />
                            <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{title.length}/80</div>
                        </div>

                        {/* Body */}
                        <div style={{ marginBottom: 20 }}>
                            <label className="label">Message Body</label>
                            <textarea
                                value={body}
                                onChange={e => setBody(e.target.value.slice(0, 200))}
                                placeholder="Write your notification message here..."
                                rows={4}
                                style={{
                                    width: '100%', marginTop: 8, padding: '10px 14px',
                                    borderRadius: 10, border: '1.5px solid var(--border)',
                                    background: 'var(--surface)', fontSize: 14, resize: 'vertical', outline: 'none',
                                    fontFamily: 'inherit'
                                }}
                            />
                            <div style={{ textAlign: 'right', fontSize: 11, color: charLeftBody < 20 ? 'var(--danger)' : 'var(--text3)', marginTop: 4 }}>
                                {charLeftBody} chars remaining
                            </div>
                        </div>

                        {/* Result */}
                        <AnimatePresence>
                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    style={{
                                        padding: '12px 16px', borderRadius: 10,
                                        background: result.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                        border: `1px solid ${result.success ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16
                                    }}
                                >
                                    {result.success
                                        ? <CheckCircle size={16} color="#22c55e" />
                                        : <AlertCircle size={16} color="#ef4444" />
                                    }
                                    <span style={{ fontSize: 13, fontWeight: 600, color: result.success ? '#22c55e' : '#ef4444' }}>
                                        {result.message}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            className="btn btn-primary"
                            onClick={handleSend}
                            disabled={sending || !title.trim() || !body.trim()}
                            style={{ width: '100%', justifyContent: 'center', gap: 8, padding: '14px 20px' }}
                        >
                            {sending
                                ? <><Loader size={16} className="spin" /> Sending...</>
                                : <><Send size={16} /> Send Notification</>
                            }
                        </button>
                    </motion.div>

                    {/* History */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card"
                        style={{ padding: 28 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: 12,
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Clock size={18} color="white" />
                            </div>
                            <h3 style={{ fontWeight: 700, fontSize: 16 }}>Sent History</h3>
                        </div>

                        {loadingHistory ? (
                            <div className="loading-center"><div className="spinner" /></div>
                        ) : history.length === 0 ? (
                            <div className="empty-state" style={{ padding: 40 }}>
                                <Bell size={32} />
                                <h3>No announcements yet</h3>
                                <p style={{ color: 'var(--text3)', fontSize: 13 }}>Send your first notification!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 500, overflowY: 'auto' }}>
                                {history.map((n, i) => (
                                    <motion.div
                                        key={n.id || i}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        style={{
                                            padding: '14px 16px', borderRadius: 12,
                                            border: '1px solid var(--border)',
                                            background: 'var(--surface)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                            <div style={{ fontWeight: 700, fontSize: 14 }}>{n.title}</div>
                                            <span style={{ fontSize: 10, color: 'var(--text3)', whiteSpace: 'nowrap', marginLeft: 8 }}>
                                                {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{n.body}</div>
                                        <div style={{ marginTop: 8 }}>
                                            <span style={{
                                                fontSize: 10, fontWeight: 700, padding: '3px 8px',
                                                borderRadius: 6, background: 'rgba(255,123,84,0.1)',
                                                color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em'
                                            }}>{n.type || 'announcement'}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
