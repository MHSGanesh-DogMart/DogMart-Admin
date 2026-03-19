import React, { useEffect, useState } from 'react';
import TopBar from '../components/Layout/TopBar';
import api from '../utils/api';
import { Plus, Pencil, Trash2, X, Scissors, Loader2 } from 'lucide-react';

function ServiceForm({ service, onSave, onClose }) {
    const [form, setForm] = useState(service || {
        name: '',
        emoji: '✂️',
        description: '',
        commissionPercent: 0,
        order: 0,
        isActive: true
    });
    const [saving, setSaving] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSave = async () => {
        setSaving(true);
        try {
            if (service?.id) {
                await api.put(`/service-categories/${service.id}`, form);
                onSave({ ...form, id: service.id });
            } else {
                const res = await api.post('/service-categories', form);
                onSave(res.data);
            }
            onClose();
        } catch (e) {
            console.error(e);
            alert('Failed to save service category');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h2 className="modal-title">{service ? 'Edit Service Category' : 'Add Service Category'}</h2>
                    <button className="modal-close" onClick={onClose}><X size={18} /></button>
                </div>

                <div className="form-group">
                    <label className="form-label">Service Name</label>
                    <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Grooming & Bathing" />
                </div>

                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Short description for the app" rows={2} />
                </div>

                <div className="grid-2">
                    <div className="form-group">
                        <label className="form-label">Emoji Icon</label>
                        <input className="form-input" value={form.emoji} onChange={e => set('emoji', e.target.value)} placeholder="e.g. ✂️" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Commission %</label>
                        <input className="form-input" type="number" value={form.commissionPercent} onChange={e => set('commissionPercent', e.target.value)} />
                    </div>
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
                        {saving ? 'Saving...' : 'Save Category'}
                    </button>
                    <button className="btn btn-outline" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default function ServiceCategories() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await api.get('/service-categories');
            setServices(res.data.categories || []);
        } catch (e) {
            console.error('Failed to fetch services:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    return (
        <div>
            <TopBar title="Service Categories" />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Manage Service Types</h2>
                        <p className="page-subtitle">Define service categories and platform commission rates.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => { setSelectedService(null); setShowForm(true); }}>
                        <Plus size={15} /> Add Service
                    </button>
                </div>

                {loading ? <div className="loading-center"><div className="spinner" /></div> :
                    services.length === 0 ? (
                        <div className="empty-state">
                            <Scissors size={40} />
                            <h3>No service categories</h3>
                            <p className="text-sm">Start by adding a service like "Dog Walking".</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Icon</th>
                                        <th>Commission</th>
                                        <th>Order</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.map(s => (
                                        <tr key={s.id}>
                                            <td style={{ fontWeight: 600 }}>{s.name}</td>
                                            <td style={{ fontSize: 20 }}>{s.emoji}</td>
                                            <td>{s.commissionPercent}%</td>
                                            <td>{s.order}</td>
                                            <td>
                                                <span className={`badge ${s.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                    {s.isActive ? 'Active' : 'Hidden'}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn btn-outline btn-sm" onClick={() => { setSelectedService(s); setShowForm(true); }}>
                                                    <Pencil size={13} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                }
            </div>

            {showForm && <ServiceForm service={selectedService} onSave={fetchServices} onClose={() => setShowForm(false)} />}
        </div>
    );
}
