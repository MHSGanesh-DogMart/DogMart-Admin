import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { db } from '../firebase/config';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function ChatModal({ booking, onClose }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const auth = getAuth();

    const canChat = booking.status === 'confirmed' || booking.status === 'active';

    useEffect(() => {
        if (!booking?.id) return;

        const q = query(
            collection(db, 'chats', booking.id, 'messages'),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);
            setLoading(false);
            scrollToBottom();
        });

        return () => unsubscribe();
    }, [booking?.id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e?.preventDefault();
        const text = newMessage.trim();
        if (!text || !canChat) return;

        setNewMessage('');
        try {
            await addDoc(collection(db, 'chats', booking.id, 'messages'), {
                senderId: auth.currentUser?.email || 'admin@dogmart.app',
                senderName: 'Admin',
                senderType: 'admin',
                message: text,
                timestamp: serverTimestamp(),
                isRead: false
            });
            scrollToBottom();

            // Fire Push Notification to User
            const apiUrl = import.meta.env.VITE_API_URL || 'http://65.2.129.246:3001';
            fetch(`${apiUrl}/api/notifications/chat-message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId: booking.id,
                    senderType: 'admin',
                    senderName: 'Admin',
                    messageText: text
                })
            }).catch(e => console.error("Error triggering push notification:", e));

        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 450, padding: 0, height: '80vh', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                    <div>
                        <h2 className="modal-title" style={{ fontSize: 18 }}>Chat with User</h2>
                        <p className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>Booking #{booking.id.slice(-6).toUpperCase()}</p>
                    </div>
                    <button className="modal-close" onClick={onClose}><X size={20} /></button>
                </div>

                {/* Messages Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12, backgroundColor: 'var(--bg-secondary)', borderRadius: '0 0 12px 12px' }}>
                    {loading ? (
                        <div style={{ margin: 'auto' }} className="spinner" />
                    ) : messages.length === 0 ? (
                        <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <p>{canChat ? "No messages yet. Say hello!" : "Chat is locked. Messages will appear here."}</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isAdmin = msg.senderType === 'admin';
                            return (
                                <div key={msg.id} style={{
                                    alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%',
                                }}>
                                    <div style={{
                                        backgroundColor: isAdmin ? 'var(--primary)' : 'var(--card-bg)',
                                        color: isAdmin ? 'white' : 'var(--text)',
                                        padding: '10px 14px',
                                        borderRadius: isAdmin ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                        border: isAdmin ? 'none' : '1px solid var(--border)',
                                        fontSize: 14,
                                        lineHeight: 1.4
                                    }}>
                                        {msg.message}
                                    </div>
                                    <div style={{
                                        fontSize: 11,
                                        color: 'var(--text-muted)',
                                        marginTop: 4,
                                        textAlign: isAdmin ? 'right' : 'left',
                                        padding: '0 4px'
                                    }}>
                                        {!isAdmin && <span style={{ fontWeight: 600 }}>User • </span>}
                                        {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{ padding: 16, borderTop: '1px solid var(--border)', backgroundColor: 'var(--card-bg)', borderRadius: '0 0 12px 12px' }}>
                    {canChat ? (
                        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 10 }}>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="input"
                                style={{ flex: 1, borderRadius: 20, padding: '10px 16px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'white' }}
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: '50%',
                                    backgroundColor: newMessage.trim() ? 'var(--primary)' : 'var(--border)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: 'none',
                                    cursor: newMessage.trim() ? 'pointer' : 'default',
                                    transition: '0.2s'
                                }}
                            >
                                <Send size={18} style={{ marginLeft: 2 }} />
                            </button>
                        </form>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '8px 0' }}>
                            Booking is {booking.status}. Chat is read-only.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
