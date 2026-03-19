import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, Eye, CheckCircle, XCircle, 
  Trash2, Briefcase, MapPin, ShieldCheck, 
  ShieldAlert, AlertCircle, Calendar, Star
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

interface Service {
  id: string;
  title?: string;
  price: number;
  city?: string;
  description?: string;
  photos?: string[];
  status: string;
  isFeatured?: boolean;
  category?: string;
  rating?: number;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [filtered, setFiltered] = useState<Service[]>([]);
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { type: 'service' };
      if (tab !== 'all') params.status = tab;
      
      const res = await api.get('/admin/listings', { params });
      setServices(res.data.listings || []);
      setFiltered(res.data.listings || []);
    } catch (e) {
      console.error("Failed to fetch services:", e);
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    if (!search) {
      setFiltered(services);
      return;
    }
    const s = search.toLowerCase();
    setFiltered(services.filter(s_item => 
      s_item.id?.includes(s) || 
      (s_item.title || "").toLowerCase().includes(s) || 
      (s_item.city || "").toLowerCase().includes(s)
    ));
  }, [search, services]);

  const handleStatusChange = async (serviceId: string, status: string, note = "") => {
    if (status === "rejected" && !note.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setActioning(true);
    try {
      await api.patch(`/admin/listings/${serviceId}/status`, { status, adminNote: note });
      toast.success(`Service ${status} successfully`);
      fetchServices();
      setSelected(null);
      setRejectMode(false);
      setReason("");
    } catch (e) {
      toast.error("Failed to update service status");
    } finally {
      setActioning(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!window.confirm("Permanently delete this service?")) return;
    setActioning(true);
    try {
      await api.delete(`/admin/listings/${serviceId}`);
      toast.success("Service deleted permanently");
      fetchServices();
      setSelected(null);
    } catch (e) {
      toast.error("Failed to delete service");
    } finally {
      setActioning(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground font-display">Services Moderation</h1>
          <p className="text-muted-foreground mt-1 font-medium">Verify professional pet services (Grooming, Training, Vet) in the PetSaathi app.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl border-primary/20 bg-primary/5 text-primary">
                Review Providers
            </Button>
        </div>
      </div>

      <Card className="border-none shadow-premium overflow-hidden">
        <CardHeader className="pb-0 pt-6">
          <div className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-muted/20 p-4 rounded-3xl border border-muted-foreground/5 shadow-inner">
            <div className="relative w-full xl:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search service title, city, or ID..." 
                className="pl-10 bg-background border-none shadow-sm rounded-2xl font-bold h-11"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <Tabs value={tab} onValueChange={setTab} className="w-full xl:w-auto">
              <TabsList className="bg-background border p-1 h-auto rounded-2xl shadow-sm">
                {["all", "pending", "active", "sold", "rejected"].map(t => (
                   <TabsTrigger 
                    key={t} 
                    value={t}
                    className="rounded-xl px-4 py-2 text-xs font-black data-[state=active]:bg-primary data-[state=active]:text-white uppercase tracking-widest transition-all"
                  >
                    {t}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent className="p-0 mt-6">
          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto px-6 pb-6">
              <table className="w-full text-left border-collapse space-y-4">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase opacity-70">Service Provider</th>
                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase opacity-70">Location Base</th>
                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase opacity-70">Price / Unit</th>
                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase opacity-70">Safety Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase opacity-70 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="before:block before:h-4 before:content-['']">
                  <AnimatePresence mode="popLayout">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="h-64 text-center py-20 uppercase font-black opacity-10 italic">
                           Queue Empty / Highly Responsive
                        </td>
                      </tr>
                    ) : filtered.map((s_item, i) => (
                      <motion.tr 
                        key={s_item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="border border-muted-foreground/5 mb-4 rounded-3xl hover:bg-muted/40 transition-all group cursor-pointer"
                        onClick={() => setSelected(s_item)}
                      >
                        <td className="px-8 py-6 first:rounded-l-3xl">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-[1.25rem] bg-muted overflow-hidden border-2 border-muted-foreground/5 shadow-premium group-hover:border-primary/30 transition-all duration-500">
                              <img 
                                src={s_item.photos?.[0] || "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=150&h=150"} 
                                alt={s_item.title} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                            </div>
                            <div>
                                <p className="font-black text-sm tracking-tight text-foreground group-hover:text-primary transition-colors">{s_item.title || "Unnamed Service"}</p>
                                <div className="flex items-center gap-1 mt-1">
                                   <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                   <span className="text-[10px] font-black text-muted-foreground">4.8 • {s_item.id.slice(-6)}</span>
                                </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-2 text-muted-foreground">
                               <MapPin className="w-3 h-3" />
                               <span className="font-bold text-xs uppercase tracking-tight">{s_item.city || "Remote"}</span>
                            </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="font-black text-primary text-xl font-display">₹{(s_item.price || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-8 py-6">
                           <Badge variant={
                             s_item.status === 'pending' ? 'warning' : 
                             s_item.status === 'active' ? 'success' : 
                             s_item.status === 'rejected' ? 'destructive' : 'secondary'
                           } className="rounded-xl px-4 py-1 text-[10px] font-black uppercase tracking-widest shadow-inner border-2 border-transparent group-hover:border-white/10">
                             {s_item.status}
                           </Badge>
                        </td>
                        <td className="px-8 py-6 text-right last:rounded-r-3xl">
                           <Button variant="secondary" size="sm" className="rounded-xl font-black italic scale-95 group-hover:scale-100 transition-transform shadow-sm">
                              Audit Logic
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

      {/* Service Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => {!o && setSelected(null); setRejectMode(false);}}>
        <DialogContent className="max-w-xl rounded-[3rem] p-0 overflow-hidden border-none shadow-[0_45px_100px_-12px_rgba(0,0,0,0.35)] bg-background">
           <div className="relative h-72">
              <img 
                src={selected?.photos?.[0] || ""} 
                className="w-full h-full object-cover" 
                alt="Service Hero"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-8 right-8 flex gap-2">
                 <Badge className="bg-white/10 backdrop-blur-3xl text-white border-white/20 uppercase font-black text-[10px] px-3 py-1">
                    {selected?.status}
                 </Badge>
              </div>
              <div className="absolute bottom-10 left-10">
                 <h2 className="text-4xl font-black text-white leading-[0.9] drop-shadow-2xl">{selected?.title}</h2>
                 <p className="text-white/70 font-bold mt-2 uppercase tracking-widest text-[10px] flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-primary" /> {selected?.city} Base Operations
                 </p>
              </div>
           </div>

           <div className="p-10 space-y-10">
              <div className="flex items-center justify-between bg-muted/30 p-6 rounded-[2rem] border border-muted-foreground/10 shadow-inner">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Standard Rate</p>
                    <p className="text-3xl font-black text-primary font-display leading-none mt-1">₹{(selected?.price || 0).toLocaleString()}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Trust Score</p>
                    <div className="flex items-center gap-1 mt-2 text-yellow-600 font-black text-xl">
                       <Star className="w-5 h-5 fill-yellow-600" /> 4.9
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-primary" /> Service Specifications
                 </p>
                 <div className="text-sm leading-relaxed font-bold text-muted-foreground bg-primary/5 p-6 rounded-[2rem] border-2 border-primary/10 italic">
                    "{selected?.description || "Detailed specifications not provided."}"
                 </div>
              </div>

              {rejectMode ? (
                <div className="space-y-5 animate-in slide-in-from-bottom-8 duration-500">
                   <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-center font-black uppercase text-xs">
                      Issuing Rejection Notice
                   </div>
                   <textarea 
                     className="w-full min-h-[120px] bg-muted/50 rounded-[1.5rem] p-5 text-sm font-black border-2 border-destructive/10 focus:border-destructive outline-none transition-all"
                     placeholder="State the reason for non-compliance..."
                     value={reason}
                     onChange={e => setReason(e.target.value)}
                   />
                   <div className="flex gap-4">
                      <Button 
                        disabled={actioning}
                        onClick={() => selected && handleStatusChange(selected.id, 'rejected', reason)}
                        className="flex-1 rounded-[1.25rem] bg-destructive hover:bg-destructive/90 text-white font-black h-14 shadow-xl shadow-destructive/20"
                      >
                         Confirm Suspend
                      </Button>
                      <Button variant="outline" onClick={() => setRejectMode(false)} className="rounded-[1.25rem] font-black h-14">Abort</Button>
                   </div>
                </div>
              ) : (
                <div className="flex gap-4 pt-6">
                  {selected?.status === 'pending' ? (
                    <>
                      <Button 
                        onClick={() => selected && handleStatusChange(selected.id, 'active')}
                        disabled={actioning}
                        className="flex-1 h-14 rounded-[1.5rem] bg-primary text-white font-black shadow-2xl shadow-primary/30 active:scale-95 transition-all text-base uppercase tracking-widest"
                      >
                        <ShieldCheck className="w-5 h-5 mr-3" /> Approve Provider
                      </Button>
                      <Button 
                        onClick={() => setRejectMode(true)}
                        disabled={actioning}
                        variant="destructive"
                        className="w-20 h-14 rounded-[1.5rem] flex items-center justify-center shadow-lg"
                      >
                        <ShieldAlert className="w-6 h-6" />
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={() => selected && handleDelete(selected.id)}
                      variant="ghost" 
                      className="w-full h-14 rounded-[1.5rem] font-black text-destructive bg-destructive/5 hover:bg-destructive/10 tracking-widest uppercase text-xs"
                    >
                      <Trash2 className="w-4 h-4 mr-3" /> Delete Registration Permanent
                    </Button>
                  )}
                </div>
              )}
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
