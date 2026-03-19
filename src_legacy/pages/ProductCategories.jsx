import React, { useEffect, useState } from 'react';
import TopBar from '../components/Layout/TopBar';
import api from '../utils/api';
import { Plus, Pencil, Trash2, X, ShoppingBag, Loader2, ChevronDown, ChevronRight } from 'lucide-react';

function CategoryForm({ category, onSave, onClose }) {
    const [form, setForm] = useState(category || {
        name: '',
        emoji: '🛍️',
        order: 0,
        isActive: true
    });
    const [saving, setSaving] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSave = async () => {
        setSaving(true);
        try {
            if (category?.id) {
                await api.put(`/product-categories/${category.id}`, form);
                onSave({ ...form, id: category.id });
            } else {
                const res = await api.post('/product-categories', form);
                onSave(res.data);
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
                    <h2 className="modal-title">{category ? 'Edit Product Category' : 'Add Product Category'}</h2>
                    <button className="modal-close" onClick={onClose}><X size={18} /></button>
                </div>

                <div className="form-group">
                    <label className="form-label">Category Name</label>
                    <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Food & Treats" />
                </div>

                <div className="grid-2">
                    <div className="form-group">
                        <label className="form-label">Emoji Icon</label>
                        <input className="form-input" value={form.emoji} onChange={e => set('emoji', e.target.value)} placeholder="e.g. 🍖" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Display Order</label>
                        <input className="form-input" type="number" value={form.order} onChange={e => set('order', e.target.value)} />
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <button className={`toggle ${form.isActive ? 'on' : ''}`} onClick={() => set('isActive', !form.isActive)} />
                    <span className="text-sm">{form.isActive ? 'Active' : 'Inactive'}</span>
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

function SubCategoryForm({ catId, subCategory, onSave, onClose }) {
    const [form, setForm] = useState(subCategory || {
        name: '',
        order: 0,
        isActive: true
    });
    const [saving, setSaving] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSave = async () => {
        setSaving(true);
        try {
            if (subCategory?.id) {
                await api.put(`/product-categories/subs/${subCategory.id}`, form);
                onSave({ ...form, id: subCategory.id });
            } else {
                const res = await api.post(`/product-categories/${catId}/subs`, form);
                onSave(res.data);
            }
            onClose();
        } catch (e) {
            console.error(e);
            alert('Failed to save sub-category');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h2 className="modal-title">{subCategory ? 'Edit Sub-Category' : 'Add Sub-Category'}</h2>
                    <button className="modal-close" onClick={onClose}><X size={18} /></button>
                </div>

                <div className="form-group">
                    <label className="form-label">Sub-Category Name</label>
                    <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Dry Food" />
                </div>

                <div className="form-group">
                    <label className="form-label">Display Order</label>
                    <input className="form-input" type="number" value={form.order} onChange={e => set('order', e.target.value)} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <button className={`toggle ${form.isActive ? 'on' : ''}`} onClick={() => set('isActive', !form.isActive)} />
                    <span className="text-sm">{form.isActive ? 'Active' : 'Inactive'}</span>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.name.trim()} style={{ flex: 1, justifyContent: 'center' }}>
                        {saving ? 'Saving...' : 'Save Sub-Category'}
                    </button>
                    <button className="btn btn-outline" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default function ProductCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCatForm, setShowCatForm] = useState(false);
    const [showSubForm, setShowSubForm] = useState(false);
    const [selectedCat, setSelectedCat] = useState(null);
    const [selectedSub, setSelectedSub] = useState(null);
    const [expandedCats, setExpandedCats] = useState({});

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get('/product-categories');
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

    const toggleExpand = (id) => {
        setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div>
            <TopBar title="Product Categories" />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Manage Product Categories</h2>
                        <p className="page-subtitle">Administer main categories and their sub-categories.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => { setSelectedCat(null); setShowCatForm(true); }}>
                        <Plus size={15} /> Add Category
                    </button>
                </div>

                {loading ? <div className="loading-center"><div className="spinner" /></div> :
                    categories.length === 0 ? (
                        <div className="empty-state">
                            <ShoppingBag size={40} />
                            <h3>No product categories</h3>
                            <p className="text-sm">Start by adding a category like "Food & Treats".</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: 40 }}></th>
                                        <th>Name</th>
                                        <th>Icon</th>
                                        <th>Order</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map(cat => (
                                        <React.Fragment key={cat.id}>
                                            <tr>
                                                <td>
                                                    <button className="btn-icon" onClick={() => toggleExpand(cat.id)}>
                                                        {expandedCats[cat.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                    </button>
                                                </td>
                                                <td style={{ fontWeight: 700 }}>{cat.name}</td>
                                                <td style={{ fontSize: 20 }}>{cat.emoji}</td>
                                                <td>{cat.order}</td>
                                                <td>
                                                    <span className={`badge ${cat.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                        {cat.isActive ? 'Active' : 'Hidden'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <button className="btn btn-outline btn-sm" onClick={() => { setSelectedCat(cat); setShowCatForm(true); }}>
                                                            <Pencil size={13} />
                                                        </button>
                                                        <button className="btn btn-primary btn-sm" onClick={() => { setSelectedCat(cat); setSelectedSub(null); setShowSubForm(true); }}>
                                                            <Plus size={13} /> Sub
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedCats[cat.id] && cat.subs && cat.subs.map(sub => (
                                                <tr key={sub.id} style={{ background: 'rgba(0,0,0,0.02)' }}>
                                                    <td></td>
                                                    <td style={{ paddingLeft: 30, fontSize: 13, color: 'var(--text2)' }}>└─ {sub.name}</td>
                                                    <td></td>
                                                    <td>{sub.order}</td>
                                                    <td>
                                                        <span className={`badge ${sub.isActive ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 10, padding: '2px 6px' }}>
                                                            {sub.isActive ? 'Active' : 'Hidden'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-outline btn-sm" onClick={() => { setSelectedCat(cat); setSelectedSub(sub); setShowSubForm(true); }}>
                                                            <Pencil size={11} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                }
            </div>

            {showCatForm && <CategoryForm category={selectedCat} onSave={fetchCategories} onClose={() => setShowCatForm(false)} />}
            {showSubForm && <SubCategoryForm catId={selectedCat?.id} subCategory={selectedSub} onSave={fetchCategories} onClose={() => setShowSubForm(false)} />}
        </div>
    );
}
