import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Pencil, Trash2, X, ShoppingBag, 
  ChevronDown, ChevronRight, Tag,
  LayoutGrid, ListTree, Zap
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

interface SubCategory {
  id: string;
  name: string;
  order: number;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  emoji: string;
  order: number;
  isActive: boolean;
  subs?: SubCategory[];
}

export default function ProductCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCatForm, setShowCatForm] = useState(false);
  const [showSubForm, setShowSubForm] = useState(false);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [selectedSub, setSelectedSub] = useState<SubCategory | null>(null);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const [catForm, setCatForm] = useState<Partial<Category>>({ name: '', emoji: '🛍️', order: 0, isActive: true });
  const [subForm, setSubForm] = useState<Partial<SubCategory>>({ name: '', order: 0, isActive: true });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/product-categories');
      setCategories(res.data.categories || []);
    } catch (e) {
      console.error("Failed to fetch categories:", e);
      toast.error("Failed to load product categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const toggleExpand = (id: string) => {
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenCatForm = (cat: Category | null) => {
    setSelectedCat(cat);
    setCatForm(cat || { name: '', emoji: '🛍️', order: 0, isActive: true });
    setShowCatForm(true);
  };

  const handleOpenSubForm = (cat: Category, sub: SubCategory | null) => {
    setSelectedCat(cat);
    setSelectedSub(sub);
    setSubForm(sub || { name: '', order: 0, isActive: true });
    setShowSubForm(true);
  };

  const handleSaveCat = async () => {
    if (!catForm.name?.trim()) return;
    setSaving(true);
    try {
      if (selectedCat?.id) {
        await api.put(`/product-categories/${selectedCat.id}`, catForm);
        toast.success("Category updated");
      } else {
        await api.post('/product-categories', catForm);
        toast.success("New product category created");
      }
      fetchCategories();
      setShowCatForm(false);
    } catch (e) {
      toast.error("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSub = async () => {
    if (!subForm.name?.trim() || !selectedCat) return;
    setSaving(true);
    try {
      if (selectedSub?.id) {
        await api.put(`/product-categories/subs/${selectedSub.id}`, subForm);
        toast.success("Sub-category updated");
      } else {
        await api.post(`/product-categories/${selectedCat.id}/subs`, subForm);
        toast.success("New sub-category added");
      }
      fetchCategories();
      setShowSubForm(false);
    } catch (e) {
      toast.error("Failed to save sub-category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground font-display lowercase first-letter:uppercase">inventory departments</h1>
          <p className="text-muted-foreground mt-1 font-medium font-sans">Organize marketplace products into logical segments. 🍖</p>
        </div>
        <Button 
          onClick={() => handleOpenCatForm(null)}
          className="rounded-2xl font-black bg-primary text-white shadow-xl shadow-primary/20 h-12"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
            { label: 'Active Depts', val: categories.length, icon: LayoutGrid, color: 'text-blue-500' },
            { label: 'Sub-Categories', val: categories.reduce((s, c) => s + (c.subs?.length || 0), 0), icon: ListTree, color: 'text-primary' },
        ].map(s => (
            <Card key={s.label} className="border-none shadow-premium p-6">
                <div className="flex items-center gap-4">
                    <div className={`${s.color} bg-current/5 p-3 rounded-2xl`}>
                        <s.icon className="w-5 h-5 shadow-sm" />
                    </div>
                    <div>
                        <p className="text-xl font-black font-display leading-none">{s.val}</p>
                        <p className="text-[10px] font-black uppercase text-muted-foreground mt-1 opacity-50">{s.label}</p>
                    </div>
                </div>
            </Card>
        ))}
      </div>

      <Card className="border-none shadow-premium overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
             <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
             </div>
          ) : categories.length === 0 ? (
             <div className="h-64 flex flex-col items-center justify-center opacity-20 uppercase font-black italic">
                <ShoppingBag className="w-12 h-12 mb-4" />
                Department Index Empty
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/10 tracking-widest text-[10px] font-black uppercase text-muted-foreground opacity-60 italic">
                    <th className="px-8 py-5 w-16 text-center">Tree</th>
                    <th className="px-8 py-5">Classification</th>
                    <th className="px-8 py-5">Emoji</th>
                    <th className="px-8 py-5 text-center">Depth/Order</th>
                    <th className="px-8 py-5">Integrity</th>
                    <th className="px-8 py-5 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, i) => (
                    <React.Fragment key={cat.id}>
                      <motion.tr 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b hover:bg-muted/30 transition-all cursor-pointer group"
                        onClick={() => toggleExpand(cat.id)}
                      >
                        <td className="px-8 py-6 text-center">
                           <div className="flex items-center justify-center">
                              {expandedCats[cat.id] ? <ChevronDown className="w-4 h-4 text-primary" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="font-black text-sm tracking-tight">{cat.name}</span>
                        </td>
                        <td className="px-8 py-6 text-xl">{cat.emoji}</td>
                        <td className="px-8 py-6 text-center font-mono text-xs font-black opacity-30 italic">L1 / {cat.order}</td>
                        <td className="px-8 py-6">
                           <Badge variant={cat.isActive ? "success" : "secondary"} className="rounded-xl px-3 py-0.5 text-[9px] font-black uppercase">
                              {cat.isActive ? "Live" : "Paused"}
                           </Badge>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" size="sm" 
                                className="rounded-xl font-bold bg-muted/50 hover:bg-primary hover:text-white"
                                onClick={(e) => { e.stopPropagation(); handleOpenCatForm(cat); }}
                              >
                                 <Pencil className="w-3 h-3" />
                              </Button>
                              <Button 
                                variant="ghost" size="sm" 
                                className="rounded-xl font-black uppercase text-[10px] tracking-widest bg-primary/10 text-primary hover:bg-primary hover:text-white"
                                onClick={(e) => { e.stopPropagation(); handleOpenSubForm(cat, null); }}
                              >
                                 <Plus className="w-3 h-3 mr-1" /> Branch
                              </Button>
                           </div>
                        </td>
                      </motion.tr>
                      
                      <AnimatePresence>
                        {expandedCats[cat.id] && cat.subs?.map((sub, j) => (
                          <motion.tr 
                            key={sub.id}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-muted/10 border-b last:border-b-0 hover:bg-muted/40 transition-all"
                          >
                             <td className="px-8 py-4"></td>
                             <td className="px-16 py-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shadow-sm" />
                                   <span className="font-bold text-xs opacity-80 italic tracking-tight uppercase">{sub.name}</span>
                                </div>
                             </td>
                             <td className="px-8 py-4"></td>
                             <td className="px-8 py-4 text-center font-mono text-[10px] opacity-20">L2 / {sub.order}</td>
                             <td className="px-8 py-4">
                                <Badge variant={sub.isActive ? "secondary" : "secondary"} className="rounded-lg px-2 py-0 h-4 text-[8px] font-black uppercase opacity-60">
                                   {sub.isActive ? "Visible" : "Hidden"}
                                </Badge>
                             </td>
                             <td className="px-8 py-4 text-right">
                                <Button 
                                  variant="ghost" size="sm" 
                                  className="rounded-lg w-7 h-7 p-0 hover:bg-primary hover:text-white transition-colors"
                                  onClick={() => handleOpenSubForm(cat, sub)}
                                >
                                   <Pencil className="w-3 h-3" />
                                </Button>
                             </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Modal */}
      <Dialog open={showCatForm} onOpenChange={setShowCatForm}>
        <DialogContent className="rounded-[2.5rem] bg-background border-none shadow-premium max-w-md p-0 overflow-hidden">
           <div className="bg-primary p-10 text-white flex flex-col items-center">
              <div className="text-4xl mb-4 drop-shadow-xl">{catForm.emoji}</div>
              <h2 className="text-2xl font-black font-display uppercase tracking-tighter">Department Metadata</h2>
           </div>
           <div className="p-8 space-y-6">
              <div className="space-y-1 px-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 underline underline-offset-4 decoration-primary/20">Name</label>
                 <Input className="rounded-2xl h-12 bg-muted border-none font-bold" value={catForm.name || ''} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1 px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 italic">Emoji</label>
                    <Input className="rounded-2xl h-12 bg-muted border-none font-bold" value={catForm.emoji || ''} onChange={e => setCatForm(f => ({ ...f, emoji: e.target.value }))} />
                 </div>
                 <div className="space-y-1 px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 italic">Weight</label>
                    <Input className="rounded-2xl h-12 bg-muted border-none font-black" type="number" value={catForm.order || 0} onChange={e => setCatForm(f => ({ ...f, order: Number(e.target.value) }))} />
                 </div>
              </div>
              <div className="flex justify-between items-center px-2 py-4 rounded-2xl bg-muted/50">
                 <span className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Active Integrity</span>
                 <button 
                  className={`w-12 h-6 rounded-full relative transition-all ${catForm.isActive ? 'bg-primary' : 'bg-muted-foreground/20'}`}
                  onClick={() => setCatForm(f => ({ ...f, isActive: !f.isActive }))}
                 >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${catForm.isActive ? 'left-7' : 'left-1'}`} />
                 </button>
              </div>
              <div className="flex gap-4 pt-4">
                 <Button variant="outline" className="flex-1 rounded-[1.25rem] font-black uppercase tracking-widest text-[10px]" onClick={() => setShowCatForm(false)}>Abort</Button>
                 <Button className="flex-1 rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] bg-primary text-white" onClick={handleSaveCat} disabled={saving}>
                    {saving ? "Deploying..." : "Commit"}
                 </Button>
              </div>
           </div>
        </DialogContent>
      </Dialog>

      {/* Sub-Category Modal */}
      <Dialog open={showSubForm} onOpenChange={setShowSubForm}>
        <DialogContent className="rounded-[2.5rem] bg-background border-none shadow-premium max-w-md p-0 overflow-hidden">
           <div className="bg-primary/10 p-10 flex flex-col items-center">
              <ListTree className="w-12 h-12 text-primary mb-4" />
              <h2 className="text-2xl font-black font-display uppercase tracking-tighter text-foreground">Hierarchy Extension</h2>
              <p className="text-[10px] font-black uppercase opacity-40 mt-1">Under: {selectedCat?.name}</p>
           </div>
           <div className="p-8 space-y-6">
              <div className="space-y-1 px-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 underline underline-offset-4 decoration-primary/20">Sub-Category Identifier</label>
                 <Input className="rounded-2xl h-12 bg-muted border-none font-bold" value={subForm.name || ''} onChange={e => setSubForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1 px-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 italic">Display Priority</label>
                 <Input className="rounded-2xl h-12 bg-muted border-none font-black" type="number" value={subForm.order || 0} onChange={e => setSubForm(f => ({ ...f, order: Number(e.target.value) }))} />
              </div>
              <div className="flex justify-between items-center px-2 py-4 rounded-2xl bg-muted/50 border border-primary/5">
                 <span className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Live Status</span>
                 <button 
                  className={`w-12 h-6 rounded-full relative transition-all ${subForm.isActive ? 'bg-primary shadow-xl shadow-primary/20' : 'bg-muted-foreground/20'}`}
                  onClick={() => setSubForm(f => ({ ...f, isActive: !f.isActive }))}
                 >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${subForm.isActive ? 'left-7' : 'left-1'}`} />
                 </button>
              </div>
              <div className="flex gap-4 pt-4">
                 <Button variant="outline" className="flex-1 rounded-[1.25rem] font-black uppercase tracking-widest text-[10px]" onClick={() => setShowSubForm(false)}>Cancel</Button>
                 <Button className="flex-1 rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] bg-primary text-white shadow-premium" onClick={handleSaveSub} disabled={saving}>
                    {saving ? "Processing..." : "Commit Change"}
                 </Button>
              </div>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
