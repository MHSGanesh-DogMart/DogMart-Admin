import React, { useEffect, useState } from 'react';
import TopBar from '../components/Layout/TopBar';
import api from '../utils/api';
import { Plus, Pencil, Trash2, X, Tag, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';

function CategoryForm({ category, onSave, onClose }) {
    const [form, setForm] = useState(category || {
        name: '',
        emoji: '🐾',
        imageUrl: '',
        colorHex: '0xFFF9EDE4',
        isActive: true
    });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await api.post('/categories/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                // The backend returns a relative path like /uploads/categories/...
                // We'll store this URL in the form
                set('imageUrl', res.data.url);
            }
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Image upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (category?.id) {
                await api.put(`/categories/${category.id}`, form);
                onSave({ ...form, id: category.id });
            } else {
                const res = await api.post('/categories', form);
                onSave(res.data.category);
            }
            onClose();
        } catch (e) {
            console.error(e);
            alert('Failed to save category');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h2 className="modal-title">{category ? 'Edit Category' : 'Add New Category'}</h2>
                    <button className="modal-close" onClick={onClose}><X size={18} /></button>
                </div>

                <div className="form-group" style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{
                        width: 100, height: 100, borderRadius: 20,
                        background: 'var(--primary-light)',
                        margin: '0 auto 16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', border: '2px dashed var(--primary)',
                        position: 'relative'
                    }}>
                        {uploading ? (
                            <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                        ) : form.imageUrl ? (
                            <img src={form.imageUrl.startsWith('/') ? `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}${form.imageUrl}` : form.imageUrl}
                                alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ fontSize: 40 }}>{form.emoji}</span>
                        )}

                        <label style={{
                            position: 'absolute', bottom: 0, right: 0,
                            background: 'var(--primary)', color: 'white',
                            padding: 6, borderRadius: '10px 0 0 0', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Upload size={14} />
                            <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                        </label>
                    </div>
                    <p className="text-sm text-muted">Click the upload icon to set category image</p>
                </div>

                <div className="form-group">
                    <label className="form-label">Category Name</label>
                    <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Dog, Cat, Bird" />
                </div>

                <div className="grid-2">
                    <div className="form-group">
                        <label className="form-label">Emoji Fallback</label>
                        <input className="form-input" value={form.emoji} onChange={e => set('emoji', e.target.value)} placeholder="e.g. 🐕" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Background Color</label>
                        <input className="form-input" value={form.colorHex} onChange={e => set('colorHex', e.target.value)} placeholder="0xFFF9EDE4" />
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <button className={`toggle ${form.isActive ? 'on' : ''}`} onClick={() => set('isActive', !form.isActive)} />
                    <span className="text-sm">{form.isActive ? 'Active - Visible in app' : 'Inactive - Hidden'}</span>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving || uploading || !form.name.trim()} style={{ flex: 1, justifyContent: 'center' }}>
                        {saving ? 'Saving...' : 'Save Category'}
                    </button>
                    <button className="btn btn-outline" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [formCategory, setFormCategory] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get('/categories');
            setCategories(res.data.categories || []);
        } catch (e) {
            console.error('Failed to fetch categories:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSave = (category) => {
        fetchCategories();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await api.delete(`/categories/${id}`);
            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (e) {
            console.error(e);
            alert('Failed to delete category');
        }
    };

    const handleToggle = async (id) => {
        try {
            await api.patch(`/categories/${id}/toggle`);
            setCategories(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
        } catch (e) {
            console.error(e);
            alert('Failed to toggle status');
        }
    };

    return (
        <div>
            <TopBar title="Categories Management" />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Pet Categories List</h2>
                        <p className="page-subtitle">Add custom images or use emojis for pet categories.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => { setFormCategory(null); setShowForm(true); }}>
                        <Plus size={15} /> Add Category
                    </button>
                </div>

                {loading ? <div className="loading-center"><div className="spinner" /></div> :
                    categories.length === 0 ? (
                        <div className="empty-state">
                            <Tag size={40} />
                            <h3>No categories found</h3>
                            <p className="text-sm">Create the first category with a custom icon or image.</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Visual</th>
                                        <th>Name</th>
                                        <th>Color</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map(cat => (
                                        <tr key={cat.id}>
                                            <td className="text-muted">#{cat.id}</td>
                                            <td>
                                                <div style={{
                                                    width: 44, height: 44, borderRadius: 12,
                                                    background: 'var(--primary-light)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    overflow: 'hidden', border: '1px solid var(--border)'
                                                }}>
                                                    {cat.imageUrl ? (
                                                        <img src={cat.imageUrl} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <span style={{ fontSize: 24 }}>{cat.emoji}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{cat.name}</td>
                                            <td><code style={{ fontSize: 11 }}>{cat.colorHex}</code></td>
                                            <td>
                                                <span className={`badge ${cat.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                    {cat.isActive ? "Active" : "Hidden"}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                    <button className={`toggle ${cat.isActive ? "on" : ""}`} onClick={() => handleToggle(cat.id)} />
                                                    <button className="btn btn-outline btn-sm" onClick={() => { setFormCategory(cat); setShowForm(true); }}>
                                                        <Pencil size={13} />
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.id)}>
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                }
            </div>
            {showForm && <CategoryForm category={formCategory} onSave={handleSave} onClose={() => setShowForm(false)} />}
        </div>
    );
}
