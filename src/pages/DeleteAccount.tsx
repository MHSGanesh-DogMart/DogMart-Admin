import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Trash2, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingPaws from "@/components/FloatingPaws";

export default function DeleteAccount() {
  return (
    <div className="min-h-screen bg-background flex flex-col pt-20 relative overflow-hidden">
      <FloatingPaws />
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          className="bg-card p-10 md:p-12 rounded-3xl shadow-xl max-w-xl w-full text-center border border-primary/10 relative overflow-hidden"
        >
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

          <div className="bg-red-50 text-red-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100">
            <Trash2 size={40} strokeWidth={1.5} />
          </div>

          <h1 className="font-display text-3xl md:text-4xl text-foreground font-black mb-4">
            Delete Profile
          </h1>
          
          <p className="text-muted-foreground leading-relaxed mb-8 text-[1.1rem]">
            We're sad to see you go! To permanently delete your PetSaathi account and all associated data, simply send us an email from your registered email address.
          </p>
          
          <div className="bg-muted/50 border border-muted flex items-center justify-center gap-3 px-6 py-4 rounded-xl mb-8 group hover:bg-muted transition-colors">
            <Mail className="text-primary" size={24} />
            <span className="font-bold text-lg md:text-xl text-foreground tracking-tight select-all">
              hemanthtech517@gmail.com
            </span>
          </div>
          
          <p className="text-sm font-medium text-muted-foreground/80 mb-10 pb-8 border-b border-border/50">
            Include <span className="text-foreground font-bold">"Account Deletion Request"</span> in the subject line. We will process your request securely within 7 days.
          </p>

          <Link 
            to="/" 
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full font-bold transition-all hover:scale-105 shadow-lg shadow-primary/20 w-full sm:w-auto"
          >
            <ArrowLeft size={20} />
            Return to PetSaathi
          </Link>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
