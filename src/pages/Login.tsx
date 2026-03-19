import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Heart, Lock, Mail, Eye, EyeOff, 
  ShieldCheck, ChevronRight, Info, AlertTriangle 
} from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHelper, setShowHelper] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, pass);
      toast.success("Welcome back, Admin! 🐾");
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials. Please verify your email and password.");
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute w-[600px] h-[600px] rounded-full bg-primary/5 -top-[200px] -left-[100px] blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute w-[500px] h-[500px] rounded-full bg-orange-500/5 -bottom-[150px] -right-[100px] blur-3xl pointer-events-none"
      />

      <div className="w-full max-w-[440px] z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20"
          >
            <Heart size={32} className="text-white fill-white" />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">PetPal Hub</h1>
          <p className="text-muted-foreground text-sm font-semibold">Administrative Access Only</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[32px] p-8 md:p-10 shadow-xl shadow-black/5"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-semibold border-l-4 border-red-500 flex items-center gap-2 overflow-hidden"
                >
                  <AlertTriangle size={14} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground ml-1">Admin Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@petpal.app"
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-background border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground ml-1">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-12 py-3 rounded-2xl bg-background border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-primary transition-colors"
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
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Enter Secure Portal"}
              {!loading && <ChevronRight size={18} />}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-border">
            <button
              onClick={() => setShowHelper(!showHelper)}
              className="w-full flex items-center justify-center gap-2 text-primary text-xs font-bold hover:underline"
            >
              <Info size={14} /> {showHelper ? "Hide Login Tips" : "Credentials Issue?"}
            </button>

            <AnimatePresence>
              {showHelper && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 text-[11px] leading-relaxed text-muted-foreground"
                >
                  <p className="font-bold mb-2 text-foreground">Internal Access Guide:</p>
                  <ul className="list-disc pl-4 space-y-1 mb-3">
                    <li>Use your authorized Firebase credentials.</li>
                    <li>If you need to reset, use the Firebase Auth console.</li>
                  </ul>
                  <div className="p-2 bg-white rounded-lg border border-border flex items-center gap-2">
                    <ShieldCheck size={14} className="text-green-500" />
                    <span>Default: <code className="font-bold">admin@dogmart.app</code> / <code className="font-bold">admin123</code></span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <p className="text-center mt-10 text-[11px] text-muted-foreground font-semibold">
          © 2026 PetPal Hub • Built with Premium Design Intelligence
        </p>
      </div>
    </div>
  );
};

export default Login;
