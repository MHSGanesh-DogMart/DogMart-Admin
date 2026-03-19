import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, Eye, CheckCircle, XCircle, 
  Trash2, ExternalLink, Dog, Tag, ShieldCheck, 
  ShieldAlert, MoreHorizontal, AlertCircle
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

interface Listing {
  id: string;
  breed?: string;
  age?: string;
  gender?: string;
  price: number;
  city?: string;
  status: string;
  description?: string;
  photos?: string[];
  isFeatured?: boolean;
  adminNote?: string;
}

export default function Listings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filtered, setFiltered] = useState<Listing[]>([]);
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { type: 'sale' };
      if (tab !== 'all') params.status = tab;
      
      const res = await api.get('/admin/listings', { params });
      setListings(res.data.listings || []);
      setFiltered(res.data.listings || []);
    } catch (e) {
      console.error("Failed to fetch listings:", e);
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    if (!search) {
      setFiltered(listings);
      return;
    }
    const s = search.toLowerCase();
    setFiltered(listings.filter(l => 
      l.id?.includes(s) || 
      (l.breed || "").toLowerCase().includes(s) || 
      (l.city || "").toLowerCase().includes(s)
    ));
  }, [search, listings]);

  const handleStatusChange = async (listingId: string, status: string, note = "") => {
    if (status === "rejected" && !note.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setActioning(true);
    try {
      await api.patch(`/admin/listings/${listingId}/status`, { status, adminNote: note });
      toast.success(`Listing ${status} successfully`);
      fetchListings();
      setSelected(null);
      setRejectMode(false);
      setReason("");
    } catch (e) {
      toast.error("Failed to update listing status");
    } finally {
      setActioning(false);
    }
  };

  const handleDelete = async (listingId: string) => {
    if (!window.confirm("Permanently delete this listing?")) return;
    setActioning(true);
    try {
      await api.delete(`/admin/listings/${listingId}`);
      toast.success("Listing deleted permanently");
      fetchListings();
      setSelected(null);
    } catch (e) {
      toast.error("Failed to delete listing");
    } finally {
      setActioning(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Moderation Queue</h1>
          <p className="text-muted-foreground mt-1">Review and verify pet listings before they appear in the app.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl font-bold">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-soft overflow-hidden">
        <CardHeader className="pb-0 pt-6">
          <div className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-muted/30 p-4 rounded-2xl border">
            <div className="relative w-full xl:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search breed, city, or Listing ID..." 
                className="pl-10 bg-background border-none shadow-sm rounded-xl"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <Tabs value={tab} onValueChange={setTab} className="w-full xl:w-auto">
              <TabsList className="bg-background border p-1 h-auto rounded-xl">
                {["all", "pending", "active", "sold", "rejected"].map(t => (
                  <TabsTrigger 
                    key={t} 
                    value={t}
                    className="rounded-lg px-4 py-1.5 text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground uppercase tracking-tight"
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
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/10">
                    <th className="px-8 py-4 text-xs font-extrabold text-muted-foreground tracking-wider uppercase">Pet Info</th>
                    <th className="px-8 py-4 text-xs font-extrabold text-muted-foreground tracking-wider uppercase">Location</th>
                    <th className="px-8 py-4 text-xs font-extrabold text-muted-foreground tracking-wider uppercase">Price</th>
                    <th className="px-8 py-4 text-xs font-extrabold text-muted-foreground tracking-wider uppercase">Status</th>
                    <th className="px-8 py-4 text-xs font-extrabold text-muted-foreground tracking-wider uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="h-64 text-center py-20 uppercase font-black opacity-20 text-muted-foreground italic">
                           No Moderation Requests Found
                        </td>
                      </tr>
                    ) : filtered.map((l, i) => (
                      <motion.tr 
                        key={l.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="border-b hover:bg-muted/30 transition-all group cursor-pointer"
                        onClick={() => setSelected(l)}
                      >
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden border shadow-sm group-hover:shadow-md transition-shadow">
                              <img 
                                src={l.photos?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=150&h=150"} 
                                alt={l.breed} 
                                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                              />
                            </div>
                            <div>
                                <p className="font-bold text-sm tracking-tight">{l.breed || "Mixed Breed"}</p>
                                <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60 tracking-widest">{l.id.slice(-8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4 font-semibold text-sm">{l.city}</td>
                        <td className="px-8 py-4">
                           <span className="font-black text-primary font-display">{l.price === 0 ? "FREE" : `₹${(l.price || 0).toLocaleString()}`}</span>
                        </td>
                        <td className="px-8 py-4">
                           <Badge variant={
                             l.status === 'pending' ? 'warning' : 
                             l.status === 'active' ? 'success' : 
                             l.status === 'rejected' ? 'destructive' : 'secondary'
                           } className="rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                             {l.status}
                           </Badge>
                        </td>
                        <td className="px-8 py-4 text-right">
                           <Button variant="ghost" size="sm" className="rounded-xl hover:bg-primary hover:text-white transition-all">
                              Review Item
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

      {/* Moderation Details Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => {!o && setSelected(null); setRejectMode(false);}}>
        <DialogContent className="max-w-xl rounded-[2rem] p-0 overflow-hidden border-none shadow-3xl bg-background outline-none">
           <div className="relative h-64">
              <img 
                src={selected?.photos?.[0] || ""} 
                className="w-full h-full object-cover" 
                alt="Selected listing"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-8 text-white">
                 <h2 className="text-3xl font-black">{selected?.breed}</h2>
                 <p className="opacity-80 font-bold tracking-tight">{selected?.city} • {selected?.age} Old</p>
              </div>
              <Badge className="absolute top-6 right-8 bg-white/20 backdrop-blur-md text-white border-white/20 uppercase font-black">
                 {selected?.status}
              </Badge>
           </div>

           <div className="p-8 space-y-6">
              <div className="grid grid-cols-3 gap-3">
                 {[
                   { label: "Price", val: selected?.price === 0 ? "FREE" : `₹${(selected?.price || 0).toLocaleString()}` },
                   { label: "Gender", val: selected?.gender },
                   { label: "Owner ID", val: selected?.id.slice(-6) }
                 ].map(i => (
                   <div key={i.label} className="bg-muted/50 p-3 rounded-2xl border text-center">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">{i.label}</p>
                      <p className="font-black text-sm text-primary">{i.val}</p>
                   </div>
                 ))}
              </div>

              <div>
                 <p className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-2 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-primary" /> Listing Description
                 </p>
                 <p className="text-sm leading-relaxed font-medium bg-muted/20 p-4 rounded-2xl border">
                    {selected?.description || "No description provided for this listing."}
                 </p>
              </div>

              {rejectMode ? (
                <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                   <p className="text-sm font-bold text-destructive">Enter the reason for rejection (this will be sent to the owner):</p>
                   <textarea 
                     className="w-full min-h-[100px] bg-muted/50 rounded-2xl p-4 text-sm font-bold border-2 border-destructive/20 focus:border-destructive outline-none transition-all"
                     placeholder="e.g., Photos are blurry, price is unrealistic..."
                     value={reason}
                     onChange={e => setReason(e.target.value)}
                   />
                   <div className="flex gap-3">
                      <Button 
                        disabled={actioning}
                        onClick={() => selected && handleStatusChange(selected.id, 'rejected', reason)}
                        className="flex-1 rounded-[1.25rem] bg-destructive hover:bg-destructive/90 text-white font-black"
                      >
                         Confirm Rejection
                      </Button>
                      <Button variant="outline" onClick={() => setRejectMode(false)} className="rounded-[1.25rem] font-black">Cancel</Button>
                   </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3 pt-4">
                  {selected?.status === 'pending' && (
                    <>
                      <Button 
                        onClick={() => selected && handleStatusChange(selected.id, 'active')}
                        disabled={actioning}
                        className="flex-1 h-12 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/20"
                      >
                        <ShieldCheck className="w-5 h-5 mr-2" /> Approve Listing
                      </Button>
                      <Button 
                        onClick={() => setRejectMode(true)}
                        disabled={actioning}
                        variant="destructive"
                        className="flex-1 h-12 rounded-2xl font-black shadow-lg"
                      >
                        <ShieldAlert className="w-5 h-5 mr-2" /> Reject
                      </Button>
                    </>
                  )}
                  <Button 
                    onClick={() => selected && handleDelete(selected.id)}
                    variant="ghost" 
                    className="w-full h-12 rounded-2xl font-bold bg-muted/50 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-5 h-5 mr-2" /> Permanently Delete
                  </Button>
                </div>
              )}
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
