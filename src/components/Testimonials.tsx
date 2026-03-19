import { motion } from "framer-motion";

const testimonials = [
  {
    text: "Found my Golden Retriever puppy through PetSaathi in just 2 days! The seller was verified and trustworthy.",
    name: "Priya R.",
    location: "Hyderabad",
    emoji: "🐶",
  },
  {
    text: "Booked grooming for my Labrador and the experience was amazing. Highly recommended!",
    name: "Rahul M.",
    location: "Bangalore",
    emoji: "🐾",
  },
  {
    text: "As a kennel owner, PetSaathi helped me reach so many new customers. My business grew 3x in 2 months!",
    name: "Happy Paws Kennel",
    location: "Chennai",
    emoji: "🏪",
  },
];

const spring = { type: "spring" as const, stiffness: 260, damping: 20 };

const Testimonials = () => (
  <section className="py-20 md:py-28 bg-secondary/40">
    <div className="container mx-auto px-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.4 }}
        className="text-3xl md:text-5xl font-bold font-display text-center mb-16"
      >
        Pet Lovers Love PetSaathi ❤️
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: i * 0.12, ...spring }}
            whileHover={{ y: -6 }}
            className="p-8 bg-card rounded-[32px] shadow-soft border border-primary/10"
          >
            <div className="text-primary text-lg mb-4">⭐⭐⭐⭐⭐</div>
            <p className="text-foreground leading-relaxed mb-6">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{t.emoji}</span>
              <div>
                <div className="font-bold font-display text-foreground">{t.name}</div>
                <div className="text-sm text-muted-foreground">{t.location}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
