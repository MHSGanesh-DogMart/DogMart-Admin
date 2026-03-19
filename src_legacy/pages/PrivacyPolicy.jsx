import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    return (
        <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#1E293B', background: '#FFFCF9', minHeight: '100vh' }}>
            {/* Simple Header */}
            <header style={{
                position: 'fixed', top: 0, width: '100%', padding: '20px 5%',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)',
                zIndex: 1000, boxShadow: '0 4px 30px rgba(0,0,0,0.03)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'linear-gradient(135deg, #FF7B54, #FFB26B)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Heart size={20} color="white" fill="white" />
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: '"Outfit", sans-serif', color: '#FF7B54' }}>PetSaathi</span>
                </div>
                <button
                    onClick={() => navigate('/')}
                    style={{ border: 'none', background: 'none', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                    <ArrowLeft size={18} /> Back to Home
                </button>
            </header>

            <main style={{ padding: '140px 5% 100px', maxWidth: 800, margin: '0 auto' }}>
                <h1 style={{ fontSize: '3rem', fontFamily: '"Outfit", sans-serif', fontWeight: 800, marginBottom: '16px', color: '#1E293B' }}>Privacy Policy</h1>
                <p style={{ color: '#64748B', marginBottom: '40px' }}><em>Last Updated: March 2026</em></p>

                <div style={{ color: '#475569', lineHeight: 1.8, fontSize: '1.1rem' }}>
                    <p style={{ marginBottom: '24px' }}>
                        Welcome to PetSaathi. We take the privacy and security of both our human users and their canine companions extremely seriously.
                        This Privacy Policy outlines exactly what information we collect, why it is absolutely necessary for the functioning of our platform,
                        and how we protect it.
                    </p>

                    <h3 style={{ fontSize: '1.5rem', color: '#1E293B', marginTop: '40px', marginBottom: '16px' }}>1. Information We Collect & Why We Need It</h3>

                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', marginBottom: '20px', border: '1px solid #E2E8F0' }}>
                        <h4 style={{ fontSize: '1.2rem', color: '#1E293B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: '#E0E7FF', color: '#4338CA', padding: '4px 8px', borderRadius: '6px', fontSize: '0.9rem' }}>Account Data</span> Phone & Basic Details
                        </h4>
                        <p style={{ marginBottom: '12px' }}>We collect your phone number, name, and email address.</p>
                        <p style={{ fontSize: '0.95rem', color: '#64748B', background: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                            <strong>Why:</strong> We use OTP (One Time Password) via phone numbers as our primary authentication method to prevent spam accounts and ensure a high-trust community. Your contact info is needed so service providers can reach you during an active booking.
                        </p>
                    </div>

                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', marginBottom: '20px', border: '1px solid #E2E8F0' }}>
                        <h4 style={{ fontSize: '1.2rem', color: '#1E293B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: '#DCFCE7', color: '#15803D', padding: '4px 8px', borderRadius: '6px', fontSize: '0.9rem' }}>Trust & Safety</span> Provider Verification (Aadhaar/ID)
                        </h4>
                        <p style={{ marginBottom: '12px' }}>If you apply to be a Service Provider (Groomer, Walker, Boarder), we require government-issued identification.</p>
                        <p style={{ fontSize: '0.95rem', color: '#64748B', background: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                            <strong>Why:</strong> Pet parents are trusting you with members of their family and access to their homes. Rigorous identity verification is the cornerstone of PetSaathi's safety guarantee. We do not use this ID for any marketing purposes, strictly for background verification.
                        </p>
                    </div>

                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', marginBottom: '20px', border: '1px solid #E2E8F0' }}>
                        <h4 style={{ fontSize: '1.2rem', color: '#1E293B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: '#FEF3C7', color: '#B45309', padding: '4px 8px', borderRadius: '6px', fontSize: '0.9rem' }}>Pet Care</span> "My Dogs" Profiles
                        </h4>
                        <p style={{ marginBottom: '12px' }}>We ask for your dog's breed, age, behavioral quirks, dietary needs, and medical/vaccine history.</p>
                        <p style={{ fontSize: '0.95rem', color: '#64748B', background: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                            <strong>Why:</strong> This ensures your pet gets tailored, safe care. For instance, boarders need to know about food allergies, and walkers need to know if a dog is reactive to other dogs. Sharing this context transparently prevents accidents.
                        </p>
                    </div>

                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', marginBottom: '20px', border: '1px solid #E2E8F0' }}>
                        <h4 style={{ fontSize: '1.2rem', color: '#1E293B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: '#FCE7F3', color: '#BE185D', padding: '4px 8px', borderRadius: '6px', fontSize: '0.9rem' }}>Platform</span> Location & Device Data
                        </h4>
                        <p style={{ marginBottom: '12px' }}>We request device location permissions and track basic app usage.</p>
                        <p style={{ fontSize: '0.95rem', color: '#64748B', background: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                            <strong>Why:</strong> PetSaathi is a hyperlocal service. Precise location allows us to show you groomers and walkers who are actually in your neighborhood. We also use push notification tokens to alert you immediately when a booking is confirmed or a chat message arrives.
                        </p>
                    </div>

                    <h3 style={{ fontSize: '1.5rem', color: '#1E293B', marginTop: '40px', marginBottom: '16px' }}>2. Data Sharing and Protection</h3>
                    <p style={{ marginBottom: '16px' }}>
                        We employ enterprise-grade security protocols (including Google Firebase's secure cloud infrastructure) to protect your data. <strong>We do not sell your personal data to third-party advertisers.</strong>
                    </p>
                    <ul style={{ marginLeft: '24px', marginBottom: '24px' }}>
                        <li style={{ marginBottom: '8px' }}><strong>Service Execution:</strong> Your profile and your dog's profile are only shared with a Service Provider <em>after</em> you initiate a booking with them.</li>
                        <li style={{ marginBottom: '8px' }}><strong>Payment Processing:</strong> Financial details are vaulted directly by our payment partner (Razorpay). We do not store credit card numbers on PetSaathi servers.</li>
                        <li style={{ marginBottom: '8px' }}><strong>Legal Compliance:</strong> We may disclose information if required by law or in response to valid requests by public authorities (e.g., a court or government agency).</li>
                    </ul>
                </div>
            </main>
        </div>
    );
}
