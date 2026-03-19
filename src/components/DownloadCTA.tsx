import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import FloatingPaws from "./FloatingPaws";

const DownloadCTA = () => (
  <section id="download" className="relative py-20 md:py-28 bg-primary overflow-hidden">
    <FloatingPaws />
    <div className="container mx-auto px-4 text-center relative z-10">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.4 }}
        className="text-3xl md:text-5xl font-bold font-display text-primary-foreground mb-4"
      >
        Download PetSaathi Free 🐾
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="text-primary-foreground/90 text-lg mb-10"
      >
        Available on Android. iOS coming soon.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          variant="heroOutline"
          size="xl"
          className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
        >
          📱 Get it on Google Play
        </Button>
      </motion.div>
    </div>
  </section>
);

export default DownloadCTA;
