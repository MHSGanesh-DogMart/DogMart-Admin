import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Mail, CheckCircle, Clock, Trash2, Search } from 'lucide-react';

export default function Support() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const q = query(
            collection(db, 'contact_messages'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messagesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Handle Firestore server timestamp nicely
                createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
            }));
            setMessages(messagesData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching support messages:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleMarkStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'unread' ? 'read' : 'unread';
            await updateDoc(doc(db, 'contact_messages', id), {
                status: newStatus
            });
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            try {
                await deleteDoc(doc(db, 'contact_messages', id));
            } catch (error) {
                console.error("Error deleting message:", error);
            }
        }
    };

    const filteredMessages = messages.filter(msg => {
        const matchesSearch =
            msg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.comment?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' ? true : msg.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="loading">Loading support messages...</div>;

    return (
        <div className="support-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px', color: '#1E293B' }}>
                    <Mail size={28} color="#FF7B54" />
                    Support Inbox
                </h1>
                <div style={{ background: '#FFFCF9', padding: '8px 16px', borderRadius: '50px', border: '1px solid #FF7B54', color: '#FF7B54', fontWeight: 600 }}>
                    {messages.filter(m => m.status === 'unread').length} Unread Messages
                </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                    <Search size={20} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or message..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }}
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', minWidth: '150px' }}
                >
                    <option value="all">All Messages</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                </select>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
                {filteredMessages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', color: '#64748B' }}>
                        No messages found.
                    </div>
                ) : (
                    filteredMessages.map(msg => (
                        <div key={msg.id} style={{
                            background: 'white', borderRadius: '16px', padding: '24px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                            borderLeft: `4px solid ${msg.status === 'unread' ? '#FF7B54' : '#E2E8F0'}`,
                            display: 'flex', flexDirection: 'column', gap: '16px'
                        }}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {msg.name}
                                        {msg.status === 'unread' && <span style={{ fontSize: '0.75rem', background: '#FEF3C7', color: '#D97706', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>New</span>}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '16px', color: '#64748B', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={14} /> <a href={`mailto:${msg.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{msg.email}</a></span>
                                        {msg.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>• {msg.phone}</span>}
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>• {msg.createdAt.toLocaleDateString()} {msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => handleMarkStatus(msg.id, msg.status)}
                                        style={{
                                            padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                                            background: msg.status === 'unread' ? '#F1F5F9' : '#DCFCE7',
                                            color: msg.status === 'unread' ? '#475569' : '#166534',
                                            border: 'none', transition: 'all 0.2s'
                                        }}
                                    >
                                        {msg.status === 'unread' ? <><CheckCircle size={16} /> Mark as Read</> : <><Clock size={16} /> Mark Unread</>}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(msg.id)}
                                        style={{ padding: '8px', background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        title="Delete Message"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                {msg.comment}
                            </div>

                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
