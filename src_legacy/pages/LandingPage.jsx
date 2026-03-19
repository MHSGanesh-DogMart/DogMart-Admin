import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, Mail, MessageSquare, CheckCircle, ArrowRight, Play,
    Scissors, MapPin, Shield, Award
} from 'lucide-react';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { tokens } from '../styles/DesignTokens';
import phoneMockup from '../assets/phone-mockup.png';

const GlassCard = ({ children, style = {}, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ y: -5, boxShadow: tokens.shadows.lg }}
        style={{
            background: tokens.colors.glass.bg,
            backdropFilter: 'blur(12px)',
            borderRadius: '24px',
            border: `1px solid ${tokens.colors.glass.border}`,
            boxShadow: tokens.shadows.glass,
            padding: '32px',
            cursor: 'pointer',
            ...style
        }}
    >
        {children}
    </motion.div>
);

const spring = { type: 'spring', stiffness: 260, damping: 20 };

const FloatingPaws = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, opacity: 0.4 }}>
        {[...Array(6)].map((_, i) => (
            <motion.div
                key={i}
                animate={{
                    y: [0, -20, 0],
                    x: [0, 10, 0],
                    rotate: [0, 10, 0],
                    opacity: [0.1, 0.2, 0.1]
                }}
                transition={{
                    duration: 4 + i,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.5
                }}
                style={{
                    position: 'absolute',
                    fontSize: '24px',
                    top: `${15 + i * 15}%`,
                    left: `${10 + i * 15}%`,
                    filter: 'grayscale(1) opacity(0.3)'
                }}
            >
                🐾
            </motion.div>
        ))}
    </div>
);

export default function LandingPage() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [contact, setContact] = useState({ name: '', email: '', phone: '', comment: '' });
    const [submitStatus, setSubmitStatus] = useState({ loading: false, success: false, error: '' });

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus({ loading: true, success: false, error: '' });
        try {
            await addDoc(collection(db, 'contact_messages'), {
                ...contact,
                source: 'admin-landing',
                status: 'unread',
                createdAt: new Date()
            });
            setSubmitStatus({ loading: false, success: true, error: '' });
            setContact({ name: '', email: '', phone: '', comment: '' });
            setTimeout(() => setSubmitStatus(prev => ({ ...prev, success: false })), 5000);
        } catch (error) {
            console.error(error);
            setSubmitStatus({ loading: false, success: false, error: 'Failed to send message. Please try again later.' });
        }
    };

    return (
        <div style={{
            fontFamily: '"Outfit", sans-serif',
            color: tokens.colors.neutral.text,
            background: tokens.colors.neutral.bg,
            overflowX: 'hidden'
        }}>

            <FloatingPaws />

            {/* Navbar */}
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                style={{
                    position: 'fixed', top: scrolled ? '20px' : '0', left: '50%',
                    width: scrolled ? '90%' : '100%',
                    transform: 'translateX(-50%)',
                    padding: scrolled ? '12px 32px' : '20px 5%',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: scrolled ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
                    backdropFilter: scrolled ? 'blur(20px)' : 'none',
                    zIndex: 1000,
                    borderRadius: scrolled ? '100px' : '0',
                    boxShadow: scrolled ? tokens.shadows.md : 'none',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => window.scrollTo(0, 0)}>
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: tokens.colors.primary.gradient,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <Heart size={18} color="white" fill="white" />
                    </motion.div>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: tokens.colors.neutral.text }}>PetSaathi</span>
                </div>

                <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <a href="#features" style={{ textDecoration: 'none', color: tokens.colors.neutral.text, fontWeight: 600, fontSize: '0.9rem' }}>Features</a>
                    <a href="#contact" style={{ textDecoration: 'none', color: tokens.colors.neutral.text, fontWeight: 600, fontSize: '0.9rem' }}>Support</a>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: tokens.colors.primary.gradient,
                            color: 'white',
                            border: 'none',
                            padding: '10px 24px',
                            borderRadius: '100px',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            boxShadow: tokens.shadows.md
                        }}
                    >
                        🐾 Admin Portal
                    </button>
                </nav>
            </motion.header>

            {/* Hero Section */}
            <section style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '120px 5% 60px',
                position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ display: 'flex', flexDirection: window.innerWidth < 768 ? 'column' : 'row', alignItems: 'center', gap: '60px', width: '100%', maxWidth: 1400, margin: '0 auto' }}>
                    
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ...spring }}
                        style={{ flex: 1.2, textAlign: window.innerWidth < 768 ? 'center' : 'left' }}
                    >
                        <span style={{
                            background: `${tokens.colors.primary.main}15`,
                            color: tokens.colors.primary.main,
                            padding: '8px 16px',
                            borderRadius: '100px',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            marginBottom: '24px',
                            display: 'inline-block'
                        }}>
                             🐾 India Ka Sabse Pyaara Pet App
                        </span>
                        <h1 style={{
                            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                            fontWeight: 800,
                            lineHeight: 1.05,
                            marginBottom: '24px',
                            letterSpacing: '-0.02em',
                            color: tokens.colors.neutral.text
                        }}>
                            Premium Care for your <br />
                            <span style={{
                                background: tokens.colors.primary.gradient,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>Loyal Companion</span>.
                        </h1>
                        <p style={{ fontSize: '1.2rem', color: tokens.colors.neutral.muted, marginBottom: '40px', lineHeight: 1.6, maxWidth: 550, margin: window.innerWidth < 768 ? '0 auto 40px' : '0 0 40px' }}>
                            Buy, Adopt, Groom, Walk, Board — Everything for your pet. One App. Manage the ultimate ecosystem with our state-of-the-art administrative terminal.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', justifyContent: window.innerWidth < 768 ? 'center' : 'flex-start', flexWrap: 'wrap' }}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    padding: '18px 36px', background: tokens.colors.neutral.text,
                                    color: 'white', border: 'none', borderRadius: '100px', fontSize: '1.05rem',
                                    fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                                    boxShadow: tokens.shadows.lg
                                }}
                            >
                                📱 Download App <ArrowRight size={20} />
                            </motion.button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2, ...spring }}
                        style={{ flex: 0.8, display: 'flex', justifyContent: 'center', position: 'relative' }}
                    >
                        <motion.img
                            src={phoneMockup}
                            alt="PetSaathi App"
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            style={{ width: '100%', maxWidth: 380, dropShadow: '0 40px 100px rgba(255,123,84,0.3)' }}
                        />
                    </motion.div>

                </div>
            </section>

            {/* Stats Grid */}
            <section style={{ padding: '0 5% 100px' }}>
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px'
                }}>
                    {[
                        { label: 'Active Users', value: '12k+' },
                        { label: 'Verified Pros', value: '450+' },
                        { label: 'Daily Bookings', value: '2.8k' },
                        { label: 'User Satisfaction', value: '99.9%' }
                    ].map((stat, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: tokens.colors.neutral.text }}>{stat.value}</div>
                            <div style={{ color: tokens.colors.neutral.muted, fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section id="features" style={{ padding: '100px 5%' }}>
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '16px' }}
                    >
                        Experience the <span style={{ color: tokens.colors.primary.main }}>Difference</span>
                    </motion.h2>
                    <p style={{ fontSize: '1.2rem', color: tokens.colors.neutral.muted }}>Modular. Scaleable. Beautiful by design.</p>
                </div>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', maxWidth: 1400, margin: '0 auto'
                }}>
                    {[
                        { icon: Scissors, color: '#EC4899', title: 'Smart Scheduling', desc: 'Predictive algorithm for grooming sessions that optimizes provider routes and reduces wait times.' },
                        { icon: MapPin, color: '#3B82F6', title: 'Live Tracking', desc: 'Precision GPS monitoring for walkers with instant arrival notifications and digital handoff.' },
                        { icon: Shield, color: '#10B981', title: 'Trust-Link™ Tech', desc: 'Biometric and Aadhaar-backed verification protocol ensuring zero-compromise safety standards.' },
                        { icon: Award, color: '#F59E0B', title: 'Dynamic Rating', desc: 'Weighted reputation system that elevates top-tier performers and ensures consistent quality.' }
                    ].map((feat, idx) => (
                        <GlassCard key={idx} delay={idx * 0.1}>
                            <div style={{
                                width: 56, height: 56, borderRadius: '16px', background: `${feat.color}15`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px'
                            }}>
                                <feat.icon size={24} color={feat.color} />
                            </div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '12px' }}>{feat.title}</h3>
                            <p style={{ color: tokens.colors.neutral.muted, lineHeight: 1.6 }}>{feat.desc}</p>
                        </GlassCard>
                    ))}
                </div>
            </section>

            {/* Dashboard Preview */}
            <section style={{ padding: '100px 5%', background: '#0F172A', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '80px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 400 }}>
                        <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '24px', lineHeight: 1.1 }}>
                            Full-Stack Control at your <span style={{ color: tokens.colors.primary.light }}>Fingertips</span>
                        </h2>
                        <p style={{ fontSize: '1.2rem', opacity: 0.7, marginBottom: '40px', lineHeight: 1.6 }}>
                            The PetSaathi Admin Dashboard provides real-time insights into your pet care network. Monitor revenue, manage disputes, and oversee global operations from a single unified interface.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {[
                                'Real-time Analytics Engine',
                                'Automated Payout Processing',
                                'Global Listing Management',
                                'Direct Support Integration'
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: tokens.colors.primary.main, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CheckCircle size={14} color="white" />
                                    </div>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            style={{
                                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                borderRadius: '24px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '12px',
                                boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
                            }}
                        >
                            <img
                                src="https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=2000"
                                alt="Dashboard Preview"
                                style={{ width: '100%', borderRadius: '16px', display: 'block' }}
                            />
                        </motion.div>
                        {/* Floating Micro-cards */}
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            style={{
                                position: 'absolute', top: '-40px', right: '-20px',
                                background: tokens.colors.accent.gradient,
                                padding: '20px', borderRadius: '20px', boxShadow: tokens.shadows.lg
                            }}
                        >
                            <div style={{ fontWeight: 800 }}>+ ₹45,200</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Today's Volume</div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Support Form Section */}
            <section id="contact" style={{ padding: '120px 5%' }}>
                <div style={{
                    maxWidth: 1000, margin: '0 auto',
                    background: 'white', borderRadius: '48px',
                    padding: '60px', boxShadow: '0 20px 80px rgba(0,0,0,0.03)',
                    display: 'flex', gap: '60px', flexWrap: 'wrap'
                }}>
                    <div style={{ flex: 1, minWidth: 300 }}>
                        <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '24px', color: tokens.colors.neutral.text }}>
                            How can we <br /><span style={{ color: tokens.colors.primary.main }}>Help you</span>?
                        </h2>
                        <p style={{ color: tokens.colors.neutral.muted, marginBottom: '40px', fontSize: '1.1rem' }}>
                            Our engineering and support teams are on standby 24/7 to assist with your technical or operational queries.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: 50, height: 50, borderRadius: '16px', background: `${tokens.colors.primary.main}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Mail size={24} color={tokens.colors.primary.main} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700 }}>Email Protocol</div>
                                    <div style={{ color: tokens.colors.neutral.muted }}>hemanthtech517@gmail.com</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: 50, height: 50, borderRadius: '16px', background: `${tokens.colors.accent.main}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MessageSquare size={24} color={tokens.colors.accent.main} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700 }}>Neural Chat</div>
                                    <div style={{ color: tokens.colors.neutral.muted }}>Available 24/7 on WhatsApp</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: 1.2, minWidth: 300 }}>
                        {submitStatus.success && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#D1FAE5', color: '#065F46', padding: '16px', borderRadius: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                                <CheckCircle size={20} /> Request transmitted successfully.
                            </motion.div>
                        )}
                        <form onSubmit={handleContactSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <input
                                    type="text" required placeholder="Full Name" value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })}
                                    style={{ width: '100%', padding: '16px 24px', borderRadius: '16px', border: `1px solid ${tokens.colors.neutral.border}`, outline: 'none', background: '#F8FAFC', fontSize: '1rem' }}
                                />
                                <input
                                    type="tel" placeholder="Contact Terminal" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })}
                                    style={{ width: '100%', padding: '16px 24px', borderRadius: '16px', border: `1px solid ${tokens.colors.neutral.border}`, outline: 'none', background: '#F8FAFC', fontSize: '1rem' }}
                                />
                            </div>
                            <input
                                type="email" required placeholder="Digital ID (Email)" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })}
                                style={{ width: '100%', padding: '16px 24px', borderRadius: '16px', border: `1px solid ${tokens.colors.neutral.border}`, outline: 'none', background: '#F8FAFC', fontSize: '1rem', marginBottom: '20px' }}
                            />
                            <textarea
                                required rows={4} placeholder="Detailed Request" value={contact.comment} onChange={e => setContact({ ...contact, comment: e.target.value })}
                                style={{ width: '100%', padding: '16px 24px', borderRadius: '16px', border: `1px solid ${tokens.colors.neutral.border}`, outline: 'none', background: '#F8FAFC', resize: 'none', fontSize: '1rem', marginBottom: '30px' }}
                            />
                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: tokens.shadows.lg }}
                                whileTap={{ scale: 0.98 }}
                                type="submit" disabled={submitStatus.loading}
                                style={{
                                    width: '100%', padding: '18px', background: tokens.colors.neutral.text, color: 'white',
                                    border: 'none', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 800,
                                    cursor: 'pointer', transition: 'all 0.3s'
                                }}
                            >
                                {submitStatus.loading ? 'Transmitting...' : 'Send Request'}
                            </motion.button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: '#0F172A', color: 'white', padding: '80px 5% 40px', position: 'relative' }}>
                <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '40px' }}>
                    <div style={{ maxWidth: 300 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: tokens.colors.accent.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Heart size={16} color="white" fill="white" />
                            </div>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>PetSaathi</span>
                        </div>
                        <p style={{ opacity: 0.6, lineHeight: 1.6 }}>The comprehensive administrative terminal for modern pet care networks.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '80px', flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ fontWeight: 800, marginBottom: '20px' }}>Platform</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0.6 }}>
                                <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Admin API</a>
                                <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Network Health</a>
                                <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Security Protocols</a>
                            </div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, marginBottom: '20px' }}>Legal</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0.6 }}>
                                <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Privacy Policy</a>
                                <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Terms of Service</a>
                                <a href="#" style={{ color: 'white', textDecoration: 'none' }}>GDPR Compliance</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ maxWidth: 1400, margin: '60px auto 0', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', opacity: 0.4, fontSize: '0.9rem' }}>
                    © 2026 PetSaathi Systems Inc. Built with Premium Design Intelligence.
                </div>
            </footer>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
                
                html { scroll-behavior: smooth; }
                ::selection { background: ${tokens.colors.primary.main}40; color: ${tokens.colors.neutral.text}; }
                
                scrollbar-width: thin;
                scrollbar-color: ${tokens.colors.neutral.border} transparent;
            `}</style>
        </div>
    );
}
