import { Link } from "react-router-dom";

const links = [
  { label: "About", path: "#" },
  { label: "Features", path: "#features" },
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Terms", path: "/terms" },
  { label: "Delete Account", path: "/delete-account" },
  { label: "Contact", path: "#contact" }
];

const Footer = () => (
  <footer className="py-12 md:py-16 border-t border-primary/10 bg-card/30">
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-center text-center gap-6">
        <Link to="/" className="flex items-center gap-3 font-display text-2xl font-bold text-foreground drop-shadow-sm group">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md group-hover:scale-110 transition-transform bg-primary/10 p-1">
            <img src="/logo.png" alt="PetSaathi Logo" className="w-full h-full object-cover rounded-lg" />
          </div>
          <span>PetSaathi</span>
        </Link>
        <p className="text-muted-foreground text-sm font-medium italic">Apne pet ki poori duniya 🐾</p>

        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-sm">
          {links.map((l) => {
            const isDelete = l.path === "/delete-account";
            return l.path.startsWith("/") ? (
              <Link
                key={l.label}
                to={l.path}
                className={`font-bold transition-all hover:scale-105 ${
                  isDelete ? "text-red-500 hover:text-red-600 flex items-center gap-1" : "text-muted-foreground hover:text-primary"
                }`}
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
            );
          })}
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
