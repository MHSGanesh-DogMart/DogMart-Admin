import React, { useEffect, useState } from 'react';
import TopBar from '../components/Layout/TopBar';
import { db } from '../firebase/config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { Plus, Pencil, Trash2, X, Tag, Info } from 'lucide-react';

function BreedForm({ breed, categories, onSave, onClose, existingBreeds }) {
    const [form, setForm] = useState(breed || {
        name: '',
        size: 'Medium',
        categoryId: categories.length > 0 ? categories[0].id : '',
        avgPriceMin: 0,
        avgPriceMax: 0,
        temperament: '',
        isActive: true
    });
    const [saving, setSaving] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSave = async () => {
        setSaving(true);
        try {
            if (breed?.id) {
                await updateDoc(doc(db, 'breeds', breed.id), { ...form, updatedAt: serverTimestamp() });
                onSave({ ...form, id: breed.id });
            } else {
                // Find next numeric ID
                let nextId = 1;
                if (existingBreeds && existingBreeds.length > 0) {
                    const ids = existingBreeds.map(b => parseInt(b.id)).filter(id => !isNaN(id));
                    if (ids.length > 0) {
                        nextId = Math.max(...ids) + 1;
                    }
                }

                const idStr = String(nextId);
                const ref = doc(db, 'breeds', idStr);
                const newBreed = { ...form, id: idStr, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
                await setDoc(ref, newBreed);
                onSave(newBreed);
            }
            onClose();
        } catch (e) {
            console.error(e);
            alert('Failed to save breed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h2 className="modal-title">{breed ? 'Edit Breed' : 'Add New Breed'}</h2>
                    <button className="modal-close" onClick={onClose}><X size={18} /></button>
                </div>
                <div className="form-group">
                    <label className="form-label">Breed Name</label>
                    <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Golden Retriever" />
                </div>
                <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Size Category</label>
                    <select className="form-select" value={form.size} onChange={e => set('size', e.target.value)}>
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                        <option value="Giant">Giant</option>
                    </select>
                </div>
                <div className="grid-2">
                    <div className="form-group">
                        <label className="form-label">Avg Min Price (₹)</label>
                        <input type="number" className="form-input" value={form.avgPriceMin} onChange={e => set('avgPriceMin', Number(e.target.value))} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Avg Max Price (₹)</label>
                        <input type="number" className="form-input" value={form.avgPriceMax} onChange={e => set('avgPriceMax', Number(e.target.value))} />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Temperament (comma separated)</label>
                    <textarea className="form-textarea" value={form.temperament} onChange={e => set('temperament', e.target.value)} placeholder="e.g. Playful, Intelligent, Friendly" rows={2} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <button className={`toggle ${form.isActive ? 'on' : ''}`} onClick={() => set('isActive', !form.isActive)} />
                    <span className="text-sm">{form.isActive ? 'Active - Selectable in app' : 'Inactive - Hidden from selection'}</span>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.name.trim()} style={{ flex: 1, justifyContent: 'center' }}>
                        {saving ? 'Saving...' : 'Save Breed'}
                    </button>
                    <button className="btn btn-outline" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default function Breeds() {
    const [breeds, setBreeds] = useState([]);
    const [categories, setCategories] = useState([]);
    const [formBreed, setFormBreed] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const catsSnap = await getDocs(query(collection(db, 'categories'), orderBy('name', 'asc')));
                const catsData = catsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                setCategories(catsData);

                const breedsSnap = await getDocs(query(collection(db, 'breeds'), orderBy('name', 'asc')));
                const breedsData = breedsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                setBreeds(breedsData);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const handleSave = (breed) => {
        setBreeds(prev => {
            const exists = prev.find(c => c.id === breed.id);
            let arr;
            if (exists) {
                arr = prev.map(c => c.id === breed.id ? breed : c);
            } else {
                arr = [breed, ...prev];
            }
            return arr.sort((a, b) => a.name.localeCompare(b.name));
        });
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this breed? It may be linked to existing listings.')) return;
        try {
            await deleteDoc(doc(db, 'breeds', id));
            setBreeds(prev => prev.filter(c => c.id !== id));
        } catch (e) {
            console.error(e);
            alert('Failed to delete breed');
        }
    };

    const handleToggle = async (breed) => {
        try {
            await updateDoc(doc(db, 'breeds', breed.id), { isActive: !breed.isActive, updatedAt: serverTimestamp() });
            setBreeds(prev => prev.map(c => c.id === breed.id ? { ...c, isActive: !c.isActive } : c));
        } catch (e) {
            console.error(e);
            alert('Failed to toggle status');
        }
    };

    return (
        <div>
            <TopBar title="Breeds Master" />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Breeds Master List</h2>
                        <p className="page-subtitle">Manage the dropdown list of dog breeds available to sellers and buyers in the app.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => { setFormBreed(null); setShowForm(true); }}>
                        <Plus size={15} /> Add Breed
                    </button>
                </div>
                {loading ? <div className="loading-center"><div className="spinner" /></div> :
                    breeds.length === 0 ? (
                        <div className="empty-state">
                            <Tag size={40} />
                            <h3>No breeds in master list</h3>
                            <p className="text-sm">Add your first dog breed to populate the app's dropdowns.</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Breed Name</th>
                                        <th>Category</th>
                                        <th>Size</th>
                                        <th>Avg Price Range</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {breeds.map(breed => (
                                        <tr key={breed.id}>
                                            <td className="text-muted" style={{ fontWeight: 600 }}>#{breed.id}</td>
                                            <td style={{ fontWeight: 600 }}>{breed.name}</td>
                                            <td>{categories.find(c => c.id === breed.categoryId)?.name || 'Unknown'}</td>
                                            <td>{breed.size}</td>
                                            <td> {breed.avgPriceMin || breed.avgPriceMax ? `₹${breed.avgPriceMin} - ₹${breed.avgPriceMax}` : " "} </td>
                                            <td>
                                                <span className={`badge ${breed.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                    {breed.isActive ? "Active" : "Hidden"}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                    <button className={`toggle ${breed.isActive ? "on" : ""}`} onClick={() => handleToggle(breed)} title="Toggle active in app" />
                                                    <button className="btn btn-outline btn-sm" onClick={() => { setFormBreed(breed); setShowForm(true); }}>
                                                        <Pencil size={13} />
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(breed.id)}>
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
            {showForm && <BreedForm breed={formBreed} categories={categories} onSave={handleSave} onClose={() => setShowForm(false)} existingBreeds={breeds} />}
        </div>
    );
}