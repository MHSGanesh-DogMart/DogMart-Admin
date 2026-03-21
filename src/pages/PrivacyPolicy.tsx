import { motion } from "framer-motion";
import { Shield, Eye, Database, Lock, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingPaws from "@/components/FloatingPaws";

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "1. Information We Collect",
      icon: <Database className="text-primary" size={28} />,
      items: [
        { title: "Personal Information", desc: "Name, email, phone number, and profile picture to maintain your account." },
        { title: "Pet Details", desc: "Breed, age, gender, and health notes to ensure safe & personalized care." },
        { title: "Location Data", desc: "We use location (with your permission) to show verified kennels and services near you." }
      ]
    },
    {
      title: "2. How We Use Your Data",
      icon: <Eye className="text-primary" size={28} />,
      items: [
        { title: "Core Services", desc: "To facilitate seamless pet adoption, product purchases, and service bookings." },
        { title: "Platform Safety", desc: "To verify users and kennels, preventing fraud and building a high-trust community." },
        { title: "Updates", desc: "To send you booking confirmations, app updates, and support messages." }
      ]
    },
    {
      title: "3. Data Sharing & Security",
      icon: <Shield className="text-primary" size={28} />,
      items: [
        { title: "Trusted Providers", desc: "Limited details are shared with service providers ONLY after you confirm a booking." },
        { title: "No Selling Data", desc: "We absolutely do NOT sell your personal data to advertisers or third-party brokers." },
        { title: "Bank-Grade Encryption", desc: "Your data is secured using top-tier encryption via Google Firebase infrastructure." }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col pt-20 relative overflow-hidden">
      <FloatingPaws />
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-16 relative z-10 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={40} className="text-primary" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-foreground">
            Privacy <span className="text-primary">Policy</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl mx-auto">
            At PetSaathi, your privacy is just as important as your pet's happiness. Here is exactly how we protect your data.
          </p>
        </motion.div>

        <div className="space-y-12">
          {sections.map((section, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card p-8 md:p-10 rounded-3xl shadow-sm border border-primary/5 hover:border-primary/20 transition-colors"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-primary/10 p-4 rounded-2xl">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-black text-foreground">{section.title}</h2>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                {section.items.map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <CheckCircle2 className="text-primary shrink-0 mt-1" size={20} />
                    <div>
                      <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-primary/5 rounded-3xl p-10 text-center border border-primary/10"
        >
          <h3 className="text-2xl font-black mb-4">Still have questions?</h3>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Our data privacy team is always here to help. Reach out to us anytime regarding your personal information.
          </p>
          <a href="mailto:hemanthtech517@gmail.com" className="font-bold text-primary text-xl hover:underline">
            hemanthtech517@gmail.com
          </a>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
