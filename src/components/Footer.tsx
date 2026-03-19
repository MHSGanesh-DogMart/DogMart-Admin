import { Link } from "react-router-dom";

const links = [
  { label: "About", path: "#" },
  { label: "Features", path: "#features" },
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Terms", path: "/terms" },
  { label: "Contact", path: "#contact" }
];

const Footer = () => (
  <footer className="py-12 md:py-16 border-t border-primary/10 bg-card/30">
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-center text-center gap-6">
        <div className="font-display text-2xl font-bold text-foreground drop-shadow-sm">🐾 PetSaathi</div>
        <p className="text-muted-foreground text-sm font-medium italic">Apne pet ki poori duniya 🐾</p>

        <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm">
          {links.map((l) => (
            l.path.startsWith("/") ? (
              <Link
                key={l.label}
                to={l.path}
                className="text-muted-foreground hover:text-primary font-bold transition-all hover:scale-105"
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.label}
                href={l.path}
                className="text-muted-foreground hover:text-primary font-bold transition-all hover:scale-105"
              >
                {l.label}
              </a>
            )
          ))}
        </div>

        <div className="flex gap-8 text-muted-foreground text-sm mt-2">
          {["Instagram", "Twitter", "YouTube"].map(social => (
            <a key={social} href="#" className="hover:text-primary font-black uppercase text-[10px] tracking-widest transition-colors">{social}</a>
          ))}
        </div>

        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mt-8">
          © 2026 PetSaathi • Made with ❤️ in India 🇮🇳
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
