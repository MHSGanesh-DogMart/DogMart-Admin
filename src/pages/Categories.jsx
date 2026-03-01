import React, { useEffect, useState } from 'react';
import TopBar from '../components/Layout/TopBar';
import { db } from '../firebase/config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { Plus, Pencil, Trash2, X, Tag } from 'lucide-react';

function CategoryForm({ category, onSave, onClose, existingCategories }) {
    const [form, setForm] = useState(category || {
        name: '',
        emoji: '🐾',
        color: '0xFFF9EDE4',
        border: false,
        isActive: true
    });
    const [saving, setSaving] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSave = async () => {
        setSaving(true);
        try {
            if (category?.id) {
                await updateDoc(doc(db, 'categories', category.id), { ...form, updatedAt: serverTimestamp() });
                onSave({ ...form, id: category.id });
            } else {
                // Find next numeric ID
                let nextId = 1;
                if (existingCategories && existingCategories.length > 0) {
                    const ids = existingCategories.map(c => parseInt(c.id)).filter(id => !isNaN(id));
                    if (ids.length > 0) {
                        nextId = Math.max(...ids) + 1;
                    }
                }

                const idStr = String(nextId);
                const ref = doc(db, 'categories', idStr);
                const newCategory = { ...form, id: idStr, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
                await setDoc(ref, newCategory);
                onSave(newCategory);
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
                <div className="form-group">
                    <label className="form-label">Category Name</label>
                    <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Dog, Cat, Bird" />
                </div>
                <div className="form-group">
                    <label className="form-label">Emoji Icon</label>
                    <input className="form-input" value={form.emoji} onChange={e => set('emoji', e.target.value)} placeholder="e.g. 🐕" />
                </div>
                <div className="form-group">
                    <label className="form-label">Background Color (Hex Format for Flutter)</label>
                    <input className="form-input" value={form.color} onChange={e => set('color', e.target.value)} placeholder="0xFFF9EDE4" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <button className={`toggle ${form.border ? 'on' : ''}`} onClick={() => set('border', !form.border)} />
                    <span className="text-sm">Show Border on Icon</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <button className={`toggle ${form.isActive ? 'on' : ''}`} onClick={() => set('isActive', !form.isActive)} />
                    <span className="text-sm">{form.isActive ? 'Active - Selectable in app' : 'Inactive - Hidden from selection'}</span>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.name.trim()} style={{ flex: 1, justifyContent: 'center' }}>
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

    useEffect(() => {
        getDocs(query(collection(db, 'categories'), orderBy('name', 'asc')))
            .then(snap => setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = (category) => {
        setCategories(prev => {
            const exists = prev.find(c => c.id === category.id);
            let arr;
            if (exists) {
                arr = prev.map(c => c.id === category.id ? category : c);
            } else {
                arr = [category, ...prev];
            }
            return arr.sort((a, b) => a.name.localeCompare(b.name));
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await deleteDoc(doc(db, 'categories', id));
            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (e) {
            console.error(e);
            alert('Failed to delete category');
        }
    };

    const handleToggle = async (category) => {
        try {
            await updateDoc(doc(db, 'categories', category.id), { isActive: !category.isActive, updatedAt: serverTimestamp() });
            setCategories(prev => prev.map(c => c.id === category.id ? { ...c, isActive: !c.isActive } : c));
        } catch (e) {
            console.error(e);
            alert('Failed to toggle status');
        }
    };

    return (
        <div>
            <TopBar title="Categories Options" />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Pet Categories List</h2>
                        <p className="page-subtitle">Manage dynamic categories and emojis available to users in the app.</p>
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
                            <p className="text-sm">Create the first category for the app.</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Emoji</th>
                                        <th>Name</th>
                                        <th>Color Hex</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map(cat => (
                                        <tr key={cat.id}>
                                            <td className="text-muted" style={{ fontWeight: 600 }}>#{cat.id}</td>
                                            <td style={{ fontSize: '20px' }}>{cat.emoji}</td>
                                            <td style={{ fontWeight: 600 }}>{cat.name}</td>
                                            <td>{cat.color}</td>
                                            <td>
                                                <span className={`badge ${cat.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                    {cat.isActive ? "Active" : "Hidden"}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                    <button className={`toggle ${cat.isActive ? "on" : ""}`} onClick={() => handleToggle(cat)} title="Toggle active in app" />
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
            {showForm && <CategoryForm category={formCategory} onSave={handleSave} onClose={() => setShowForm(false)} existingCategories={categories} />}
        </div>
    );
}
