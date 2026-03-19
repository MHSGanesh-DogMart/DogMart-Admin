import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Pencil, Trash2, X, Scissors, 
  Loader2, BadgePercent, LayoutGrid, Zap,
  Info, ArrowDownWideNarrow, Image as ImageIcon, ShieldCheck
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
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface ServiceCategory {
  id: string;
  name: string;
  emoji: string;
  description: string;
  commissionPercent: number;
  order: number;
  isActive: boolean;
}

export default function ServiceCategories() {
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<ServiceCategory | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Partial<ServiceCategory>>({
    name: '',
    emoji: '✂️',
    description: '',
    commissionPercent: 15,
    order: 0,
    isActive: true
  });

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/service-categories');
      setServices(res.data.categories || []);
    } catch (e) {
      console.error("Failed to fetch services:", e);
      toast.error("Failed to load service categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleOpenForm = (svc: ServiceCategory | null) => {
    setSelected(svc);
    setForm(svc || {
      name: '',
      emoji: '✂️',
      description: '',
      commissionPercent: 15,
      order: 0,
      isActive: true
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name?.trim()) return;
    setSaving(true);
    try {
      if (selected?.id) {
        await api.put(`/service-categories/${selected.id}`, form);
        toast.success("Service updated");
      } else {
        await api.post('/service-categories', form);
        toast.success("New service category established");
      }
      fetchServices();
      setShowForm(false);
    } catch (e) {
      toast.error("Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground font-display uppercase">Professional Tracks</h1>
          <p className="text-muted-foreground mt-1 font-medium font-sans">Configure platform commissions and service definitions. 🧖‍♂️</p>
        </div>
        <Button 
          onClick={() => handleOpenForm(null)}
          className="rounded-2xl font-black bg-primary text-white shadow-xl shadow-primary/20 h-12 px-6"
        >
          <Plus className="w-5 h-5 mr-2" /> New Offering
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {loading ? (
             Array(2).fill(0).map((_, i) => (
                <div key={i} className="h-48 rounded-[2.5rem] bg-muted animate-pulse border-none shadow-premium" />
             ))
          ) : services.length === 0 ? (
             <div className="col-span-full h-64 flex flex-col items-center justify-center opacity-20 uppercase font-black italic">
                <Scissors className="w-12 h-12 mb-4" />
                No Pro Services Defined
             </div>
          ) : services.map((svc, i) => (
            <motion.div
              key={svc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`group flex items-start gap-6 rounded-[2.5rem] p-8 transition-all duration-500 hover:shadow-2xl overflow-hidden cursor-pointer
                ${svc.isActive ? 'bg-background hover:-translate-y-1' : 'bg-muted/50 grayscale opacity-60'}`}
              style={{ border: `2px solid ${svc.isActive ? 'rgba(var(--primary), 0.05)' : 'transparent'}` }}
              onClick={() => handleOpenForm(svc)}
            >
               <div className="w-20 h-20 rounded-3xl bg-primary/10 flex-shrink-0 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                  {svc.emoji}
               </div>

               <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                     <div>
                        <h3 className="text-xl font-black font-display tracking-tight text-foreground lowercase first-letter:uppercase">{svc.name}</h3>
                        <p className="text-muted-foreground text-xs font-bold line-clamp-2 mt-1 opacity-70 italic">"{svc.description || 'No description provided.'}"</p>
                     </div>
                     <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[10px] rounded-lg">
                        {svc.commissionPercent}% FEE
                     </Badge>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between">
                     <div className="flex gap-2">
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter opacity-50 px-2 h-5">ORDER: {svc.order}</Badge>
                        <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-tighter px-2 h-5">{svc.isActive ? "Live" : "Internal"}</Badge>
                     </div>
                     <Button variant="ghost" className="w-8 h-8 rounded-xl p-0 opacity-20 group-hover:opacity-100 transition-all bg-muted hover:bg-primary hover:text-white">
                        <Pencil className="w-3 h-3" />
                     </Button>
                  </div>
               </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Service Editor Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-premium bg-background">
           <div className="bg-primary p-12 text-white relative flex flex-col items-center">
              <div className="text-5xl mb-4 drop-shadow-px">{form.emoji}</div>
              <h2 className="text-3xl font-black font-display tracking-tighter uppercase leading-none">Service Schema</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mt-3 italic">Professional Configuration</p>
           </div>

           <div className="p-10 space-y-8">
              <div className="space-y-6">
                 <div className="space-y-2 px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 flex items-center gap-2">
                       <Zap className="w-3 h-3 text-primary" /> Service Title
                    </label>
                    <Input 
                      placeholder="e.g. Therapeutic Grooming" 
                      className="rounded-2xl h-14 bg-muted border-none font-bold text-lg px-6 shadow-inner"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                 </div>

                 <div className="space-y-2 px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 flex items-center gap-2">
                       <Info className="w-3 h-3" /> Marketplace Summary
                    </label>
                    <Textarea 
                      placeholder="Detail the service scope for end-users..." 
                      className="rounded-2xl bg-muted border-none font-bold text-sm px-6 py-4 shadow-inner resize-none h-24"
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    />
                 </div>

                 <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2 px-1">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 flex items-center gap-2">
                          <ImageIcon className="w-3 h-3" /> Icon
                       </label>
                       <Input className="rounded-2xl h-12 bg-muted border-none font-bold text-center" value={form.emoji || ''} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} />
                    </div>
                    <div className="space-y-2 px-1">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 flex items-center gap-2">
                          <BadgePercent className="w-3 h-3 text-emerald-500" /> Fee %
                       </label>
                       <Input type="number" className="rounded-2xl h-12 bg-muted border-none font-black text-center text-emerald-600" value={form.commissionPercent || 0} onChange={e => setForm(f => ({ ...f, commissionPercent: Number(e.target.value) }))} />
                    </div>
                    <div className="space-y-2 px-1">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 flex items-center gap-2">
                          <ArrowDownWideNarrow className="w-3 h-3" /> Order
                       </label>
                       <Input type="number" className="rounded-2xl h-12 bg-muted border-none font-black text-center" value={form.order || 0} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} />
                    </div>
                 </div>
              </div>

              <div className="flex items-center justify-between p-6 rounded-[2rem] bg-primary/5 border border-primary/10">
                 <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <div>
                       <p className="font-black text-sm tracking-tight leading-none italic uppercase">Deployment Status</p>
                       <p className="text-[10px] font-bold text-muted-foreground mt-1 underline decoration-primary/20">Set visibility across App endpoints</p>
                    </div>
                 </div>
                 <button 
                  className={`w-14 h-7 rounded-full relative transition-all ${form.isActive ? 'bg-primary shadow-xl shadow-primary/20' : 'bg-muted'}`}
                  onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                 >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${form.isActive ? 'left-8' : 'left-1'}`} />
                 </button>
              </div>
           </div>

           <DialogFooter className="p-10 pt-0 flex gap-4">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 h-16 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-sm">Abort</Button>
              <Button onClick={handleSave} className="flex-1 h-16 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all" disabled={saving}>
                 {saving ? "Deploying..." : "Sync Taxonomy"}
              </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
