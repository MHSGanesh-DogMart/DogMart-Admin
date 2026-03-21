import { motion } from "framer-motion";
import { Gavel, UserCheck, CreditCard, ShieldAlert, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingPaws from "@/components/FloatingPaws";

export default function TermsConditions() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      icon: <Gavel className="text-primary" size={28} />,
      items: [
        { title: "Binding Agreement", desc: "By using PetSaathi, you agree to these Terms. If you don't agree, please refrain from using our platform." },
        { title: "Eligibility", desc: "You must be 18+ years old to form a binding contract and book services on PetSaathi." }
      ]
    },
    {
      title: "2. User & Kennel Duties",
      icon: <UserCheck className="text-primary" size={28} />,
      items: [
        { title: "Accurate Profiles", desc: "Misleading data about your pet or kennel business may lead to permanent account suspension." },
        { title: "Pet Safety First", desc: "Owners must ensure pets are fully vaccinated & disclose any behavioral issues before a service." }
      ]
    },
    {
      title: "3. Payments & Fees",
      icon: <CreditCard className="text-primary" size={28} />,
      items: [
        { title: "Secure Gateway", desc: "All payments must route securely through the app. Cash transactions outside the platform are not protected." },
        { title: "Platform Fees", desc: "PetSaathi charges a small convenience fee for facilitating secure, transparent bookings." }
      ]
    },
    {
      title: "4. Liability & Safety",
      icon: <ShieldAlert className="text-primary" size={28} />,
      items: [
        { title: "Marketplace Role", desc: "We are an aggregator platform connecting you with independent service providers and kennels." },
        { title: "Risk Acknowledgment", desc: "Users agree to hold PetSaathi harmless for incidental issues or injuries relating to pet care." }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col pt-20 relative overflow-hidden">
      <FloatingPaws />
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-16 relative z-10 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gavel size={40} className="text-primary" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight">
            Terms of <span className="text-primary">Service</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl mx-auto italic">
            Ensuring a safe, trusted, and pawsitive environment for everyone in the PetSaathi community.
          </p>
        </motion.div>

        <div className="space-y-12">
          {sections.map((section, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card p-8 md:p-10 rounded-3xl shadow-sm border border-primary/5 hover:border-primary/20 transition-all"
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
          className="mt-16 bg-red-50 rounded-3xl p-10 text-center border-l-4 border-red-500"
        >
          <div className="bg-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
            <ShieldAlert size={32} />
          </div>
          <h3 className="text-2xl font-black text-red-900 mb-4">Zero Tolerance Policy</h3>
          <p className="text-red-700/80 mb-6 max-w-lg mx-auto font-medium">
            We reserve the right to immediately suspend or permanently ban accounts that violate our safety protocols, animal welfare standards, or community guidelines.
          </p>
        </motion.div>

      </main>
      <Footer />
    </div>
  );
}
