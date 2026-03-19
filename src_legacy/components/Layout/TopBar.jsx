import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, CheckCircle2 } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';

export default function TopBar({ title }) {
    const { user } = useAuth();
    const { enabled, permission, enableNotifications, latestMessage } = useNotifications();
    const [showToast, setShowToast] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const dropdownRef = useRef(null);
    const now = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Fetch Admin notifications from Firestore
    useEffect(() => {
        const q = query(
            collection(db, 'notifications'),
            where('target', '==', 'admin'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = [];
            snapshot.forEach((doc) => {
                notifs.push({ id: doc.id, ...doc.data() });
            });
            setNotifications(notifs);
        });

        return () => unsubscribe();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (notifId, e) => {
        e.stopPropagation();
        try {
            await updateDoc(doc(db, 'notifications', notifId), { isRead: true });
        } catch (error) {
            console.error("Error marking read:", error);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Show toast when a foreground message arrives
    React.useEffect(() => {
        if (latestMessage) {
            setShowToast(true);
            const t = setTimeout(() => setShowToast(false), 5000);
            return () => clearTimeout(t);
        }
    }, [latestMessage]);

    return (
        <div className="topbar">
            <div>
                <h1 style={{ fontSize: 20, fontWeight: 700 }}>{title}</h1>
                <div className="greeting" style={{ marginTop: 2 }}>{now}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

                {/* Notification Bell Dropdown Wrapper */}
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                    <button
                        className={`btn btn-icon ${enabled ? 'btn-primary' : 'btn-outline'}`}
                        style={{ position: 'relative' }}
                        onClick={() => {
                            if (!enabled) enableNotifications();
                            setShowDropdown(!showDropdown);
                        }}
                        title="Notifications"
                    >
                        {enabled ? <Bell size={16} /> : <BellOff size={16} />}
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute', top: -4, right: -4,
                                minWidth: 16, height: 16, borderRadius: 8,
                                background: 'var(--danger)', border: '1.5px solid var(--bg)',
                                color: 'white', fontSize: 10, fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px'
                            }}>
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                        <div style={{
                            position: 'absolute', top: '100%', right: 0, marginTop: 8,
                            width: 320, maxHeight: 400, overflowY: 'auto',
                            background: 'var(--surface)', border: '1px solid var(--border)',
                            borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                            zIndex: 1000, display: 'flex', flexDirection: 'column'
                        }}>
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
                                Notifications
                            </div>

                            {notifications.length === 0 ? (
                                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)' }}>
                                    <Bell size={32} style={{ opacity: 0.2, marginBottom: 8 }} />
                                    <div>No notifications yet</div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            style={{
                                                padding: '12px 16px',
                                                borderBottom: '1px solid var(--border)',
                                                background: notif.isRead ? 'transparent' : 'rgba(var(--primary-rgb), 0.05)',
                                                display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer'
                                            }}
                                            onClick={() => {
                                                if (!notif.isRead) handleMarkAsRead(notif.id, { stopPropagation: () => { } });
                                                setShowDropdown(false);
                                                // Optional: parse notif.data.screen and navigate if router is available here
                                            }}
                                        >
                                            <div style={{
                                                width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 6,
                                                background: notif.isRead ? 'transparent' : 'var(--primary)'
                                            }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, fontSize: 13, color: notif.isRead ? 'var(--text2)' : 'var(--text)' }}>
                                                    {notif.title}
                                                </div>
                                                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                                                    {notif.body}
                                                </div>
                                                {notif.createdAt && (
                                                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>
                                                        {new Date(notif.createdAt.toDate()).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                            {!notif.isRead && (
                                                <button
                                                    onClick={(e) => handleMarkAsRead(notif.id, e)}
                                                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 4 }}
                                                    title="Mark as read"
                                                >
                                                    <CheckCircle2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Admin info */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: '8px 14px'
                }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, color: 'white'
                    }}>A</div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>Admin</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{user?.email}</div>
                    </div>
                </div>
            </div>

            {/* Foreground notification toast */}
            {showToast && latestMessage && (
                <div style={{
                    position: 'fixed', top: 16, right: 16, zIndex: 9999,
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '14px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    minWidth: 280, maxWidth: 360, animation: 'slideIn 0.3s ease',
                }}>
                    <Bell size={18} style={{ color: 'var(--primary)', marginTop: 2, flexShrink: 0 }} />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                            {latestMessage.notification?.title || 'New Notification'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                            {latestMessage.notification?.body}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowToast(false)}
                        style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', marginLeft: 'auto' }}
                    >✕</button>
                </div>
            )}
        </div>
    );
}
