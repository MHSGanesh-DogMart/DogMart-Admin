import { Search, Bell, User, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

export function AdminHeader() {
  const { user } = useAuth();

  return (
    <header className="h-20 border-b bg-background/80 backdrop-blur-md sticky top-0 z-30 px-8 flex items-center justify-between shadow-sm">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search records, users, or transactions..." 
            className="pl-10 bg-muted/50 border-none focus-visible:ring-primary rounded-xl h-11"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 mr-4 border-r pr-4">
          <Button variant="ghost" size="icon" className="rounded-xl relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <MessageCircle className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold leading-none">{user?.email?.split('@')[0] || 'Admin'}</p>
            <p className="text-[10px] text-muted-foreground font-bold tracking-tight uppercase mt-1">Super Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold shadow-inner">
            {user?.email?.[0].toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
}
