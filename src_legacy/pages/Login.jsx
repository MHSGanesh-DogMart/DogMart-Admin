import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Heart, Lock, Mail, Eye, EyeOff, ShieldCheck, ChevronRight, Info, AlertTriangle } from 'lucide-react';
import { tokens } from '../styles/DesignTokens';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHelper, setShowHelper] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, pass);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please check the Helper below if you are unsure.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FDFCFB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Inter", sans-serif'
    }}>
      {/* Decorative Background Elements */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,123,84,0.08) 0%, transparent 70%)',
          top: -200, left: -100, pointerEvents: 'none'
        }}
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, -5, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(238,93,93,0.05) 0%, transparent 70%)',
          bottom: -150, right: -100, pointerEvents: 'none'
        }}
      />

      <div style={{ width: '100%', maxWidth: 440, padding: 24, zIndex: 10 }}>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 40 }}
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            style={{
              width: 72, height: 72, borderRadius: 22, margin: '0 auto 20px',
              background: tokens.colors.primary.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 12px 32px ${tokens.colors.primary.glow}`
            }}
          >
            <Heart size={32} color="white" fill="white" />
          </motion.div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 8 }}>PetSaathi</h1>
          <p style={{ color: 'var(--text3)', fontSize: 15, fontWeight: 600 }}>Administrative Control Center</p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            borderRadius: 32,
            padding: 40,
            boxShadow: '0 20px 50px rgba(0,0,0,0.05)'
          }}
        >
          <form onSubmit={handleSubmit}>
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    borderRadius: 12, padding: '12px 16px', marginBottom: 24,
                    color: 'var(--danger)', fontSize: 13, fontWeight: 600,
                    borderLeft: '4px solid var(--danger)',
                    display: 'flex', alignItems: 'center', gap: 10
                  }}
                >
                  <AlertTriangle size={16} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label" style={{ fontWeight: 700, color: 'var(--text2)', marginBottom: 8, display: 'block' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@dogmart.app"
                  required
                  style={{
                    padding: '14px 14px 14px 48px',
                    borderRadius: 16,
                    background: 'white',
                    border: '1px solid var(--border)',
                    fontSize: 15
                  }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 32 }}>
              <label className="form-label" style={{ fontWeight: 700, color: 'var(--text2)', marginBottom: 8, display: 'block' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    padding: '14px 48px 14px 48px',
                    borderRadius: 16,
                    background: 'white',
                    border: '1px solid var(--border)',
                    fontSize: 15
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 8
                  }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%', justifyContent: 'center', padding: '16px',
                borderRadius: 16, fontSize: 16, fontWeight: 800,
                boxShadow: `0 8px 24px ${tokens.colors.primary.glow}`
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In Securely'}
              {!loading && <ChevronRight size={18} style={{ marginLeft: 4 }} />}
            </motion.button>
          </form>

          {/* Credentials Helper Section */}
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <button
              onClick={() => setShowHelper(!showHelper)}
              style={{
                background: 'none', border: 'none', width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, color: tokens.colors.primary.main, fontWeight: 700,
                fontSize: 13, cursor: 'pointer'
              }}
            >
              <Info size={14} /> {showHelper ? 'Hide Credentials Helper' : 'Forgot or need credentials?'}
            </button>

            <AnimatePresence>
              {showHelper && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{
                    marginTop: 16, padding: 16, borderRadius: 16,
                    background: 'rgba(255, 123, 84, 0.05)',
                    border: '1px solid rgba(255, 123, 84, 0.1)',
                    fontSize: 12, color: 'var(--text2)', lineHeight: 1.5
                  }}
                >
                  <p style={{ marginBottom: 12 }}><strong>How to find credentials:</strong></p>
                  <ul style={{ paddingLeft: 18, marginBottom: 12 }}>
                    <li>Check <strong>Firebase Authentication</strong> dashboard in the Firebase Console.</li>
                    <li>If no admin exists, create a user with email <code>admin@dogmart.app</code>.</li>
                    <li>Look for any <code>.env</code> files or <code>serviceAccountKey.json</code> in the root.</li>
                  </ul>
                  <div style={{ padding: 10, background: 'white', borderRadius: 8, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <ShieldCheck size={14} color="var(--success)" />
                    <span>Try default: <code>admin@dogmart.app</code> / <code>admin123</code></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', fontSize: 11, color: 'var(--text3)' }}>
                    <AlertTriangle size={12} />
                    <span>Fallback: Use your previously registered Firebase Admin email.</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 13, color: 'var(--text3)', fontWeight: 600 }}>
          &copy; 2026 PetSaathi Tech • Authorized Access Only
        </p>
      </div>
    </div>
  );
}
