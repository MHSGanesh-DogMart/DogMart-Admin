import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Pencil, Trash2, X, UploadCloud, 
  Search, Image as ImageIcon, Loader2,
  ExternalLink, Zap, Eye, EyeOff,
  Sparkles, Megaphone
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

interface Banner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  tag: string;
  isActive: boolean;
}

export default function Banners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Banner | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [form, setForm] = useState<Partial<Banner>>({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    tag: '',
    isActive: true
  });

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/banners/all');
      setBanners(res.data.banners || []);
    } catch (e) {
      console.error("Failed to fetch banners", e);
      toast.error("Failed to load active campaigns");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleOpenForm = (banner: Banner | null) => {
    setSelected(banner);
    setForm(banner || {
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      tag: '',
      isActive: true
    });
    setShowForm(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/banners/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.url) {
        setForm(f => ({ ...f, imageUrl: res.data.url }));
        toast.success("Visual asset uploaded");
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.imageUrl) {
        toast.error("Campaign visual is required");
        return;
    }
    setSaving(true);
    try {
      if (selected?.id) {
        await api.put(`/banners/${selected.id}`, form);
        toast.success("Campaign updated");
      } else {
        await api.post('/banners', form);
        toast.success("New campaign launched");
      }
      fetchBanners();
      setShowForm(false);
    } catch (e) {
      toast.error("Failed to sync campaign");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently archive this campaign?")) return;
    try {
      await api.delete(`/banners/${id}`);
      setBanners(prev => prev.filter(b => b.id !== id));
      toast.success("Campaign terminated");
    } catch (e) {
      toast.error("Termination failed");
    }
  };

  const filtered = banners.filter(b => 
    b.title?.toLowerCase().includes(search.toLowerCase()) || 
    b.tag?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground font-display uppercase italic">Marketplace Engagements</h1>
          <p className="text-muted-foreground mt-1 font-medium italic">Configure cross-platform banners and promotional carousels. 🎠</p>
        </div>
        <Button 
          onClick={() => handleOpenForm(null)}
          className="rounded-2xl font-black bg-primary text-white shadow-xl shadow-primary/20 h-12 px-6"
        >
          <Plus className="w-5 h-5 mr-2" /> Launch Campaign
        </Button>
      </div>

      <div className="flex gap-4 items-center bg-muted/10 p-4 rounded-[2rem] border border-muted-foreground/5 shadow-inner">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
               placeholder="Search active engagements..." 
               className="pl-12 h-12 bg-background border-none shadow-sm rounded-2xl font-bold italic"
               value={search}
               onChange={e => setSearch(e.target.value)}
            />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
           {loading ? (
              Array(3).fill(0).map((_, i) => <div key={i} className="h-80 rounded-[3rem] bg-muted animate-pulse border-none shadow-premium" />)
           ) : filtered.length === 0 ? (
              <div className="col-span-full h-80 flex flex-col items-center justify-center opacity-20 uppercase font-black italic">
                 <Megaphone className="w-16 h-16 mb-4" /> Signal Lost / No Active Campaigns
              </div>
           ) : filtered.map((b, i) => (
             <motion.div
               key={b.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className={`group rounded-[3rem] overflow-hidden transition-all duration-500 relative
                 ${b.isActive ? 'bg-background hover:shadow-2xl border-2 border-primary/5 hover:-translate-y-2' : 'bg-muted/50 grayscale opacity-40 shadow-inner'}`}
             >
                <div className="aspect-[16/9] relative overflow-hidden bg-muted">
                    {b.imageUrl ? (
                        <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon className="w-12 h-12 opacity-20" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-8 flex flex-col justify-end">
                       <Button 
                         variant="secondary" 
                         className="rounded-xl font-black uppercase text-[10px] tracking-widest w-full gap-2"
                         onClick={() => b.linkUrl && window.open(b.linkUrl, '_blank')}
                        >
                           <ExternalLink className="w-3 h-3" /> Inspect Target
                       </Button>
                    </div>
                    {b.tag && (
                       <Badge className="absolute top-4 left-4 rounded-xl bg-primary text-white border-none font-black italic tracking-widest text-[10px] px-3">
                          {b.tag.toUpperCase()}
                       </Badge>
                    )}
                </div>

                <div className="p-8 space-y-4">
                   <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                         <h3 className="text-xl font-black font-display tracking-tight text-foreground line-clamp-1 uppercase">{b.title || 'Untitled'}</h3>
                         <p className="text-xs font-bold text-muted-foreground mt-1 line-clamp-2 italic opacity-70">"{b.description || 'No subtext.'}"</p>
                      </div>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-soft ${b.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                         {b.isActive ? <Zap className="w-5 h-5 fill-current" /> : <EyeOff className="w-5 h-5" />}
                      </div>
                   </div>

                   <div className="pt-6 mt-4 border-t border-muted/50 flex gap-3">
                      <Button 
                        variant="ghost" 
                        className="flex-1 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-muted hover:bg-primary hover:text-white"
                        onClick={() => handleOpenForm(b)}
                      >
                         Modify
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="rounded-2xl w-12 h-10 p-0 bg-muted hover:bg-destructive hover:text-white"
                        onClick={() => handleDelete(b.id)}
                      >
                         <Trash2 className="w-4 h-4" />
                      </Button>
                   </div>
                </div>
             </motion.div>
           ))}
        </AnimatePresence>
      </div>

      {/* Banner Schema Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-xl rounded-[3rem] p-0 overflow-hidden border-none shadow-premium bg-background">
           <div className="p-10 space-y-8">
              <div className="flex flex-col items-center">
                 <div 
                   className="w-full aspect-[21/9] rounded-[2rem] bg-muted relative group shadow-2xl overflow-hidden border-4 border-background"
                   onClick={() => !uploading && document.getElementById('banner-upload')?.click()}
                 >
                    {uploading ? (
                       <div className="w-full h-full flex items-center justify-center bg-black/5 backdrop-blur-sm">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                       </div>
                    ) : form.imageUrl ? (
                       <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center opacity-40">
                          <UploadCloud className="w-10 h-10 mb-2" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Upload 16:9 Aesthetic</p>
                       </div>
                    )}
                    <input id="banner-upload" type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-4 italic flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-primary" /> Promotional Visual Component
                 </p>
              </div>

              <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 italic">Headline</label>
                       <Input 
                         placeholder="e.g. 40% OFF GROOMING" 
                         className="rounded-2xl h-12 bg-muted border-none font-bold uppercase shadow-inner"
                         value={form.title || ''}
                         onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 italic">Tactical Tag</label>
                       <Input 
                         placeholder="e.g. LIMITED TIME" 
                         className="rounded-2xl h-12 bg-muted border-none font-black text-primary shadow-inner text-center"
                         value={form.tag || ''}
                         onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 italic">Campaign Subtext</label>
                    <Textarea 
                      placeholder="Write a compelling sub-headline for this promotion..." 
                      className="rounded-2xl bg-muted border-none font-bold text-sm px-6 py-4 shadow-inner resize-none h-24 italic"
                      value={form.description || ''}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 italic">Action Target (CTA Link)</label>
                    <Input 
                      placeholder="https://petsaathi.com/offers/..." 
                      className="rounded-2xl h-12 bg-muted border-none font-mono text-xs shadow-inner italic"
                      value={form.linkUrl}
                      onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))}
                    />
                 </div>

                 <div className="flex items-center justify-between p-6 rounded-[2rem] bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-3">
                       <Megaphone className="w-5 h-5 text-primary" />
                       <div>
                          <p className="font-black text-sm tracking-tight leading-none italic uppercase">Emission Status</p>
                          <p className="text-[10px] font-bold text-muted-foreground mt-1 underline decoration-primary/20">Enable immediate broadcast to app carousels</p>
                       </div>
                    </div>
                    <button 
                     onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                     className={`w-14 h-7 rounded-full transition-all duration-300 relative ${form.isActive ? 'bg-primary shadow-xl shadow-primary/20' : 'bg-muted'}`}
                    >
                       <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${form.isActive ? 'left-8' : 'left-1'}`} />
                    </button>
                 </div>
              </div>
           </div>

           <DialogFooter className="p-10 pt-0 flex gap-4">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] italic">Abort</Button>
              <Button onClick={handleSave} className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-primary text-white shadow-xl shadow-primary/20" disabled={saving || uploading}>
                 {saving ? "Deploying..." : (selected ? "Update Campaign" : "Launch Engine")}
              </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
