import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import FloatingPaws from "./FloatingPaws";
import phoneMockup from "@/assets/phone-mockup.png";
import { useNavigate } from "react-router-dom";

const spring = { type: "spring" as const, stiffness: 260, damping: 20 };

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      <FloatingPaws />
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-8">
          {/* Left — 60% */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ...spring }}
            className="flex-[3] text-center md:text-left"
          >
            <h1
              className="font-display font-extrabold gradient-text text-balance leading-[1.1] mb-6"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
            >
              India Ka Sabse Pyaara Pet App 🐾
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-xl mb-10 mx-auto md:mx-0">
              Buy, Adopt, Groom, Walk, Board — Everything for your pet. One App.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button variant="hero" size="xl" className="shadow-xl shadow-primary/20">
                📱 Download on Play Store
              </Button>
            </div>
          </motion.div>


        {/* Right — 40% phone mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ...spring }}
          className="flex-[2] flex justify-center"
        >
          <motion.img
            src={phoneMockup}
            alt="PetSaathi App showing pet adoption feed"
            className="w-64 md:w-80 drop-shadow-2xl"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </div>
  </section>
  );
};

export default Hero;
