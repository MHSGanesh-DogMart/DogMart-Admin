import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Pencil, Trash2, X, Tag, 
  Search, Filter, IndianRupee,
  Activity, Scale, Eye, EyeOff
} from "lucide-react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface Breed {
  id: string;
  name: string;
  size: string;
  categoryId: string;
  avgPriceMin: number;
  avgPriceMax: number;
  temperament: string;
  isActive: boolean;
}

export default function Breeds() {
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Breed | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Partial<Breed>>({
    name: '',
    size: 'Medium',
    categoryId: '',
    avgPriceMin: 0,
    avgPriceMax: 0,
    temperament: '',
    isActive: true
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [breedsRes, catsRes] = await Promise.all([
        api.get('/breeds'),
        api.get('/categories')
      ]);
      setBreeds(breedsRes.data.breeds || []);
      setCategories(catsRes.data.categories || []);
      if (!form.categoryId && catsRes.data.categories?.[0]) {
         setForm(f => ({ ...f, categoryId: catsRes.data.categories[0].id }));
      }
    } catch (e) {
      console.error(e);
      toast.error("Critical failure during data retrieval");
    } finally {
      setLoading(false);
    }
  }, [form.categoryId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenForm = (breed: Breed | null) => {
    setSelected(breed);
    setForm(breed || {
      name: '',
      size: 'Medium',
      categoryId: categories[0]?.id || '',
      avgPriceMin: 0,
      avgPriceMax: 0,
      temperament: '',
      isActive: true
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name?.trim()) return;
    setSaving(true);
    try {
      if (selected?.id) {
        await api.put(`/breeds/${selected.id}`, form);
        toast.success("Genetic record updated");
      } else {
        await api.post('/breeds', form);
        toast.success("New breed registered");
      }
      fetchData();
      setShowForm(false);
    } catch (e) {
      toast.error("Failed to sync breed record");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently archive this breed?")) return;
    try {
      await api.delete(`/breeds/${id}`);
      setBreeds(prev => prev.filter(b => b.id !== id));
      toast.success("Record expunged");
    } catch (e) {
      toast.error("Action denied");
    }
  };

  const filtered = breeds.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) && 
    (filterCat === 'all' || b.categoryId === filterCat)
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground font-display uppercase">Genetic Index</h1>
          <p className="text-muted-foreground mt-1 font-medium italic">Configure breed benchmarks and pricing volatility. 🧬</p>
        </div>
        <Button 
          onClick={() => handleOpenForm(null)}
          className="rounded-2xl font-black bg-primary text-white shadow-xl shadow-primary/20 h-12 px-6"
        >
          <Plus className="w-5 h-5 mr-2" /> Register Breed
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-muted/10 p-4 rounded-3xl border border-muted-foreground/5 shadow-inner">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
               placeholder="Search Master List..." 
               className="pl-10 h-11 bg-background border-none shadow-sm rounded-2xl font-bold italic"
               value={search}
               onChange={e => setSearch(e.target.value)}
            />
         </div>
         <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-full md:w-56 h-11 rounded-2xl bg-background border-none shadow-sm font-black uppercase text-[10px] tracking-widest px-6 italic">
               <SelectValue placeholder="All Species" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-premium border-none p-2">
               <SelectItem value="all">ALL SPECIES</SelectItem>
               {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
               ))}
            </SelectContent>
         </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
           {loading ? (
              Array(3).fill(0).map((_, i) => <div key={i} className="h-64 rounded-[2.5rem] bg-muted animate-pulse border-none shadow-premium" />)
           ) : filtered.length === 0 ? (
              <div className="col-span-full h-64 flex flex-col items-center justify-center opacity-20 uppercase font-black italic">
                 <Tag className="w-12 h-12 mb-4" /> Index Silent / No Matches
              </div>
           ) : filtered.map((b, i) => (
             <motion.div
               key={b.id}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.03 }}
               className={`group rounded-[2.5rem] p-8 transition-all duration-500 overflow-hidden relative
                 ${b.isActive ? 'bg-background hover:shadow-2xl border-2 border-primary/5' : 'bg-muted/50 grayscale opacity-40 shadow-inner'}`}
               onClick={() => handleOpenForm(b)}
             >
                <div className="flex justify-between items-start mb-6">
                   <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                      <Tag className="w-6 h-6" />
                   </div>
                   <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="rounded-xl w-9 h-9 p-0 bg-muted hover:bg-primary hover:text-white" onClick={(e) => { e.stopPropagation(); handleOpenForm(b); }}>
                         <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-xl w-9 h-9 p-0 bg-muted hover:bg-destructive hover:text-white" onClick={(e) => { e.stopPropagation(); handleDelete(b.id); }}>
                         <Trash2 className="w-4 h-4" />
                      </Button>
                   </div>
                </div>

                <div className="space-y-4">
                   <div>
                      <h3 className="text-xl font-black font-display tracking-tight text-foreground uppercase">{b.name}</h3>
                      <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">{categories.find(c => c.id === b.categoryId)?.name || 'Hybrid'}</p>
                   </div>

                   <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                         <Scale className="w-3.5 h-3.5 text-muted-foreground opacity-40" />
                         <span className="text-[10px] font-black uppercase opacity-60">{b.size} SIZE</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <Activity className="w-3.5 h-3.5 text-emerald-500/60" />
                         <span className="text-[10px] font-black uppercase opacity-60 italic">{b.temperament || 'Unknown Temp.'}</span>
                      </div>
                   </div>

                   <div className="pt-4 border-t border-muted/50 flex justify-between items-end">
                      <div>
                         <p className="text-[9px] font-black uppercase opacity-30 italic">Market Benchmark</p>
                         <p className="text-lg font-black font-display text-emerald-600 leading-none mt-1">₹{(b.avgPriceMin || 0).toLocaleString()}—₹{(b.avgPriceMax || 0).toLocaleString()}</p>
                      </div>
                      {b.isActive ? <Eye className="w-4 h-4 opacity-20" /> : <EyeOff className="w-4 h-4 opacity-20" />}
                   </div>
                </div>
             </motion.div>
           ))}
        </AnimatePresence>
      </div>

      {/* Breed Schema Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl rounded-[3rem] p-0 overflow-hidden border-none shadow-premium bg-background">
           <div className="bg-primary/5 p-12 border-b border-primary/10 flex items-center justify-between">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 italic">Genetic Standards</p>
                 <h2 className="text-4xl font-black font-display tracking-tighter uppercase">{selected ? "Update Breed" : "New Breed Schema"}</h2>
              </div>
              <div className="w-20 h-20 rounded-[2rem] bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/30">
                 <Tag className="w-10 h-10" />
              </div>
           </div>

           <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2 col-span-full">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Canonical Name</label>
                 <Input 
                   className="rounded-2xl h-14 bg-muted border-none font-bold text-lg px-6 shadow-inner italic"
                   value={form.name}
                   onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Phylogenic Tree</label>
                 <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
                    <SelectTrigger className="h-12 rounded-2xl bg-muted border-none font-black uppercase text-[11px] tracking-tight px-6 italic">
                       <SelectValue placeholder="Select Species" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-premium font-black uppercase text-xs p-2">
                       {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                 </Select>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Stature Category</label>
                 <Select value={form.size} onValueChange={v => setForm(f => ({ ...f, size: v }))}>
                    <SelectTrigger className="h-12 rounded-2xl bg-muted border-none font-black uppercase text-[11px] px-6 italic">
                       <SelectValue placeholder="Select Size" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-premium font-black uppercase text-xs p-2">
                       {['Small', 'Medium', 'Large', 'Giant'].map(s => <SelectItem key={s} value={s}>{s} SCALE</SelectItem>)}
                    </SelectContent>
                 </Select>
              </div>

              <div className="grid grid-cols-2 gap-4 col-span-full">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Floor Price (₹)</label>
                    <div className="relative">
                       <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                        <Input type="number" className="pl-10 rounded-2xl h-14 bg-muted border-none font-black text-xl text-emerald-600 shadow-inner" value={form.avgPriceMin || 0} onChange={e => setForm(f => ({ ...f, avgPriceMin: Number(e.target.value) }))} />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Ceiling Price (₹)</label>
                    <div className="relative">
                       <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                       <Input type="number" className="pl-10 rounded-2xl h-14 bg-muted border-none font-black text-xl text-emerald-600 shadow-inner" value={form.avgPriceMax || 0} onChange={e => setForm(f => ({ ...f, avgPriceMax: Number(e.target.value) }))} />
                    </div>
                 </div>
              </div>

              <div className="space-y-2 col-span-full">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Behavioral Blueprint</label>
                 <Textarea 
                   className="rounded-2xl bg-muted border-none font-bold text-sm px-6 py-4 shadow-inner resize-none h-24 italic"
                   placeholder="Friendly, Alert, Loyal..."
                   value={form.temperament}
                   onChange={e => setForm(f => ({ ...f, temperament: e.target.value }))}
                 />
              </div>
           </div>

           <DialogFooter className="p-12 pt-0 flex gap-4">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 h-16 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] italic">Abort</Button>
              <Button onClick={handleSave} className="flex-1 h-16 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all" disabled={saving}>
                 {saving ? "Deploying Schema..." : "Commit Expansion"}
              </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
