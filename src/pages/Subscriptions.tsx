import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Crown, X, Calendar, Activity, 
  XCircle, TrendingUp, Users, ShieldCheck,
  CreditCard, ShieldAlert
} from "lucide-react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Subscription {
  id: string;
  userId: string;
  planName?: string;
  amount: number;
  status: string;
  startDate?: string;
  expiryDate?: string;
}

export default function Subscriptions() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [filtered, setFiltered] = useState<Subscription[]>([]);
  const [stats, setStats] = useState({ activeCount: 0, mrr: 0 });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? '' : filter;
      const [subsRes, statsRes] = await Promise.all([
        api.get(`/subscriptions?status=${status}`),
        api.get('/subscriptions/stats/mrr')
      ]);
      setSubs(subsRes.data.subscriptions || []);
      setFiltered(subsRes.data.subscriptions || []);
      setStats(statsRes.data);
    } catch (e) {
      console.error("Failed to fetch subscriptions:", e);
      toast.error("Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const r = subs.filter(s => s.userId?.toString().includes(search));
    setFiltered(r);
  }, [search, subs]);

  const handleCancel = async (subId: string) => {
    if (!window.confirm("Immediately terminate this user's premium access?")) return;
    setCancelling(true);
    try {
      await api.patch(`/subscriptions/${subId}/status`, { status: 'cancelled' });
      toast.success("Subscription cancelled successfully");
      refresh();
      setSelected(null);
    } catch (e) {
      toast.error("Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground font-display uppercase">Premium Memberships</h1>
          <p className="text-muted-foreground mt-1 font-medium">Monitor subscription health and platform recurring revenue.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="px-6 py-4 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center gap-4">
               <Crown className="w-8 h-8 text-primary animate-pulse" />
               <div>
                  <p className="text-[10px] font-black uppercase text-primary/60 tracking-widest leading-none">Monthly Recurring (MRR)</p>
                  <p className="text-2xl font-black text-primary font-display leading-none mt-1">₹{(stats.mrr || 0).toLocaleString()}</p>
               </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-premium rounded-[2.5rem] bg-gradient-to-br from-primary to-primary/80 text-white overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-125 transition-transform duration-700">
              <TrendingUp className="w-32 h-32" />
           </div>
           <CardContent className="p-10 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-2">Growth Analytics</p>
              <h3 className="text-5xl font-black font-display leading-none">{stats.activeCount}</h3>
              <p className="text-sm font-bold mt-4 opacity-90">Active Subscribers across all tiers.</p>
              <div className="mt-8 flex gap-2">
                 <Badge className="bg-white/20 text-white border-none font-black italic">PRO</Badge>
                 <Badge className="bg-white/20 text-white border-none font-black italic">ULTIMATE</Badge>
              </div>
           </CardContent>
        </Card>

        <Card className="border-none shadow-premium rounded-[2.5rem] bg-background border border-muted-foreground/5 overflow-hidden flex flex-col justify-center p-10 hover:shadow-xl transition-all">
           <div className="flex items-center gap-5 mb-6">
              <div className="w-14 h-14 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                 <Users className="w-7 h-7" />
              </div>
              <div>
                 <h4 className="font-black text-xl tracking-tighter">Subscriber Base</h4>
                 <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Platform Integrity</p>
              </div>
           </div>
           <div className="space-y-3">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                 <div className="h-full bg-primary w-[75%] rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
              </div>
              <p className="text-xs font-bold text-muted-foreground">75% of users are on High-Tier plans.</p>
           </div>
        </Card>
      </div>

      <Card className="border-none shadow-premium overflow-hidden">
        <CardHeader className="pb-0 pt-6">
          <div className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-muted/20 p-4 rounded-3xl border border-muted-foreground/5 shadow-inner">
            <div className="relative w-full xl:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search by User Identifier..." 
                className="pl-10 bg-background border-none shadow-sm rounded-2xl font-bold h-11"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <Tabs value={filter} onValueChange={setFilter} className="w-full xl:w-auto">
              <TabsList className="bg-background border p-1 h-auto rounded-2xl shadow-sm">
                {['all', 'active', 'expired', 'cancelled'].map(f => (
                   <TabsTrigger 
                    key={f} 
                    value={f}
                    className="rounded-xl px-4 py-2 text-[10px] font-black data-[state=active]:bg-primary data-[state=active]:text-white uppercase tracking-widest transition-all"
                  >
                    {f}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent className="p-0 mt-6 px-6 pb-6">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/10">
                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase opacity-60">Subscriber ID</th>
                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase opacity-60">Membership Plan</th>
                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase opacity-60">Lifecycle Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase opacity-60 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="h-64 text-center py-20 uppercase font-black opacity-10 italic">
                           Member List Empty / No Matches
                        </td>
                      </tr>
                    ) : filtered.map((s, i) => (
                      <motion.tr 
                        key={s.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b hover:bg-muted/40 transition-all group cursor-pointer"
                        onClick={() => setSelected(s)}
                      >
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-[10px] font-black text-muted-foreground uppercase opacity-40 italic">UID</div>
                              <span className="font-black text-sm tracking-tighter">{s.userId}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex flex-col">
                              <span className="font-black text-xs uppercase tracking-tight text-foreground">{s.planName} Tier</span>
                              <span className="text-[10px] font-bold text-primary">₹{(s.amount || 0).toLocaleString()} / Billing</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <Badge variant={s.status === 'active' ? 'success' : 'destructive'} className="rounded-xl px-4 py-1 text-[10px] font-black uppercase tracking-widest border-2 border-transparent group-hover:border-primary/20">
                             {s.status}
                           </Badge>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <Button variant="ghost" size="sm" className="rounded-xl font-black italic scale-95 group-hover:scale-100 transition-all opacity-40 group-hover:opacity-100 bg-muted">
                              Audit Access
                           </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => {!o && setSelected(null)}}>
        <DialogContent className="max-w-md rounded-[3rem] p-0 overflow-hidden border-none shadow-premium bg-background">
           <div className="p-12 space-y-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-[2rem] bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/30">
                 <Crown className="w-12 h-12" />
              </div>

              <div className="space-y-2">
                 <h2 className="text-4xl font-black tracking-tighter uppercase font-display italic">Elite Access</h2>
                 <p className="text-muted-foreground font-black text-xs uppercase tracking-widest">{selected?.planName} Plan Lifecycle</p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                 <div className="p-6 rounded-3xl bg-muted/40 border border-muted-foreground/5">
                    <p className="text-[10px] font-black uppercase opacity-40 mb-2">Member ID</p>
                    <p className="font-black text-sm truncate">{selected?.userId}</p>
                 </div>
                 <div className="p-6 rounded-3xl bg-muted/40 border border-muted-foreground/5 text-emerald-600">
                    <p className="text-[10px] font-black uppercase opacity-40 mb-2">Billing</p>
                    <p className="font-black text-sm">₹{selected?.amount}</p>
                 </div>
              </div>

              <div className="flex gap-4 w-full pt-4">
                 {selected?.status === 'active' && (
                    <Button 
                      onClick={() => selected && handleCancel(selected.id)}
                      disabled={cancelling}
                      variant="destructive" 
                      className="flex-1 h-16 rounded-[1.5rem] font-black tracking-widest uppercase text-xs shadow-xl shadow-destructive/20"
                    >
                       {cancelling ? "Revoking..." : "Revoke Access"}
                    </Button>
                 )}
                 <Button variant="outline" onClick={() => setSelected(null)} className="flex-1 h-16 rounded-[1.5rem] font-black tracking-widest uppercase text-xs">Close</Button>
              </div>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
