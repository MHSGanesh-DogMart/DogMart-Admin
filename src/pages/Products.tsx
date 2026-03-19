import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, Eye, CheckCircle, XCircle, 
  Trash2, ShoppingBag, Tag, ShieldCheck, 
  ShieldAlert, AlertCircle, Package
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

interface Product {
  id: string;
  name?: string;
  brand?: string;
  sellingPrice: number;
  description?: string;
  images?: string[];
  status: string;
  isFeatured?: boolean;
  category?: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (tab !== 'all') params.status = tab;

      const res = await api.get('/products', { params });
      setProducts(res.data.products || []);
      setFiltered(res.data.products || []);
    } catch (e) {
      console.error("Failed to fetch products:", e);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (!search) {
      setFiltered(products);
      return;
    }
    const s = search.toLowerCase();
    setFiltered(products.filter(p => 
      p.id?.includes(s) || 
      (p.name || "").toLowerCase().includes(s) || 
      (p.brand || "").toLowerCase().includes(s)
    ));
  }, [search, products]);

  const handleStatusChange = async (productId: string, status: string, note = "") => {
    if (status === "rejected" && !note.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setActioning(true);
    try {
      await api.patch(`/products/${productId}/status`, { status, adminNote: note });
      toast.success(`Product ${status} successfully`);
      fetchProducts();
      setSelected(null);
      setRejectMode(false);
      setReason("");
    } catch (e) {
      toast.error("Failed to update product status");
    } finally {
      setActioning(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm("Permanently delete this product?")) return;
    setActioning(true);
    try {
      await api.delete(`/products/${productId}`);
      toast.success("Product deleted permanently");
      fetchProducts();
      setSelected(null);
    } catch (e) {
      toast.error("Failed to delete product");
    } finally {
      setActioning(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Products Moderation</h1>
          <p className="text-muted-foreground mt-1">Review and manage retail items listed on the PetSaathi Store.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl border-primary/20 bg-primary/5 text-primary">
                View Store
            </Button>
        </div>
      </div>

      <Card className="border-none shadow-soft overflow-hidden">
        <CardHeader className="pb-0 pt-6">
          <div className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-muted/30 p-4 rounded-2xl border">
            <div className="relative w-full xl:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search product name, brand, or ID..." 
                className="pl-10 bg-background border-none shadow-sm rounded-xl font-medium"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <Tabs value={tab} onValueChange={setTab} className="w-full xl:w-auto">
              <TabsList className="bg-background border p-1 h-auto rounded-xl shadow-inner">
                {["all", "pending", "active", "sold", "rejected"].map(t => (
                  <TabsTrigger 
                    key={t} 
                    value={t}
                    className="rounded-lg px-4 py-1.5 text-xs font-black data-[state=active]:bg-primary data-[state=active]:text-white uppercase tracking-tight transition-all"
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
                    <th className="px-8 py-4 text-xs font-black text-muted-foreground tracking-widest uppercase opacity-60">Item Details</th>
                    <th className="px-8 py-4 text-xs font-black text-muted-foreground tracking-widest uppercase opacity-60">Brand / Vendor</th>
                    <th className="px-8 py-4 text-xs font-black text-muted-foreground tracking-widest uppercase opacity-60">Revenue Unit</th>
                    <th className="px-8 py-4 text-xs font-black text-muted-foreground tracking-widest uppercase opacity-60">Status</th>
                    <th className="px-8 py-4 text-xs font-black text-muted-foreground tracking-widest uppercase opacity-60 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="h-64 text-center py-20 uppercase font-black opacity-10 italic">
                           Inventory Clear / No Results
                        </td>
                      </tr>
                    ) : filtered.map((p, i) => (
                      <motion.tr 
                        key={p.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b hover:bg-muted/30 transition-all group cursor-pointer active:scale-[0.99]"
                        onClick={() => setSelected(p)}
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-muted overflow-hidden border-2 border-muted shadow-sm group-hover:shadow-md group-hover:border-primary/20 transition-all animate-in fade-in zoom-in duration-500">
                              <img 
                                src={p.images?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=150&h=150"} 
                                alt={p.name} 
                                className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000"
                              />
                            </div>
                            <div>
                                <p className="font-black text-sm tracking-tight text-foreground group-hover:text-primary transition-colors">{p.name || "Unnamed Product"}</p>
                                <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40">ITEM: {p.id.slice(-6)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                            <Badge variant="outline" className="rounded-lg border-muted-foreground/10 bg-muted/50 font-bold text-xs">
                                {p.brand || "Private Label"}
                            </Badge>
                        </td>
                        <td className="px-8 py-5">
                           <span className="font-black text-primary text-xl font-display">₹{(p.sellingPrice || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-8 py-5">
                           <Badge variant={
                             p.status === 'pending' ? 'warning' : 
                             p.status === 'active' ? 'success' : 
                             p.status === 'rejected' ? 'destructive' : 'secondary'
                           } className="rounded-[0.5rem] px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm">
                             {p.status}
                           </Badge>
                        </td>
                        <td className="px-8 py-5 text-right">
                           <Button variant="ghost" size="sm" className="rounded-xl font-black bg-muted group-hover:bg-primary group-hover:text-white transition-all scale-95 group-hover:scale-100">
                              Review
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

      {/* Product Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => {!o && setSelected(null); setRejectMode(false);}}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] bg-background">
           <div className="grid md:grid-cols-2">
              <div className="relative h-full min-h-[400px]">
                 <img 
                   src={selected?.images?.[0] || ""} 
                   className="absolute inset-0 w-full h-full object-cover" 
                   alt="Product Hero"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                 <div className="absolute bottom-10 left-10 right-10 text-white">
                    <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-80 mb-2">Inventory Management</p>
                    <h2 className="text-3xl font-black leading-tight drop-shadow-lg">{selected?.name}</h2>
                 </div>
              </div>

              <div className="p-10 space-y-8 flex flex-col justify-center">
                 <div className="space-y-2">
                    <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">
                       {selected?.status} Status
                    </Badge>
                    <div className="flex items-baseline gap-2">
                       <span className="text-4xl font-black text-primary font-display">₹{(selected?.sellingPrice || 0).toLocaleString()}</span>
                       <span className="text-muted-foreground text-xs font-bold font-display ml-1">M.R.P</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="p-5 rounded-3xl bg-muted/30 border-2 border-muted border-dashed">
                       <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2 flex items-center gap-2">
                          <Package className="w-3 h-3" /> Retail Description
                       </p>
                       <p className="text-xs leading-relaxed font-bold text-muted-foreground italic">
                          "{selected?.description || "No description provided for this listing."}"
                       </p>
                    </div>
                 </div>

                 {rejectMode ? (
                   <div className="space-y-4 animate-in zoom-in-95 duration-300">
                      <div className="bg-destructive/10 p-4 rounded-2xl border border-destructive/20 text-destructive text-[10px] font-black uppercase tracking-widest text-center">
                         Action: Permanent Rejection
                      </div>
                      <textarea 
                        className="w-full min-h-[80px] bg-muted/50 rounded-2xl p-4 text-xs font-black border-2 border-transparent focus:border-destructive outline-none transition-all placeholder:opacity-50"
                        placeholder="Detail the reason for rejection..."
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                      />
                      <div className="flex gap-3">
                         <Button 
                           disabled={actioning}
                           onClick={() => selected && handleStatusChange(selected.id, 'rejected', reason)}
                           className="flex-1 rounded-2xl bg-destructive hover:bg-destructive/90 text-white font-black h-12"
                         >
                            Confirm
                         </Button>
                         <Button variant="outline" onClick={() => setRejectMode(false)} className="rounded-2xl font-black h-12">Cancel</Button>
                      </div>
                   </div>
                 ) : (
                   <div className="space-y-3 pt-4">
                     {selected?.status === 'pending' && (
                       <div className="flex gap-3">
                         <Button 
                           onClick={() => selected && handleStatusChange(selected.id, 'active')}
                           disabled={actioning}
                           className="flex-1 h-14 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transform transition-all active:scale-95"
                         >
                           <ShieldCheck className="w-5 h-5 mr-2" /> Approve
                         </Button>
                         <Button 
                           onClick={() => setRejectMode(true)}
                           disabled={actioning}
                           variant="outline"
                           className="flex-1 h-14 rounded-2xl font-black border-2 border-destructive/20 text-destructive hover:bg-destructive/5"
                         >
                           Reject
                         </Button>
                       </div>
                     )}
                     <Button 
                       onClick={() => selected && handleDelete(selected.id)}
                       variant="ghost" 
                       className="w-full h-12 rounded-2xl font-black text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                     >
                       <Trash2 className="w-4 h-4 mr-2" /> Remove Permanent
                     </Button>
                   </div>
                 )}
              </div>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
