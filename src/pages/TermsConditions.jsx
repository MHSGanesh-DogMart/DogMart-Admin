import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';

export default function TermsConditions() {
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
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: '"Outfit", sans-serif', color: '#FF7B54' }}>DogMart</span>
                </div>
                <button
                    onClick={() => navigate('/')}
                    style={{ border: 'none', background: 'none', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                    <ArrowLeft size={18} /> Back to Home
                </button>
            </header>

            <main style={{ padding: '140px 5% 100px', maxWidth: 800, margin: '0 auto' }}>
                <h1 style={{ fontSize: '3rem', fontFamily: '"Outfit", sans-serif', fontWeight: 800, marginBottom: '16px', color: '#1E293B' }}>Terms & Conditions</h1>
                <p style={{ color: '#64748B', marginBottom: '40px' }}><em>Last Updated: March 2026</em></p>

                <div style={{ color: '#475569', lineHeight: 1.8, fontSize: '1.1rem' }}>
                    <p style={{ marginBottom: '30px' }}>
                        Welcome to DogMart. By accessing or using the DogMart mobile application, website, or associated services (collectively, the "Platform"),
                        you agree to be bound by these Terms and Conditions. Please read them carefully to understand your rights and responsibilities.
                    </p>

                    <h3 style={{ fontSize: '1.5rem', color: '#1E293B', marginTop: '40px', marginBottom: '16px' }}>1. The Role of DogMart</h3>
                    <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '16px', borderLeft: '4px solid #3B82F6', marginBottom: '24px' }}>
                        <p style={{ marginBottom: '12px' }}><strong>We are a Marketplace, Not an Employer.</strong></p>
                        <p style={{ fontSize: '0.95rem' }}>
                            DogMart provides a technology platform that connects pet owners ("Pet Parents") with independent third-party pet care
                            service providers ("Providers") such as groomers, dog walkers, and boarders. DogMart does not employ these Providers
                            nor do we provide pet care services directly.
                        </p>
                    </div>

                    <h3 style={{ fontSize: '1.5rem', color: '#1E293B', marginTop: '40px', marginBottom: '16px' }}>2. User Responsibilities & Conduct</h3>
                    <ul style={{ marginLeft: '24px', marginBottom: '24px' }}>
                        <li style={{ marginBottom: '12px' }}>
                            <strong>Honest Representation:</strong> Pet Parents must accurately describe their dog's breed, temperament, and medical conditions (especially aggressive tendencies or bite histories). Failure to do so endangers Providers and may result in immediate account termination.
                        </li>
                        <li style={{ marginBottom: '12px' }}>
                            <strong>Health & Vaccinations:</strong> All dogs participating in boarding, walking, or grooming services booked through DogMart MUST be up-to-date on standard vaccinations (Rabies, DHLPP). Providers have the right to request proof before beginning service.
                        </li>
                        <li style={{ marginBottom: '12px' }}>
                            <strong>Provider Professionalism:</strong> Service Providers agree to maintain professional conduct, arrive on time for scheduled bookings, and communicate promptly via the in-app chat.
                        </li>
                    </ul>

                    <h3 style={{ fontSize: '1.5rem', color: '#1E293B', marginTop: '40px', marginBottom: '16px' }}>3. Bookings, Cancellations, and Payments</h3>
                    <ul style={{ marginLeft: '24px', marginBottom: '24px' }}>
                        <li style={{ marginBottom: '12px' }}>
                            <strong>Secure Transactions:</strong> All payments for services booked through DogMart must be completed via the platform's integrated payment gateway (Razorpay). Paying Providers in cash directly violates our Terms and voids any platform support or guarantees.
                        </li>
                        <li style={{ marginBottom: '12px' }}>
                            <strong>Cancellations:</strong> Pet Parents may cancel bookings within the app. Cancellations made less than 24 hours before a scheduled service may be subject to a cancellation fee to compensate the Provider for lost time.
                        </li>
                        <li style={{ marginBottom: '12px' }}>
                            <strong>Platform Fees:</strong> DogMart charges a variable commission rate on the total booking value for Service Providers to maintain platform infrastructure, verification processes, and customer support.
                        </li>
                    </ul>

                    <h3 style={{ fontSize: '1.5rem', color: '#1E293B', marginTop: '40px', marginBottom: '16px' }}>4. Premium Subscriptions</h3>
                    <p style={{ marginBottom: '16px' }}>
                        Users may opt into Paid Premium Subscriptions (handled securely via Razorpay). These subscriptions grant benefits such as zero booking fees and priority placements.
                        Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current billing period. DogMart does not offer prorated refunds for mid-cycle cancellations.
                    </p>

                    <h3 style={{ fontSize: '1.5rem', color: '#1E293B', marginTop: '40px', marginBottom: '16px' }}>5. Limitation of Liability</h3>
                    <p style={{ marginBottom: '16px' }}>
                        While DogMart conducts background checks on Providers, we cannot guarantee the quality or safety of every transaction.
                        DogMart is not liable for any injuries, damages, or losses to pets, property, or persons that occur during a service booked through the platform.
                        Users agree to use the platform at their own risk.
                    </p>
                </div>
            </main>
        </div>
    );
}
