import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Pencil, Trash2, X, MapPin, 
  Search, Filter, Map, Globe,
  CheckCircle2, AlertCircle, Zap, Loader2
} from "lucide-react";
import { db } from "@/firebase/config";
import { 
  collection, getDocs, addDoc, updateDoc, 
  deleteDoc, doc, orderBy, query, serverTimestamp 
} from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Location {
  id: string;
  city: string;
  area: string;
  pincode?: string;
  isActive: boolean;
}

export default function Locations() {
  const [locs, setLocs] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Location | null>(null);
  const [filterCity, setFilterCity] = useState("all");
  const [saving, setSaving] = useState(false);

  // Form State
  const [form, setForm] = useState<Partial<Location>>({
    city: '',
    area: '',
    pincode: '',
    isActive: true
  });

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'locations'), orderBy('city', 'asc'), orderBy('area', 'asc'));
      const snap = await getDocs(q);
      setLocs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Location)));
    } catch (e) {
      console.error("Failed to fetch locations:", e);
      toast.error("Geolocation sync failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleOpenForm = (loc: Location | null) => {
    setSelected(loc);
    setForm(loc || { city: '', area: '', pincode: '', isActive: true });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.city?.trim() || !form.area?.trim()) return;
    setSaving(true);
    try {
      const data = {
        city: form.city.trim(),
        area: form.area.trim(),
        pincode: form.pincode?.trim() || null,
        isActive: form.isActive,
        updatedAt: serverTimestamp()
      };

      if (selected?.id) {
        await updateDoc(doc(db, 'locations', selected.id), data);
        toast.success("Region boundary updated");
      } else {
        await addDoc(collection(db, 'locations'), { ...data, createdAt: serverTimestamp() });
        toast.success("New operational zone established");
      }
      fetchLocations();
      setShowForm(false);
    } catch (e) {
      toast.error("Failed to save location data");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Decommission this sector? This may affect listings mapping.")) return;
    try {
      await deleteDoc(doc(db, 'locations', id));
      setLocs(prev => prev.filter(l => l.id !== id));
      toast.success("Sector removed from active map");
    } catch (e) {
      toast.error("Decommissioning failed");
    }
  };

  const uniqueCities = Array.from(new Set(locs.map(l => l.city))).filter(Boolean);
  const filtered = filterCity === 'all' ? locs : locs.filter(l => l.city === filterCity);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground font-display uppercase">Operational Zones</h1>
          <p className="text-muted-foreground mt-1 font-medium italic">Define serviced regions and geographic constraints. 🗺️</p>
        </div>
        <Button 
          onClick={() => handleOpenForm(null)}
          className="rounded-2xl font-black bg-primary text-white shadow-xl shadow-primary/20 h-12 px-6"
        >
          <Plus className="w-5 h-5 mr-2" /> Expand Sector
        </Button>
      </div>

      <Card className="border-none shadow-premium overflow-hidden">
        <CardHeader className="pb-0 pt-6">
           <div className="flex flex-col xl:flex-row gap-6 justify-between items-center bg-muted/20 p-4 rounded-3xl border border-muted-foreground/5 shadow-inner">
              <div className="flex items-center gap-3 px-4">
                 <Globe className="w-5 h-5 text-primary opacity-60" />
                 <span className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Regional Filter</span>
              </div>
              <Tabs value={filterCity} onValueChange={setFilterCity} className="w-full xl:w-auto overflow-x-auto pb-1 scrollbar-hide">
                <TabsList className="bg-transparent h-auto p-0 flex gap-2">
                   <TabsTrigger value="all" className="rounded-xl px-6 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                      All Territories
                   </TabsTrigger>
                   {uniqueCities.map(c => (
                      <TabsTrigger key={c} value={c} className="rounded-xl px-6 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                         {c}
                      </TabsTrigger>
                   ))}
                </TabsList>
              </Tabs>
           </div>
        </CardHeader>
        
        <CardContent className="p-0 mt-6 px-6 pb-6">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b bg-muted/30 tracking-[0.2em] text-[10px] font-black uppercase text-muted-foreground opacity-60">
                       <th className="px-8 py-5">Metro City</th>
                       <th className="px-8 py-5">Locality / Sector</th>
                       <th className="px-8 py-5">Postal Code</th>
                       <th className="px-8 py-5">Integrity</th>
                       <th className="px-8 py-5 text-right">Moderation</th>
                    </tr>
                 </thead>
                 <tbody>
                    <AnimatePresence mode="popLayout">
                       {loading ? (
                          <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary opacity-20" /></td></tr>
                       ) : filtered.length === 0 ? (
                          <tr><td colSpan={5} className="py-20 text-center opacity-10 uppercase font-black italic">Unmapped Territory</td></tr>
                       ) : filtered.map((loc, i) => (
                          <motion.tr 
                            key={loc.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.02 }}
                            className="border-b hover:bg-muted/40 transition-all group"
                          >
                             <td className="px-8 py-6">
                                <span className="font-black text-sm tracking-tight text-foreground uppercase">{loc.city}</span>
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                   <MapPin className="w-3.5 h-3.5 text-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                                   <span className="font-bold text-xs italic opacity-80">{loc.area}</span>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <span className="font-mono text-[10px] font-black opacity-30 tracking-widest">{loc.pincode || '—'}</span>
                             </td>
                             <td className="px-8 py-6">
                                <Badge variant={loc.isActive ? "success" : "secondary"} className="rounded-xl px-3 h-5 text-[8px] font-black uppercase">
                                   {loc.isActive ? "Sectors Open" : "Geofenced"}
                                </Badge>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <div className="flex justify-end gap-2">
                                   <Button variant="ghost" className="w-9 h-9 p-0 rounded-xl bg-muted/50 hover:bg-primary hover:text-white" onClick={() => handleOpenForm(loc)}>
                                      <Pencil className="w-3.5 h-3.5" />
                                   </Button>
                                   <Button variant="ghost" className="w-9 h-9 p-0 rounded-xl bg-muted/50 hover:bg-destructive hover:text-white" onClick={() => handleDelete(loc.id)}>
                                      <Trash2 className="w-3.5 h-3.5" />
                                   </Button>
                                </div>
                             </td>
                          </motion.tr>
                       ))}
                    </AnimatePresence>
                 </tbody>
              </table>
           </div>
        </CardContent>
      </Card>

      {/* Location Schema Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md rounded-[3rem] p-0 overflow-hidden border-none shadow-premium bg-background">
           <div className="bg-primary p-12 text-white flex flex-col items-center">
              <Map className="w-16 h-16 mb-4 drop-shadow-xl animate-pulse" />
              <h2 className="text-3xl font-black font-display tracking-tighter uppercase leading-none">Sector Calibration</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mt-4 italic">Geographic Integrity</p>
           </div>

           <div className="p-10 space-y-8">
              <div className="space-y-6">
                 <div className="space-y-2 px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 flex items-center gap-2 italic">
                       Meta City Area
                    </label>
                    <Input 
                      placeholder="e.g. Hyderabad" 
                      className="rounded-2xl h-14 bg-muted border-none font-black text-lg px-6 shadow-inner italic uppercase"
                      value={form.city || ''}
                      onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    />
                 </div>

                 <div className="space-y-2 px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 flex items-center gap-2 italic">
                       Localized Locality
                    </label>
                    <Input 
                      placeholder="e.g. Jubilee Hills" 
                      className="rounded-2xl h-14 bg-muted border-none font-bold text-sm px-6 shadow-inner"
                      value={form.area || ''}
                      onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                    />
                 </div>

                 <div className="space-y-2 px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 flex items-center gap-2 italic">
                       Postal Identification (N/A OK)
                    </label>
                    <Input 
                      placeholder="e.g. 500033" 
                      className="rounded-2xl h-12 bg-muted border-none font-mono font-black px-6 shadow-inner"
                      value={form.pincode || ''}
                      onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))}
                    />
                 </div>
              </div>

              <div className="flex items-center justify-between p-6 rounded-[2rem] bg-primary/5 border border-primary/10">
                 <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-primary" />
                    <div>
                       <p className="font-black text-sm tracking-tight leading-none italic uppercase">Operation Enabled</p>
                       <p className="text-[10px] font-bold text-muted-foreground mt-1 underline decoration-primary/20 italic">Users see this in select menus</p>
                    </div>
                 </div>
                 <button 
                  className={`w-14 h-7 rounded-full relative transition-all ${form.isActive ? 'bg-primary shadow-xl shadow-primary/20' : 'bg-muted'}`}
                  onClick={() => setForm(f => ({ ...f, isActive: !form.isActive }))}
                 >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${form.isActive ? 'left-8' : 'left-1'}`} />
                 </button>
              </div>
           </div>

           <DialogFooter className="p-10 pt-0 flex gap-4">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 h-16 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] italic">Abort</Button>
              <Button onClick={handleSave} className="flex-1 h-16 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all" disabled={saving}>
                 {saving ? "Calibrating..." : "Apply Bounds"}
              </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
