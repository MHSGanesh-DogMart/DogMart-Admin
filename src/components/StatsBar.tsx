import { motion } from "framer-motion";

const stats = [
  { number: "10+", label: "Happy Pet Owners" },
  { number: "1+", label: "Verified Kennels" },
  { number: "10+", label: "Pets Listed" },
  { number: "4.8★", label: "App Rating" },
];

const StatsBar = () => (
  <section className="bg-primary py-12 md:py-16">
    <div className="container mx-auto px-4">
      <div className="flex flex-wrap justify-around items-center gap-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.1, duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
            className="text-center"
          >
            <div className="text-3xl md:text-4xl font-bold font-display text-primary-foreground tabular-nums">
              {s.number}
            </div>
            <div className="text-sm uppercase tracking-widest text-primary-foreground/90 mt-1">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsBar;
