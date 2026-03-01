import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard, Users, CalendarDays, Tag, MapPin,
    Star, CreditCard, AlertTriangle, Settings, LogOut, Heart, Layers, Grid, Briefcase, Scissors, Mail
} from 'lucide-react';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/sellers', icon: Star, label: 'Sellers Verification' },
    { to: '/service-providers', icon: Briefcase, label: 'Service Providers' },
    { to: '/service-bookings', icon: Scissors, label: 'Service Bookings' },
    { to: '/listings', icon: Tag, label: 'Listings' },
    { to: '/categories', icon: Grid, label: 'Categories Master' },
    { to: '/breeds', icon: Layers, label: 'Breeds Master' },
    { to: '/subscriptions', icon: CalendarDays, label: 'Subscriptions' },
    { to: '/reviews', icon: Star, label: 'Reviews & Reports' },
    { to: '/payments', icon: CreditCard, label: 'Payments' },
    { to: '/locations', icon: MapPin, label: 'Locations' },
    { to: '/support', icon: Mail, label: 'Support Inbox' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => { await logout(); navigate('/login'); };

    return (
        <aside style={{
            width: 'var(--sidebar-w)', position: 'fixed', left: 0, top: 0, bottom: 0,
            background: 'var(--bg2)', borderRight: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', zIndex: 200, overflow: 'hidden'
        }}>
            {/* Logo */}
            <div style={{ padding: '28px 24px 24px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px var(--primary-glow)'
                    }}>
                        <Heart size={18} color="white" fill="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>DogMart</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: '0.05em' }}>ADMIN PANEL</div>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to} to={to} end={to === '/'}
                        style={({ isActive }) => ({
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '11px 14px', borderRadius: 10, marginBottom: 4,
                            textDecoration: 'none', fontSize: 14, fontWeight: 500,
                            color: isActive ? 'white' : 'var(--text2)',
                            background: isActive
                                ? 'linear-gradient(135deg, var(--primary), var(--primary-light))'
                                : 'transparent',
                            boxShadow: isActive ? '0 4px 12px var(--primary-glow)' : 'none',
                            transition: 'all 0.15s',
                        })}
                    >
                        {({ isActive }) => (
                            <>
                                <Icon size={17} color={isActive ? 'white' : undefined} />
                                {label}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
                <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                    <LogOut size={15} /> Logout
                </button>
            </div>
        </aside>
    );
}
