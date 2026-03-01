import React, { useEffect, useState } from 'react';
import TopBar from '../components/Layout/TopBar';
import { db } from '../firebase/config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { Plus, Pencil, Trash2, X, MapPin } from 'lucide-react';

function LocationForm({ loc, onSave, onClose }) {
    const [form, setForm] = useState(loc || { city: '', area: '', pincode: '', isActive: true });
    const [saving, setSaving] = useState(false);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSave = async () => {
        if (!form.city.trim() || !form.area.trim()) return;
        setSaving(true);
        try {
            const data = {
                city: form.city.trim(),
                area: form.area.trim(),
                pincode: form.pincode.trim() || null,
                isActive: form.isActive
            };

            if (loc?.id) {
                await updateDoc(doc(db, 'locations', loc.id), { ...data, updatedAt: serverTimestamp() });
                onSave({ ...data, id: loc.id });
            } else {
                const ref = await addDoc(collection(db, 'locations'), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
                onSave({ ...data, id: ref.id });
            }
            onClose();
        } catch (e) {
            console.error(e);
            alert('Failed to save location.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h2 className="modal-title">{loc ? 'Edit Location' : 'Add New Location'}</h2>
                    <button className="modal-close" onClick={onClose}><X size={18} /></button>
                </div>

                <div className="form-group">
                    <label className="form-label">City *</label>
                    <input className="form-input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Hyderabad" />
                </div>

                <div className="form-group">
                    <label className="form-label">Area / Locality *</label>
                    <input className="form-input" value={form.area} onChange={e => set('area', e.target.value)} placeholder="e.g. Banjara Hills, Gachibowli" />
                </div>

                <div className="form-group">
                    <label className="form-label">Pincode (Optional)</label>
                    <input className="form-input" value={form.pincode} onChange={e => set('pincode', e.target.value)} placeholder="e.g. 500034" />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20, marginBottom: 24 }}>
                    <button className={`toggle ${form.isActive ? 'on' : ''}`} onClick={() => set('isActive', !form.isActive)} />
                    <span className="text-sm">{form.isActive ? 'Active - Selectable by sellers' : 'Inactive - Hidden from app'}</span>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.city.trim() || !form.area.trim()} style={{ flex: 1, justifyContent: 'center' }}>
                        {saving ? 'Saving...' : 'Save Location'}
                    </button>
                    <button className="btn btn-outline" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default function Locations() {
    const [locs, setLocs] = useState([]);
    const [formLoc, setFormLoc] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [filterCity, setFilterCity] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDocs(query(collection(db, 'locations'), orderBy('city', 'asc'), orderBy('area', 'asc')))
            .then(snap => setLocs(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = (loc) => {
        setLocs(prev => {
            const arr = prev.find(l => l.id === loc.id) ? prev.map(l => l.id === loc.id ? loc : l) : [loc, ...prev];
            return arr.sort((a, b) => {
                const cityCmp = a.city.localeCompare(b.city);
                if (cityCmp !== 0) return cityCmp;
                return a.area.localeCompare(b.area);
            });
        });
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this location?')) return;
        await deleteDoc(doc(db, 'locations', id));
        setLocs(prev => prev.filter(l => l.id !== id));
    };

    const handleToggle = async (loc) => {
        await updateDoc(doc(db, 'locations', loc.id), { isActive: !loc.isActive, updatedAt: serverTimestamp() });
        setLocs(prev => prev.map(l => l.id === loc.id ? { ...l, isActive: !l.isActive } : l));
    };

    const filtered = filterCity === 'all' ? locs : locs.filter(l => l.city === filterCity);
    const uniqueCities = [...new Set(locs.map(l => l.city))].filter(Boolean);

    return (
        <div>
            <TopBar title="Locations" />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Supported Locations</h2>
                        <p className="page-subtitle">Manage the list of Cities and Areas supported by DogMart.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => { setFormLoc(null); setShowForm(true); }}>
                        <Plus size={15} /> Add Location
                    </button>
                </div>

                <div className="tabs" style={{ marginBottom: 20 }}>
                    <button className={`tab ${filterCity === 'all' ? 'active' : ''}`} onClick={() => setFilterCity('all')}>All Cities</button>
                    {uniqueCities.map(c => (
                        <button key={c} className={`tab ${filterCity === c ? 'active' : ''}`} onClick={() => setFilterCity(c)}>{c}</button>
                    ))}
                </div>

                {loading ? <div className="loading-center"><div className="spinner" /></div> :
                    filtered.length === 0 ? (
                        <div className="empty-state">
                            <MapPin size={40} />
                            <h3>No locations yet</h3>
                            <p className="text-sm">Start by adding a city and area where DogMart operates.</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>City</th>
                                        <th>Area / Locality</th>
                                        <th>Pincode</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(loc => (
                                        <tr key={loc.id}>
                                            <td style={{ fontWeight: 600 }}>{loc.city}</td>
                                            <td>{loc.area}</td>
                                            <td>{loc.pincode || ' '}</td>
                                            <td>
                                                <span className="badge">{loc.isActive ? 'Active' : 'Inactive'}</span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                    <button className={`toggle ${loc.isActive ? 'on' : ''}`} onClick={() => handleToggle(loc)} title="Toggle visibility" />
                                                    <button className="btn btn-outline btn-sm" onClick={() => { setFormLoc(loc); setShowForm(true); }}>
                                                        <Pencil size={13} />
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(loc.id)}>
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
            {showForm && <LocationForm loc={formLoc} onSave={handleSave} onClose={() => setShowForm(false)} />}
        </div>
    );
}
