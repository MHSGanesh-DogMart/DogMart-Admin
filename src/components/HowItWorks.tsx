import { motion } from "framer-motion";
import { Search, PawPrint, Heart } from "lucide-react";

const steps = [
  { num: 1, icon: Search, title: "Download & Sign Up", desc: "Create your free account in seconds with phone OTP." },
  { num: 2, icon: PawPrint, title: "Explore Everything", desc: "Browse pets, kennels, services and products near you." },
  { num: 3, icon: Heart, title: "Connect & Adopt", desc: "Chat with sellers, book services, shop products — all in one place." },
];

const spring = { type: "spring" as const, stiffness: 260, damping: 20 };

const HowItWorks = () => (
  <section id="how-it-works" className="py-20 md:py-28 bg-secondary/40">
    <div className="container mx-auto px-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.4 }}
        className="text-3xl md:text-5xl font-bold font-display text-center mb-16"
      >
        Simple as 1-2-3 🐾
      </motion.h2>

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-12 md:gap-0 max-w-4xl mx-auto">
        {/* Connecting line */}
        <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-primary/30 -translate-y-1/2" />

        {steps.map((s, i) => (
          <motion.div
            key={s.num}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: i * 0.15, ...spring }}
            className="flex flex-col items-center text-center flex-1 relative z-10"
          >
            <div className="w-16 h-16 rounded-full bg-card text-primary flex items-center justify-center shadow-soft font-bold font-display text-2xl mb-4 border border-primary/20">
              {s.num}
            </div>
            <div className="w-12 h-12 bg-secondary rounded-[16px] flex items-center justify-center mb-4">
              <s.icon className="text-primary" size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold font-display mb-2 text-foreground">{s.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-[220px]">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
