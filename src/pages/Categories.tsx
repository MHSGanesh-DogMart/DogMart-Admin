import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Pencil, Trash2, X, Tag, 
  Image as ImageIcon, Upload, Loader2,
  CheckCircle, ShieldAlert, Zap
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

interface Category {
  id: string;
  name: string;
  emoji: string;
  imageUrl?: string;
  colorHex?: string;
  isActive: boolean;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [form, setForm] = useState<Partial<Category>>({
    name: '',
    emoji: '🐾',
    imageUrl: '',
    colorHex: '0xFFF9EDE4',
    isActive: true
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories || []);
    } catch (e) {
      console.error("Failed to fetch categories:", e);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenForm = (cat: Category | null) => {
    setSelected(cat);
    setForm(cat || {
      name: '',
      emoji: '🐾',
      imageUrl: '',
      colorHex: '0xFFF9EDE4',
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
      const res = await api.post('/categories/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setForm(f => ({ ...f, imageUrl: res.data.url }));
        toast.success("Image uploaded successfully");
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name?.trim()) return;
    setSaving(true);
    try {
      if (selected?.id) {
        await api.put(`/categories/${selected.id}`, form);
        toast.success("Category updated");
      } else {
        await api.post('/categories', form);
        toast.success("New category created");
      }
      fetchCategories();
      setShowForm(false);
    } catch (e) {
      toast.error("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently remove this category and all its associations?")) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category deleted");
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      toast.error("Deletion failed");
    }
  };

  const handleToggle = async (cat: Category) => {
    try {
      await api.patch(`/categories/${cat.id}/toggle`);
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, isActive: !c.isActive } : c));
      toast.success(`${cat.name} visibility updated`);
    } catch (e) {
      toast.error("Failed to toggle status");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground font-display">Pet Classifications</h1>
          <p className="text-muted-foreground mt-1 font-medium italic">Define global taxonomies for marketplace listings. 🐕</p>
        </div>
        <Button 
          onClick={() => handleOpenForm(null)}
          className="rounded-2xl font-black bg-primary text-white shadow-xl shadow-primary/20 h-12 px-6"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
             Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-64 rounded-[2.5rem] bg-muted animate-pulse border-none shadow-premium" />
             ))
          ) : categories.length === 0 ? (
             <div className="col-span-full h-64 flex flex-col items-center justify-center opacity-20 uppercase font-black italic">
                <Tag className="w-12 h-12 mb-4" />
                Index is Empty / No Categories Found
             </div>
          ) : categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`group relative rounded-[2.5rem] p-8 transition-all duration-500 hover:shadow-2xl overflow-hidden
                ${cat.isActive ? 'bg-background hover:-translate-y-2' : 'bg-muted/50 grayscale opacity-60'}`}
              style={{ border: `2px solid ${cat.isActive ? 'rgba(var(--primary), 0.1)' : 'transparent'}` }}
            >
               <div className="flex justify-between items-start mb-6">
                  <div 
                    className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-soft group-hover:rotate-12 transition-transform duration-500"
                    style={{ background: cat.colorHex?.replace('0x', '#') || 'var(--primary-light)' }}
                  >
                     {cat.imageUrl ? (
                        <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover rounded-2xl" />
                     ) : (
                        cat.emoji
                     )}
                  </div>
                  <div className="flex gap-2">
                     <button 
                        onClick={() => handleOpenForm(cat)}
                        className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all shadow-sm"
                     >
                        <Pencil className="w-4 h-4" />
                     </button>
                     <button 
                        onClick={() => handleDelete(cat.id)}
                        className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-white transition-all shadow-sm"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>

               <div className="space-y-1">
                  <h3 className="text-xl font-black font-display tracking-tight text-foreground">{cat.name}</h3>
                  <div className="flex items-center gap-2">
                     <Badge variant={cat.isActive ? "success" : "secondary"} className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">
                        {cat.isActive ? "Active" : "Archived"}
                     </Badge>
                     <p className="text-[10px] font-mono font-bold opacity-30">HEX: {cat.colorHex || 'N/A'}</p>
                  </div>
               </div>

               <div className="mt-8 flex justify-between items-center bg-muted/20 -mx-8 -mb-8 px-8 py-4 border-t border-muted/20">
                   <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Visibility</span>
                   </div>
                   <button 
                      onClick={() => handleToggle(cat)}
                      className={`w-12 h-6 rounded-full transition-all duration-300 relative ${cat.isActive ? 'bg-primary shadow-inner shadow-primary/20' : 'bg-muted'}`}
                   >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${cat.isActive ? 'left-7' : 'left-1'}`} />
                   </button>
               </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Category Editor Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-premium bg-background">
           <DialogHeader className="p-10 pb-0 shrink-0">
             <DialogTitle className="text-3xl font-black font-display tracking-tight flex items-center gap-3">
               {selected ? "Modify Category" : "Establish Category"}
               <Badge className="bg-primary/10 text-primary border-none font-black italic">GLOBAL</Badge>
             </DialogTitle>
           </DialogHeader>

           <div className="p-10 space-y-8">
              <div className="flex flex-col items-center justify-center gap-6 py-6 border-b border-muted">
                 <div 
                   className="w-32 h-32 rounded-[2.5rem] bg-muted relative group shadow-2xl overflow-hidden border-4 border-background"
                   style={{ background: form.colorHex?.replace('0x', '#') || 'var(--primary-light)' }}
                 >
                    {uploading ? (
                       <div className="w-full h-full flex items-center justify-center bg-black/5 backdrop-blur-sm">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                       </div>
                    ) : form.imageUrl ? (
                       <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-5xl drop-shadow-lg">
                          {form.emoji}
                       </div>
                    )}
                    
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                       <Upload className="w-6 h-6 text-white" />
                       <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Click to upload custom visual asset</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2 col-span-full">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 italic">Taxonomy Name</label>
                    <Input 
                      placeholder="e.g. Exotic Birds" 
                      className="rounded-2xl h-14 bg-muted border-none font-bold text-lg px-6 shadow-inner focus:shadow-none transition-all"
                      value={form.name || ''}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 italic">Emoji ID / Fallback</label>
                    <Input 
                      placeholder="e.g. 🦜" 
                      className="rounded-2xl h-12 bg-muted border-none font-bold px-5 italic shadow-inner"
                      value={form.emoji || ''}
                      onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 italic">HEX Aesthetic</label>
                    <Input 
                      placeholder="0xFFF9EDE4" 
                      className="rounded-2xl h-12 bg-muted border-none font-mono font-black px-5 shadow-inner"
                      value={form.colorHex || ''}
                      onChange={e => setForm(f => ({ ...f, colorHex: e.target.value }))}
                    />
                 </div>
              </div>

              <div className="flex items-center justify-between p-6 rounded-3xl bg-primary/5 border border-primary/10">
                 <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <div>
                       <p className="font-black text-sm tracking-tight leading-none">Global Visibility</p>
                       <p className="text-[10px] font-bold text-muted-foreground mt-1 underline decoration-primary/20">Enable for all marketplace users</p>
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

           <DialogFooter className="p-10 pt-0 flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => setShowForm(false)}
                className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-sm"
              >
                 Abort
              </Button>
              <Button 
                onClick={handleSave} 
                className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                disabled={saving || uploading}
              >
                 {saving ? "Synthesizing..." : "Commit Expansion"}
              </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
