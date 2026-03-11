import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { tokens } from '../../styles/DesignTokens';
import {
    LayoutDashboard, Users, CalendarDays, Tag, MapPin, Image,
    Star, CreditCard, AlertTriangle, Settings, LogOut, Heart, Layers, Grid, Briefcase, Scissors, Mail, ChevronRight, ShoppingBag, Bell
} from 'lucide-react';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/listings', icon: Tag, label: 'Pets Moderation' },
    { to: '/products', icon: ShoppingBag, label: 'Products Management' },
    { to: '/services', icon: Scissors, label: 'Services Moderation' },
    { to: '/service-bookings', icon: Scissors, label: 'Service Bookings' },
    { to: '/banners', icon: Image, label: 'Promo Banners' },
    { to: '/categories', icon: Grid, label: 'Pet Categories' },
    { to: '/product-categories', icon: ShoppingBag, label: 'Product Categories' },
    { to: '/service-categories', icon: Scissors, label: 'Service Types' },
    { to: '/breeds', icon: Layers, label: 'Breeds Master' },
    { to: '/subscriptions', icon: CalendarDays, label: 'Subscriptions' },
    { to: '/reviews', icon: Star, label: 'Reviews & Reports' },
    { to: '/payments', icon: CreditCard, label: 'Payments' },
    { to: '/locations', icon: MapPin, label: 'Locations' },
    { to: '/support', icon: Mail, label: 'Support Inbox' },
    { to: '/notifications', icon: Bell, label: 'Push Notifications' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => { await logout(); navigate('/login'); };

    return (
        <aside style={{
            width: 'var(--sidebar-w)', position: 'fixed', left: 0, top: 0, bottom: 0,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', zIndex: 200, overflow: 'hidden'
        }}>
            {/* Logo Section */}
            <div style={{ padding: '32px 24px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <motion.div
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        style={{
                            width: 42, height: 42, borderRadius: 14,
                            background: tokens.colors.primary.gradient,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 8px 16px ${tokens.colors.primary.glow}`
                        }}
                    >
                        <Heart size={22} color="white" fill="white" />
                    </motion.div>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 18, color: tokens.colors.primary.main, fontFamily: '"Outfit", sans-serif', letterSpacing: '-0.02em' }}>DogMart</div>
                        <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 800, letterSpacing: '0.15em' }}>ADMIN PORTAL</div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '24px 16px', overflowY: 'auto' }}>
                <div style={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 800, color: 'var(--text3)', paddingLeft: 12, marginBottom: 12, letterSpacing: '0.1em' }}>Management</div>
                {navItems.map(({ to, icon: Icon, label }) => {
                    const isActive = location.pathname === to;
                    return (
                        <NavLink
                            key={to} to={to}
                            style={{ textDecoration: 'none' }}
                        >
                            <motion.div
                                whileHover={{ x: 4, background: isActive ? undefined : 'rgba(255, 123, 84, 0.05)' }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '12px 16px', borderRadius: 14, marginBottom: 6,
                                    fontSize: 14, fontWeight: isActive ? 700 : 600,
                                    color: isActive ? 'white' : 'var(--text2)',
                                    background: isActive ? tokens.colors.primary.gradient : 'transparent',
                                    boxShadow: isActive ? tokens.shadows.lg : 'none',
                                    transition: 'color 0.2s',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <Icon size={18} />
                                <span style={{ flex: 1 }}>{label}</span>
                                {isActive && <ChevronRight size={14} />}
                            </motion.div>
                        </NavLink>
                    );
                })}
            </nav>

            {/* User Profile / Logout */}
            <div style={{ padding: '24px 16px', borderTop: '1px solid var(--border)', background: 'rgba(248, 250, 252, 0.5)' }}>
                <button
                    onClick={handleLogout}
                    className="btn btn-outline"
                    style={{
                        width: '100%', justifyContent: 'center', gap: 10,
                        border: '1px solid var(--border)', background: 'white',
                        borderRadius: 12, padding: '12px', color: 'var(--danger)',
                        fontWeight: 700
                    }}
                >
                    <LogOut size={16} /> Sign Out
                </button>
            </div>
        </aside>
    );
}
