import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Scissors, MapPin, Search, CalendarCheck, HelpCircle, Heart, Star, Phone, MessageSquare, Mail, Award, Clock, Users, CheckCircle } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';

export default function LandingPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('privacy');

    // Contact Form State
    const [contact, setContact] = useState({ name: '', email: '', phone: '', comment: '' });
    const [submitStatus, setSubmitStatus] = useState({ loading: false, success: false, error: '' });

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus({ loading: true, success: false, error: '' });
        try {
            await addDoc(collection(db, 'contact_messages'), {
                ...contact,
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
        <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#1E293B', background: '#FFFCF9', overflowX: 'hidden' }}>

            {/* Header */}
            <header style={{
                position: 'fixed', top: 0, width: '100%', padding: '20px 5%',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)',
                zIndex: 1000, boxShadow: '0 4px 30px rgba(0,0,0,0.03)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'linear-gradient(135deg, #FF7B54, #FFB26B)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Heart size={20} color="white" fill="white" />
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: '"Outfit", sans-serif', color: '#FF7B54' }}>DogMart</span>
                </div>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <a href="#features" style={{ textDecoration: 'none', color: '#475569', fontWeight: 600 }}>Features</a>
                    <a href="#contact" style={{ textDecoration: 'none', color: '#475569', fontWeight: 600 }}>Support</a>
                    <button style={{ background: 'none', border: 'none', color: '#475569', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }} onClick={() => navigate('/privacy')}>Privacy</button>
                    <button style={{ background: 'none', border: 'none', color: '#475569', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }} onClick={() => navigate('/terms')}>Terms</button>
                </div>
            </header>

            {/* Hero Section */}
            <section style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '120px 5% 60px',
                background: 'radial-gradient(circle at top right, #FFF1EB 0%, #FFFCF9 100%)',
                position: 'relative'
            }}>
                <div style={{ flex: 1, maxWidth: 650 }}>
                    <h1 style={{ fontSize: '4.5rem', fontWeight: 800, fontFamily: '"Outfit", sans-serif', lineHeight: 1.1, marginBottom: '24px' }}>
                        Trusted Locals for Your <span style={{ color: '#FF7B54' }}>Best Friend.</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#64748B', marginBottom: '40px', lineHeight: 1.6 }}>
                        Discover and book verified pet groomers, walkers, and loving boarders in your neighborhood. The ultimate ecosystem for pet parents.
                    </p>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button style={{
                            padding: '16px 32px', background: 'linear-gradient(135deg, #FF7B54, #E0603B)',
                            color: 'white', border: 'none', borderRadius: '50px', fontSize: '1.1rem',
                            fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                            boxShadow: '0 10px 25px rgba(255, 123, 84, 0.3)'
                        }}>
                            Download App
                        </button>
                        <button style={{
                            padding: '16px 32px', background: 'white', color: '#1E293B',
                            border: '2px solid #E2E8F0', borderRadius: '50px', fontSize: '1.1rem',
                            fontWeight: 700, cursor: 'pointer'
                        }}>
                            Watch Video
                        </button>
                    </div>
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <div style={{ fontSize: '200px', filter: 'drop-shadow(0 30px 40px rgba(255,123,84,0.15))', animation: 'float 6s ease-in-out infinite' }}>
                        🐕
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" style={{ padding: '100px 5%', background: 'white' }}>
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <h2 style={{ fontSize: '3rem', fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#1E293B', marginBottom: '16px' }}>
                        Everything Your Pet Needs
                    </h2>
                    <p style={{ fontSize: '1.25rem', color: '#64748B' }}>All in one beautifully crafted mobile experience.</p>
                </div>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', maxWidth: 1200, margin: '0 auto'
                }}>
                    {[
                        { icon: Scissors, color: '#EC4899', title: 'Expert Grooming', desc: 'From basic baths to breed-specific styling, book professional grooming sessions right at your doorstep. We ensure a relaxing spa day for your furry friend.' },
                        { icon: MapPin, color: '#3B82F6', title: 'Verified Walkers', desc: 'Ensure your dog gets their daily exercise with our network of vetted, trackable dog walkers. Perfect for busy pet parents needing reliable daily care.' },
                        { icon: CalendarCheck, color: '#10B981', title: 'Loving Boarding', desc: 'Going out of town? Find cozy, cage-free homes in your neighborhood for stress-free boarding stays where your dog is treated like family.' },
                        { icon: Search, color: '#F59E0B', title: 'Pet Marketplace', desc: 'Looking for a new family member? Browse adorable breeds safely from verified breeders and rescues committed to ethical practices.' }
                    ].map((feat, idx) => (
                        <div key={idx} style={{
                            padding: '40px 30px', background: '#FFFCF9', borderRadius: '24px',
                            border: '1px solid #F1F5F9', transition: 'transform 0.3s, box-shadow 0.3s',
                            cursor: 'default'
                        }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-10px)';
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.05)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}>
                            <div style={{
                                width: 60, height: 60, borderRadius: 16, background: `${feat.color}15`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px'
                            }}>
                                <feat.icon size={28} color={feat.color} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>{feat.title}</h3>
                            <p style={{ color: '#64748B', lineHeight: 1.6 }}>{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* App Preview Section */}
            <section id="app" style={{
                padding: '100px 5%', background: '#F8FAFC', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', gap: '60px', flexWrap: 'wrap-reverse', margin: '0 auto'
            }}>
                <div style={{ flex: 1, minWidth: 320, maxWidth: 600 }}>
                    <h2 style={{ fontSize: '3.5rem', fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#1E293B', marginBottom: '24px', lineHeight: 1.1 }}>
                        Premium. Fast.<br />Secure.
                    </h2>
                    <p style={{ fontSize: '1.25rem', color: '#64748B', marginBottom: '32px', lineHeight: 1.6 }}>
                        DogMart is built natively to provide a buttery-smooth experience. Manage your "My Dogs" wallet, chat with service providers in real-time, and track your bookings with absolute confidence.
                    </p>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', padding: 0 }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', fontWeight: 600, color: '#1E293B' }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>✓</div> Real-time Socket.IO Chat
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', fontWeight: 600, color: '#1E293B' }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>✓</div> Aadhaar Verified Providers
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', fontWeight: 600, color: '#1E293B' }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>✓</div> Secure Razorpay Payments
                        </li>
                    </ul>
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '30px', minWidth: 320, padding: '40px 0' }}>
                    <div style={{
                        width: 250, height: 500, background: 'linear-gradient(135deg, #FF7B54, #FFB26B)',
                        borderRadius: 40, border: '10px solid #222', boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white',
                        fontSize: '2rem', fontFamily: '"Outfit", sans-serif', fontWeight: 800,
                        transform: 'translateY(30px) rotate(-5deg)', transition: 'transform 0.3s'
                    }}>
                        Feed
                    </div>
                    <div style={{
                        width: 250, height: 500, background: 'linear-gradient(135deg, #4A90E2, #50E3C2)',
                        borderRadius: 40, border: '10px solid #222', boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white',
                        fontSize: '2rem', fontFamily: '"Outfit", sans-serif', fontWeight: 800,
                        transform: 'translateY(-30px) rotate(5deg)', transition: 'transform 0.3s'
                    }}>
                        Booking
                    </div>
                </div>
            </section>

            {/* Why DogMart Section */}
            <section style={{ padding: '100px 5%', background: '#FFF1EB' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '3rem', fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#1E293B', marginBottom: '16px' }}>
                            Why Pet Parents Love DogMart
                        </h2>
                        <p style={{ fontSize: '1.25rem', color: '#64748B', maxWidth: 700, margin: '0 auto' }}>
                            We go beyond just being a booking app. DogMart is a comprehensive ecosystem designed around the specific needs of dogs and the people who love them.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                        <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                            <Shield size={40} color="#10B981" style={{ marginBottom: '20px' }} />
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>Rigorous Safety Standards</h3>
                            <p style={{ color: '#64748B', lineHeight: 1.7 }}>
                                Every service provider on DogMart goes through a strict verification process, including government ID checks (Aadhaar). We ensure that only passionate, qualified individuals handle your precious pets.
                            </p>
                        </div>
                        <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                            <Award size={40} color="#F59E0B" style={{ marginBottom: '20px' }} />
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>Premium Pet Profiles</h3>
                            <p style={{ color: '#64748B', lineHeight: 1.7 }}>
                                Build a detailed "My Dogs" profile tracking your pet's breed, temperament, dietary needs, and medical history. Providers receive this dossier instantly when you book, ensuring personalized care from minute one.
                            </p>
                        </div>
                        <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                            <MessageSquare size={40} color="#3B82F6" style={{ marginBottom: '20px' }} />
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>Real-time Reassurance</h3>
                            <p style={{ color: '#64748B', lineHeight: 1.7 }}>
                                Stay connected with our lightning-fast, Socket.io powered in-app chat. Receive photo updates during boarding stays, check in on walks, and coordinate with groomers without ever leaving the app.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section style={{ padding: '100px 5%', background: 'white' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '3rem', fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#1E293B', marginBottom: '16px' }}>
                            How DogMart Works
                        </h2>
                        <p style={{ fontSize: '1.25rem', color: '#64748B' }}>Four simple steps to superior pet care.</p>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                            {[
                                { step: '01', title: 'Create Your Pet\'s Profile', desc: 'Add your dogs, their dietary preferences, and any special behavioral notes so providers know exactly how to care for them.' },
                                { step: '02', title: 'Discover Local Pros', desc: 'Browse available groomers, walkers, and boarders in your immediate area. Filter by ratings, services, and availability.' },
                                { step: '03', title: 'Book & Pay Securely', desc: 'Select your preferred time slot and confirm the booking instantly with our secure Razorpay integration. No cash handling needed.' },
                                { step: '04', title: 'Relax & Review', desc: 'Enjoy peace of mind while your pet is cared for. Afterward, leave a review to help build the DogMart community trust.' }
                            ].map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                                    <div style={{
                                        minWidth: '60px', height: '60px', borderRadius: '50%', background: '#FF7B54',
                                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.5rem', fontWeight: 800, fontFamily: '"Outfit", sans-serif'
                                    }}>
                                        {item.step}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '12px', color: '#1E293B' }}>{item.title}</h3>
                                        <p style={{ fontSize: '1.1rem', color: '#64748B', lineHeight: 1.6 }}>{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Support Form Section */}
            <section id="contact" style={{ padding: '100px 5%', background: 'white' }}>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                        <h2 style={{ fontSize: '3rem', fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#1E293B', marginBottom: '16px' }}>
                            We're Here to Help
                        </h2>
                        <p style={{ fontSize: '1.1rem', color: '#64748B' }}>
                            Got a question or need support with your booking? Reach out to our dedicated team.
                        </p>
                    </div>

                    <div style={{ background: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}>
                        {submitStatus.success && (
                            <div style={{ background: '#D1FAE5', color: '#065F46', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <HelpCircle size={20} /> Message sent successfully! We'll get back to you soon.
                            </div>
                        )}
                        {submitStatus.error && (
                            <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                                {submitStatus.error}
                            </div>
                        )}

                        <form onSubmit={handleContactSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Your Name*</label>
                                    <input
                                        type="text" required value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })}
                                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: '#F8FAFC' }}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Phone Number</label>
                                    <input
                                        type="tel" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })}
                                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: '#F8FAFC' }}
                                        placeholder="+91 90000 00000"
                                    />
                                </div>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Email Address*</label>
                                <input
                                    type="email" required value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })}
                                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: '#F8FAFC' }}
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>How can we help?*</label>
                                <textarea
                                    required rows={4} value={contact.comment} onChange={e => setContact({ ...contact, comment: e.target.value })}
                                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: '#F8FAFC', resize: 'vertical' }}
                                    placeholder="Write your message here..."
                                />
                            </div>
                            <button
                                type="submit" disabled={submitStatus.loading}
                                style={{
                                    width: '100%', padding: '16px', background: '#FF7B54', color: 'white',
                                    border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700,
                                    cursor: submitStatus.loading ? 'not-allowed' : 'pointer', transition: 'background 0.3s',
                                    opacity: submitStatus.loading ? 0.7 : 1
                                }}
                            >
                                {submitStatus.loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: '#1E293B', color: 'white', padding: '60px 5% 40px', textAlign: 'center' }}>
                <h2 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '2.5rem', marginBottom: '20px', color: '#FF7B54' }}>DogMart</h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px', color: '#94A3B8' }}>
                    <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
                    <span>•</span>
                    <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</a>
                    <span>•</span>
                    <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Support</a>
                </div>
                <p style={{ color: '#64748B' }}>© 2026 DogMart App. All rights reserved.</p>
            </footer>

            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                html { scroll-behavior: smooth; }
            `}</style>
        </div>
    );
}
