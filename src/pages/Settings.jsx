import React, { useState } from 'react';
import TopBar from '../components/Layout/TopBar';
import { auth } from '../firebase/config';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Shield, User, Bell, Sliders } from 'lucide-react';

export default function Settings() {
    const [profile, setProfile] = useState({ name: 'Admin', bio: 'DogMart Platform Administrator', phone: '+91 00000 00000' });
    const [appSettings, setAppSettings] = useState({
        maxFreeListings: 3,
        subscriptionPrice: 99,
        listingExpiryDays: 30
    });
    const [notifications, setNotifications] = useState({
        newSellerApp: true,
        reportedListing: true,
        newSubscription: true
    });
    const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
    const [pwdMsg, setPwdMsg] = useState('');
    const [saved, setSaved] = useState(false);

    const handleSaveProfile = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
    const setA = (k, v) => setAppSettings(p => ({ ...p, [k]: v }));
    const setN = (k) => setNotifications(p => ({ ...p, [k]: !p[k] }));

    const handleChangePwd = async () => {
        if (pwd.newPwd !== pwd.confirm) { setPwdMsg('Passwords do not match'); return; }
        if (pwd.newPwd.length < 8) { setPwdMsg('Password must be at least 8 characters'); return; }
        try {
            const user = auth.currentUser;
            const cred = EmailAuthProvider.credential(user.email, pwd.current);
            await reauthenticateWithCredential(user, cred);
            await updatePassword(user, pwd.newPwd);
            setPwdMsg('✅ Password changed successfully!');
            setPwd({ current: '', newPwd: '', confirm: '' });
        } catch (e) { setPwdMsg('❌ ' + e.message); }
    };

    const Section = ({ icon: Icon, title, children }) => (
        <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)' }}><Icon size={17} /></div>
                <h3 style={{ fontWeight: 700 }}>{title}</h3>
            </div>
            {children}
        </div>
    );

    return (
        <div>
            <TopBar title="Settings" />
            <div className="page-content" style={{ maxWidth: 720 }}>
                <div className="page-header"><div><h2 className="page-title">Platform Settings</h2><p className="page-subtitle">Manage admin profile, pricing rules, and access control.</p></div></div>

                <Section icon={User} title="Admin Profile">
                    <div className="form-group"><label className="form-label">Admin Name</label><input className="form-input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} /></div>
                    <div className="form-group"><label className="form-label">Role / Bio</label><textarea className="form-textarea" value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={2} /></div>
                    <div className="form-group"><label className="form-label">Support Phone Number</label><input className="form-input" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} /></div>
                    <button className="btn btn-primary" onClick={handleSaveProfile}>{saved ? '✅ Saved!' : 'Save Profile'}</button>
                </Section>

                <Section icon={Sliders} title="DogMart Rules & Pricing">
                    <div className="grid-3">
                        <div className="form-group">
                            <label className="form-label">Free Listings Limit</label>
                            <input type="number" className="form-input" value={appSettings.maxFreeListings} onChange={e => setA('maxFreeListings', Number(e.target.value))} min={0} />
                            <div className="text-xs text-muted" style={{ marginTop: 4 }}>After this, subscription is required.</div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Monthly Subs Price (₹)</label>
                            <input type="number" className="form-input" value={appSettings.subscriptionPrice} onChange={e => setA('subscriptionPrice', Number(e.target.value))} min={1} />
                            <div className="text-xs text-muted" style={{ marginTop: 4 }}>Cost of premium tier.</div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Listing Expiry (Days)</label>
                            <input type="number" className="form-input" value={appSettings.listingExpiryDays} onChange={e => setA('listingExpiryDays', Number(e.target.value))} min={1} />
                            <div className="text-xs text-muted" style={{ marginTop: 4 }}>Auto-hide old active listings.</div>
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={handleSaveProfile}>Save App Settings</button>
                    <div className="text-xs text-muted" style={{ marginTop: 12 }}>Note: Changes to these settings will apply immediately to all clients.</div>
                </Section>

                <Section icon={Bell} title="Admin Notifications">
                    {[['newSellerApp', 'New seller KYC applications'], ['reportedListing', 'Listings reported by users'], ['newSubscription', 'New premium subscriptions']].map(([key, label]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                            <span style={{ fontSize: 14 }}>{label}</span>
                            <button className={`toggle ${notifications[key] ? 'on' : ''}`} onClick={() => setN(key)} />
                        </div>
                    ))}
                </Section>

                <Section icon={Shield} title="Security — Change Admin Password">
                    {pwdMsg && <div style={{ background: pwdMsg.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: pwdMsg.startsWith('✅') ? 'var(--success)' : 'var(--danger)' }}>{pwdMsg}</div>}
                    <div className="form-group"><label className="form-label">Current Password</label><input type="password" className="form-input" value={pwd.current} onChange={e => setPwd(p => ({ ...p, current: e.target.value }))} /></div>
                    <div className="grid-2">
                        <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-input" value={pwd.newPwd} onChange={e => setPwd(p => ({ ...p, newPwd: e.target.value }))} /></div>
                        <div className="form-group"><label className="form-label">Confirm New Password</label><input type="password" className="form-input" value={pwd.confirm} onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))} /></div>
                    </div>
                    <button className="btn btn-primary" onClick={handleChangePwd}>Change Password</button>

                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--text3)' }}>
                        Logged in as: <span style={{ fontWeight: 600 }}>{auth.currentUser?.email}</span>
                    </div>
                </Section>
            </div>
        </div>
    );
}
