import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, UploadCloud, Search, Image as ImageIcon, Loader2 } from 'lucide-react';
import { tokens } from '../styles/DesignTokens';
import TopBar from '../components/Layout/TopBar';
import api from '../utils/api';

export default function Banners() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({ title: '', description: '', imageUrl: '', linkUrl: '', tag: '', isActive: true });

    useEffect(() => { fetchBanners(); }, []);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const res = await api.get('/banners/all');
            if (res.data.banners) setBanners(res.data.banners);
        } catch (err) {
            console.error('Failed to fetch banners', err);
        }
        setLoading(false);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await api.post('/banners/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.url) setForm({ ...form, imageUrl: res.data.url });
        } catch (err) {
            console.error('Upload failed', err);
            alert("Upload failed. Make sure you select a valid image.");
        }
        setUploading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingBanner) {
                await api.put(`/banners/${editingBanner.id}`, form);
            } else {
                await api.post('/banners', form);
            }

            setModalOpen(false);
            fetchBanners();
        } catch (err) {
            console.error('Submit failed', err);
            alert("Failed to save banner.");
        }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) return;
        try {
            await api.delete(`/banners/${id}`);
            fetchBanners();
        } catch (err) {
            console.error('Delete failed', err);
            alert("Failed to delete banner.");
        }
    };

    const openEdit = (b) => {
        setEditingBanner(b);
        setForm({
            title: b.title || '',
            description: b.description || '',
            imageUrl: b.imageUrl || '',
            linkUrl: b.linkUrl || '',
            tag: b.tag || '',
            isActive: b.isActive
        });
        setModalOpen(true);
    };

    const openCreate = () => {
        setEditingBanner(null);
        setForm({ title: '', description: '', imageUrl: '', linkUrl: '', tag: '', isActive: true });
        setModalOpen(true);
    };

    const handleToggleActive = async (banner) => {
        try {
            await api.put(`/banners/${banner.id}`, { isActive: !banner.isActive });
            setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, isActive: !banner.isActive } : b));
        } catch (err) {
            console.error(err);
        }
    };

    const filtered = banners.filter(b => b.title?.toLowerCase().includes(searchTerm.toLowerCase()) || b.description?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div>
            <TopBar title="Promo Banners" />

            <div className="page-content">
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <h2 className="page-title">Manage Banners</h2>
                        <p className="page-subtitle">Configure application-wide hero banners and promotional carousels.</p>
                    </div>

                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: 260 }}>
                            <Search style={{ position: 'absolute', left: 16, top: 12, color: 'var(--text3)' }} size={18} />
                            <input
                                className="form-input"
                                placeholder="Search campaigns..."
                                style={{ paddingLeft: 44, height: 44, borderRadius: 12 }}
                                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={openCreate} className="btn btn-primary" style={{ padding: '0 20px', height: 44 }}>
                            <Plus size={18} style={{ marginRight: 6 }} /> New Banner
                        </button>
                    </div>
                </div>

                {loading ? <div className="loading-center"><div className="spinner" /></div> :
                    filtered.length === 0 ? (
                        <div className="empty-state">
                            <ImageIcon size={48} style={{ color: 'var(--text3)', marginBottom: 16 }} />
                            <h3>No active campaigns</h3>
                            <p className="text-sm">Create your first promo banner to engage users.</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Visual</th>
                                        <th>Campaign Details</th>
                                        <th>Badge/Link</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(b => (
                                        <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                            <td>
                                                <div style={{
                                                    width: 140, height: 70, borderRadius: 12,
                                                    background: 'var(--surface2)', overflow: 'hidden',
                                                    border: '1px solid var(--border)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    {b.imageUrl ?
                                                        <img src={b.imageUrl.startsWith('/') ? `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}${b.imageUrl}` : b.imageUrl}
                                                            alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        : <ImageIcon color="var(--text3)" />
                                                    }
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 700, color: 'var(--text1)', fontSize: 15, marginBottom: 4 }}>{b.title || 'Untitled Campaign'}</div>
                                                <div style={{ fontSize: 13, color: 'var(--text2)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {b.description || 'No description provided.'}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                                                    {b.tag ? <span style={{ padding: '4px 10px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>{b.tag.toUpperCase()}</span> : <span className="text-muted text-sm">—</span>}
                                                    {b.linkUrl && <a href={b.linkUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--primary)', textDecoration: 'underline', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.linkUrl}</a>}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <button className={`toggle ${b.isActive ? "on" : ""}`} onClick={() => handleToggleActive(b)} />
                                                    <span className={`badge ${b.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                        {b.isActive ? "Live" : "Hidden"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                    <button onClick={() => openEdit(b)} className="btn btn-outline btn-sm">
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button onClick={() => handleDelete(b.id)} className="btn btn-danger btn-sm">
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                }
            </div>

            <AnimatePresence>
                {modalOpen && (
                    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="modal" style={{ width: '100%', maxWidth: 540 }}
                        >
                            <div className="modal-header">
                                <h2 className="modal-title">{editingBanner ? 'Edit Campaign' : 'New Campaign Banner'}</h2>
                                <button className="modal-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div>
                                    <label className="form-label">Banner Image Banner (16:9 Recommended) *</label>
                                    <div style={{
                                        border: '2px dashed var(--border)', borderRadius: 16, padding: 24, textAlign: 'center',
                                        cursor: 'pointer', position: 'relative', overflow: 'hidden',
                                        background: form.imageUrl ? 'transparent' : 'var(--surface2)',
                                        transition: 'all 0.2s'
                                    }}>
                                        {form.imageUrl ? (
                                            <img
                                                src={form.imageUrl.startsWith('/') ? `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}${form.imageUrl}` : form.imageUrl}
                                                alt="Preview"
                                                style={{ width: '100%', height: 160, objectFit: 'contain' }}
                                            />
                                        ) : (
                                            <div style={{ color: 'var(--text3)' }}>
                                                <UploadCloud size={32} style={{ margin: '0 auto 12px' }} />
                                                <div style={{ fontWeight: 600, color: 'var(--text1)' }}>Click or drag image here</div>
                                                <div style={{ fontSize: 13, marginTop: 4 }}>PNG, JPG, up to 5MB</div>
                                            </div>
                                        )}
                                        <input type="file" onChange={handleFileUpload} accept="image/*" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} disabled={uploading} />
                                        {uploading && (
                                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                                <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                                                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Uploading...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid-2">
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Headline Title</label>
                                        <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. 40% Off Grooming" />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Promo Badge / Tag</label>
                                        <input className="form-input" value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} placeholder="e.g. LIMITED" />
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Campaign Description</label>
                                    <textarea className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Write a short subtext for this promotion..." style={{ minHeight: 80, resize: 'vertical' }} />
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Action URL (Link Clicked)</label>
                                    <input className="form-input" value={form.linkUrl} onChange={e => setForm({ ...form, linkUrl: e.target.value })} placeholder="https://..." />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
                                    <button type="button" className={`toggle ${form.isActive ? 'on' : ''}`} onClick={() => setForm({ ...form, isActive: !form.isActive })} />
                                    <div>
                                        <div style={{ fontWeight: 700, color: 'var(--text1)', fontSize: 14 }}>Publish Immediately</div>
                                        <div style={{ fontSize: 12, color: 'var(--text3)' }}>Make this banner visible in the mobile app.</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                    <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} disabled={saving || uploading}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={!form.imageUrl || uploading || saving}>
                                        {saving ? <Loader2 className="animate-spin" size={18} /> : (editingBanner ? 'Save Changes' : 'Create Campaign')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
