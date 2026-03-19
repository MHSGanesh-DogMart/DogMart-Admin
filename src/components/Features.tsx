import { motion } from "framer-motion";
import { PawPrint, Store, Scissors, ShoppingCart, MessageCircle } from "lucide-react";

const features = [
  {
    icon: PawPrint,
    title: "Buy & Adopt Pets",
    desc: "Find verified dogs, cats, birds, rabbits from trusted sellers & kennels. Adoption listings always free.",
    span: "md:col-span-2 md:row-span-1",
  },
  // {
  //   icon: Store,
  //   title: "Verified Kennels",
  //   desc: "Browse kennel profiles, see their dogs, products and boarding services. All kennels verified by PetSaathi team.",
  //   span: "md:col-span-1 md:row-span-2",
  // },
  {
    icon: Scissors,
    title: "Pet Services",
    desc: "Book grooming, dog walking and boarding from verified providers near you. Pay securely in-app.",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    icon: ShoppingCart,
    title: "Pet Shop",
    desc: "Shop food, toys, medicines, beds, grooming products — delivered to your door.",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    icon: MessageCircle,
    title: "Safe Chat",
    desc: "Chat with sellers only after connecting. Phone number and address revealed only to premium subscribers.",
    span: "md:col-span-1 md:row-span-1",
  },
];

const spring = { type: "spring" as const, stiffness: 260, damping: 20 };

const Features = () => (
  <section id="features" className="py-20 md:py-28">
    <div className="container mx-auto px-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.4 }}
        className="text-3xl md:text-5xl font-bold font-display text-center text-balance mb-16"
      >
        Everything Your Pet Needs 🐾
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: i * 0.08, ...spring }}
            whileHover={{ y: -8 }}
            className={`p-8 bg-card rounded-[32px] shadow-soft border border-primary/10 ${f.span}`}
          >
            <div className="w-14 h-14 bg-secondary rounded-[20px] mb-6 flex items-center justify-center">
              <f.icon className="text-primary" size={28} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl md:text-2xl font-bold font-display mb-3 text-foreground">{f.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
