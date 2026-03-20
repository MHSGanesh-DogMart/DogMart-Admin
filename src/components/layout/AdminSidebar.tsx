import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, Users, CalendarDays, Tag, MapPin, Image as ImageIcon,
  Star, CreditCard, AlertTriangle, Settings, LogOut, Heart, Layers, Grid, 
  Briefcase, Scissors, Mail, ChevronRight, ShoppingBag, Bell, Search, Shield, Gavel
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { group: "General", items: [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/users", icon: Users, label: "Users" },
  ]},
  { group: "Marketplace", items: [
    { to: "/listings", icon: Tag, label: "Pets Moderation" },
    { to: "/products", icon: ShoppingBag, label: "Products Catalog" },
    { to: "/product-categories", icon: Grid, label: "Product Clusters" },
    { to: "/services", icon: Scissors, label: "Pro Services" },
    { to: "/service-categories", icon: Briefcase, label: "Service Tracks" },
    { to: "/service-bookings", icon: CalendarDays, label: "Bookings" },
  ]},
  { group: "Taxonomy", items: [
    { to: "/categories", icon: Grid, label: "Species Master" },
    { to: "/breeds", icon: Layers, label: "Genetic Index" },
    { to: "/locations", icon: MapPin, label: "Operational Zones" },
  ]},
  { group: "Engagement", items: [
    { to: "/banners", icon: ImageIcon, label: "Promo Banners" },
    { to: "/subscriptions", icon: CreditCard, label: "Subscriptions" },
    { to: "/payments", icon: CreditCard, label: "Financials" },
    { to: "/reviews", icon: Star, label: "Moderation Grid" },
    { to: "/support", icon: Mail, label: "Command Inbox" },
    { to: "/notifications", icon: Bell, label: "Emission Center" },
  ]},
  { group: "System", items: [
    { to: "/settings", icon: Settings, label: "Core Settings" },
    { to: "/privacy", icon: Shield, label: "Privacy Protocol" },
    { to: "/terms", icon: Gavel, label: "User Charter" },
  ]}
];

export function AdminSidebar() {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <aside className="w-64 border-r bg-card/50 backdrop-blur-xl h-screen sticky top-0 flex flex-col transition-all duration-300">
      <div className="p-6 border-b flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Heart className="w-6 h-6 text-white fill-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg leading-none">PetSaathi</h1>
          <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mt-1 block">Admin Hub</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-thin">
        {navItems.map((group) => (
          <div key={group.group} className="space-y-1">
            <h3 className="px-3 text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mb-2">
              {group.group}
            </h3>
            {group.items.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group relative",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                      : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <motion.div layoutId="active" className="absolute left-0 w-1 h-4 bg-white rounded-full" />
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t mt-auto shadow-sm">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
