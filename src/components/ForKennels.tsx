import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const benefits = [
  "Free kennel profile",
  "Verified badge builds trust",
  "Sell dogs + products + services",
  "Get bookings directly in app",
  "Chat with potential buyers",
];

const ForKennels = () => (
  <section id="kennels" className="py-20 md:py-28">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
        {/* Left text */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
          className="flex-1"
        >
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-6 text-balance">
            Are You a Kennel or Breeder? 🏪
          </h2>
          <p className="text-muted-foreground leading-relaxed text-lg mb-8">
            Join PetSaathi and reach thousands of pet lovers across India.
            List your dogs, sell products, offer boarding — all from one verified kennel profile.
          </p>
          <ul className="space-y-4 mb-10">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3 text-foreground">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check size={14} className="text-primary" strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>
          <Button variant="hero" size="xl">
            🏪 Register Your Kennel
          </Button>
        </motion.div>

        {/* Right visual */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
          className="flex-1 flex justify-center"
        >
          <div className="w-72 h-80 md:w-96 md:h-[420px] bg-secondary rounded-[32px] flex items-center justify-center shadow-soft border border-primary/10">
            <span className="text-8xl">🏠</span>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default ForKennels;
