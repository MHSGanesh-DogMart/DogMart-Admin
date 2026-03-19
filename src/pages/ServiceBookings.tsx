import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, Eye, CheckCircle, XCircle, 
  Ban, Calendar, Clock, MapPin, IndianRupee,
  Briefcase, Activity, TrendingUp, AlertCircle
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

interface Booking {
  id: string;
  serviceType?: string;
  dogName?: string;
  date?: string;
  time?: string;
  locationType?: string;
  amount: number;
  platformCommission?: number;
  providerEarning?: number;
  paymentId?: string;
  status: string;
  specialInstructions?: string;
  providerNote?: string;
}

export default function ServiceBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filtered, setFiltered] = useState<Booking[]>([]);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/service-bookings');
      setBookings(res.data.bookings || []);
      setFiltered(res.data.bookings || []);
    } catch (e) {
      console.error("Failed to fetch bookings:", e);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    let res = bookings;
    if (tab !== "all") res = res.filter(b => b.status === tab);
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(b =>
        (b.serviceType || "").toLowerCase().includes(q) ||
        (b.dogName || "").toLowerCase().includes(q) ||
        (b.id || "").toLowerCase().includes(q)
      );
    }
    setFiltered(res);
  }, [search, tab, bookings]);

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm("Permanently cancel this booking and issue refund?")) return;
    setCancelling(true);
    try {
      await api.post('/service-bookings/reject', { bookingId, reason: 'Cancelled by admin' });
      toast.success("Booking cancelled and notification sent");
      fetchBookings();
      setSelected(null);
    } catch (e) {
      toast.error("Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    active: bookings.filter(b => b.status === 'active').length,
    revenue: bookings.filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.platformCommission || 0), 0),
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground font-display">Service Appointments</h1>
          <p className="text-muted-foreground mt-1 font-medium italic">Manage grooming, walking, and professional boarding schedules.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="px-5 py-3 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col">
                <span className="text-[10px] font-black uppercase text-primary/60 tracking-widest">Commission Pool</span>
                <span className="text-xl font-black text-primary font-display">₹{(stats.revenue || 0).toLocaleString()}</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
            { label: 'Live Bookings', val: stats.total, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Pending Slots', val: stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Ongoing Now', val: stats.active, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map(s => (
            <Card key={s.label} className="border-none shadow-premium overflow-hidden group">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className={`${s.bg} ${s.color} p-4 rounded-2xl transition-transform group-hover:scale-110 duration-500`}>
                        <s.icon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-foreground font-display">{s.val}</p>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{s.label}</p>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>

      <Card className="border-none shadow-premium overflow-hidden">
        <CardHeader className="pb-0 pt-6">
          <div className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-muted/20 p-4 rounded-3xl border border-muted-foreground/5">
            <div className="relative w-full xl:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search service, dog, or reference ID..." 
                className="pl-10 bg-background border-none shadow-sm rounded-2xl font-bold h-11"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <Tabs value={tab} onValueChange={setTab} className="w-full xl:w-auto">
              <TabsList className="bg-background border p-1 h-auto rounded-2xl shadow-sm">
                {['all', 'pending', 'confirmed', 'active', 'completed', 'rejected', 'cancelled'].map(t => (
                   <TabsTrigger 
                    key={t} 
                    value={t}
                    className="rounded-xl px-4 py-2 text-[10px] font-black data-[state=active]:bg-primary data-[state=active]:text-white uppercase tracking-widest transition-all"
                  >
                    {t}
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
                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase opacity-60">Ref ID</th>
                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase opacity-60">Service Type</th>
                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase opacity-60">Customer Pet</th>
                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase opacity-60">Schedule</th>
                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase opacity-60">Comm. (₹)</th>
                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase opacity-60">Status</th>
                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase opacity-60 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="h-64 text-center py-20 uppercase font-black opacity-10 italic">
                           Logbook Archive / No Records
                        </td>
                      </tr>
                    ) : filtered.map((b, i) => (
                      <motion.tr 
                        key={b.id}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b hover:bg-muted/30 transition-all group cursor-pointer"
                        onClick={() => setSelected(b)}
                      >
                        <td className="px-6 py-5 font-black text-[10px] tracking-widest font-mono">
                           #{b.id?.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                               <Briefcase className="w-3 h-3 text-primary opacity-40" />
                               <span className="font-black text-sm tracking-tighter">{b.serviceType}</span>
                            </div>
                        </td>
                        <td className="px-6 py-5">
                           <span className="font-black text-xs uppercase opacity-70 tracking-tight">{b.dogName || "General"}</span>
                        </td>
                        <td className="px-6 py-5">
                            <div className="space-y-1">
                                <p className="font-bold text-xs">{b.date}</p>
                                <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40">{b.time}</p>
                            </div>
                        </td>
                        <td className="px-6 py-5 font-black text-emerald-600 font-display">
                           ₹{b.platformCommission ?? 0}
                        </td>
                        <td className="px-6 py-5">
                           <Badge variant={
                             b.status === 'pending' ? 'warning' : 
                             b.status === 'confirmed' ? 'success' : 
                             b.status === 'completed' ? 'default' : 
                             b.status === 'rejected' ? 'destructive' : 'secondary'
                           } className="rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em]">
                             {b.status}
                           </Badge>
                        </td>
                        <td className="px-6 py-5 text-right">
                           <Button variant="ghost" size="sm" className="rounded-xl font-black italic scale-95 group-hover:scale-100 transition-all opacity-40 group-hover:opacity-100">
                              Audit
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

      {/* Booking Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => {!o && setSelected(null)}}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-premium bg-background">
           <div className="bg-primary p-12 text-white relative">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Service Reservation</p>
                      <h2 className="text-4xl font-black leading-none drop-shadow-xl font-display uppercase tracking-tighter">
                          #{selected?.id?.slice(-6).toUpperCase()}
                      </h2>
                      <div className="flex items-center gap-2 mt-4">
                         <Badge className="bg-white/20 text-white font-black italic border-none uppercase text-[10px]">
                           {selected?.serviceType}
                         </Badge>
                         <span className="text-[10px] font-bold opacity-60">• {selected?.status}</span>
                      </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-xl border border-white/20 flex flex-col items-center">
                     <span className="text-[10px] font-black uppercase opacity-60 tracking-wider">Total</span>
                     <span className="text-2xl font-black font-display text-white">₹{selected?.amount}</span>
                  </div>
              </div>
           </div>

           <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-3xl bg-muted/30 border border-muted-foreground/10 flex items-center gap-4 group hover:bg-muted transition-colors">
                     <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Calendar className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">Date</p>
                        <p className="font-black mt-1 text-sm">{selected?.date}</p>
                     </div>
                  </div>
                  <div className="p-5 rounded-3xl bg-muted/30 border border-muted-foreground/10 flex items-center gap-4 group hover:bg-muted transition-colors">
                     <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Clock className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">Time Slot</p>
                        <p className="font-black mt-1 text-sm">{selected?.time}</p>
                     </div>
                  </div>
              </div>

              <div className="p-6 rounded-[2rem] bg-muted/20 border-2 border-primary/5 border-dashed">
                  <div className="flex justify-between items-center mb-4 border-b pb-4">
                      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest italic">Fee Breakdown</span>
                      <IndianRupee className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <div className="space-y-3">
                     <div className="flex justify-between text-xs font-bold">
                        <span className="opacity-60 uppercase tracking-tight">Admin Commission (15%)</span>
                        <span className="text-primary">+₹{selected?.platformCommission || 0}</span>
                     </div>
                     <div className="flex justify-between text-xs font-bold">
                        <span className="opacity-60 uppercase tracking-tight">Provider Net Earnings</span>
                        <span>₹{selected?.providerEarning || 0}</span>
                     </div>
                  </div>
              </div>

              {selected?.specialInstructions && (
                 <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] flex items-center gap-2">
                       <AlertCircle className="w-3 h-3 text-amber-500" /> Special Requests
                    </p>
                    <div className="p-5 rounded-2xl bg-muted/50 text-xs font-bold italic text-muted-foreground border">
                       "{selected.specialInstructions}"
                    </div>
                 </div>
              )}

              {['pending', 'confirmed', 'active'].includes(selected?.status || "") && (
                  <Button 
                    variant="destructive" 
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-destructive/20 hover:scale-[1.01] transition-all"
                    onClick={() => selected && handleCancel(selected.id)}
                    disabled={cancelling}
                  >
                     <Ban className="w-4 h-4 mr-2" /> {cancelling ? "Processing Refund..." : "Terminate & Refund Order"}
                  </Button>
              )}
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
