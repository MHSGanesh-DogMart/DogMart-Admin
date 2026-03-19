import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, IndianRupee, TrendingUp, Calendar, 
  ArrowUpRight, ArrowDownRight, CreditCard,
  Search, Filter, PieChart, BarChart3, Activity
} from "lucide-react";
import { db } from "@/firebase/config";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, Cell 
} from 'recharts';
import { toast } from "sonner";

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

interface Transaction {
  id: string;
  amountPaid: number;
  sessionType?: string;
  paymentId?: string;
  createdAt?: any;
}

export default function Payments() {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ total: 0, thisWeek: 0, thisMonth: 0 });
  const [byType, setByType] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'bookings'), 
        where('status', '==', 'completed'), 
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      const snap = await getDocs(q);
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
      setTxns(all);

      const now = new Date();
      const startWeek = new Date(now); startWeek.setDate(now.getDate() - 7);
      const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const stats = {
        total: all.reduce((s, b) => s + (b.amountPaid || 0), 0),
        thisWeek: all.filter(b => {
          const dt = b.createdAt?.toDate?.() || new Date(0);
          return dt >= startWeek;
        }).reduce((s, b) => s + (b.amountPaid || 0), 0),
        thisMonth: all.filter(b => {
          const dt = b.createdAt?.toDate?.() || new Date(0);
          return dt >= startMonth;
        }).reduce((s, b) => s + (b.amountPaid || 0), 0),
      };
      setSummary(stats);

      const typeMap: Record<string, number> = {};
      all.forEach(b => { 
        const t = b.sessionType || 'Other'; 
        typeMap[t] = (typeMap[t] || 0) + (b.amountPaid || 0); 
      });
      setByType(Object.entries(typeMap).map(([name, earnings], i) => ({ 
        name, 
        earnings, 
        fill: COLORS[i % COLORS.length] 
      })));
    } catch (e) {
      console.error("Failed to fetch payments:", e);
      toast.error("Failed to load financial records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const exportCSV = () => {
    const rows = [['Date', 'Session', 'Amount', 'Payment ID']];
    txns.forEach(t => rows.push([
        t.createdAt?.toDate?.() ? t.createdAt.toDate().toLocaleDateString('en-IN') : '—',
        t.sessionType || '—', `₹${t.amountPaid || 0}`, t.paymentId || '—'
    ]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'petsaathi_earnings.csv';
    a.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground font-display">Revenue Hub</h1>
          <p className="text-muted-foreground mt-1 font-medium">Track platform earnings and transactional health in real-time.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl font-bold border-primary/20 hover:bg-primary/5 shadow-sm" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export Ledger
          </Button>
          <Button className="rounded-2xl font-black bg-primary text-white shadow-xl shadow-primary/20">
             Reconcile Now
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Revenue', val: summary.total, icon: IndianRupee, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Monthly Target', val: summary.thisMonth, icon: BarChart3, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
          { label: 'Weekly Velocity', val: summary.thisWeek, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map(s => (
          <Card key={s.label} className="border-none shadow-premium overflow-hidden group">
            <CardContent className="p-6">
               <div className="flex justify-between items-start">
                  <div className={`${s.bg} ${s.color} p-3 rounded-2xl group-hover:rotate-12 transition-transform duration-500`}>
                     <s.icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center text-emerald-500 text-[10px] font-black uppercase">
                     <ArrowUpRight className="w-3 h-3 mr-1" /> 12%
                  </div>
               </div>
               <div className="mt-4">
                  <p className="text-3xl font-black text-foreground font-display leading-none">₹{(s.val || 0).toLocaleString()}</p>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-2">{s.label}</p>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-premium rounded-[2.5rem] overflow-hidden">
           <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground italic">Earnings Mix by Service</CardTitle>
           </CardHeader>
           <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={byType} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" fontSize={10} width={100} tick={{ fontWeight: 800, fill: 'currentColor', opacity: 0.6 }} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 900 }}
                    />
                    <Bar dataKey="earnings" radius={[0, 10, 10, 0]} barSize={24}>
                       {byType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </CardContent>
        </Card>

        <Card className="border-none shadow-premium rounded-[2.5rem] overflow-hidden p-8 flex flex-col justify-center gap-6 bg-primary/[0.02]">
           <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-2 italic">Segment Breakdown</h3>
           {byType.map((t, i) => (
              <div key={t.name} className="space-y-2">
                 <div className="flex justify-between items-end">
                    <span className="text-xs font-black uppercase tracking-tight opacity-70">{t.name}</span>
                    <span className="text-sm font-black text-primary font-display">₹{(t.earnings || 0).toLocaleString()}</span>
                 </div>
                 <div className="h-2.5 bg-muted rounded-full overflow-hidden border border-muted-foreground/5 p-[1px]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (t.earnings / (summary.total || 1)) * 100)}%` }}
                      transition={{ delay: i * 0.1, duration: 1 }}
                      className="h-full rounded-full" 
                      style={{ background: t.fill }} 
                    />
                 </div>
              </div>
           ))}
        </Card>
      </div>

      <Card className="border-none shadow-premium overflow-hidden">
        <CardHeader className="pb-0 pt-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-muted/20 p-4 rounded-[2rem] border border-muted-foreground/5">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="font-black text-sm uppercase tracking-widest italic">Live Ledger</h3>
             </div>
             <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input 
                  placeholder="Search Payment ID..." 
                  className="pl-9 h-10 rounded-xl bg-background border-none shadow-inner text-xs font-bold"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 mt-6 px-6 pb-6">
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="border-b bg-muted/30">
                      <th className="px-8 py-5 text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase opacity-60">Timestamp</th>
                      <th className="px-8 py-5 text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase opacity-60">Session Classification</th>
                      <th className="px-8 py-5 text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase opacity-60">Net Amount</th>
                      <th className="px-8 py-5 text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase opacity-60 text-right">Razorpay Reference</th>
                   </tr>
                </thead>
                <tbody>
                   <AnimatePresence mode="popLayout">
                      {txns.length === 0 ? (
                        <tr><td colSpan={4} className="h-64 text-center py-20 uppercase font-black opacity-10 underline underline-offset-8 decoration-primary/20 italic">
                           Treasury Empty / No Records
                        </td></tr>
                      ) : txns.filter(t => t.paymentId?.includes(search)).map((t, i) => (
                        <motion.tr 
                          key={t.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="border-b hover:bg-muted/40 transition-all group"
                        >
                           <td className="px-8 py-5 text-xs font-bold italic opacity-60">
                              {t.createdAt?.toDate?.() ? t.createdAt.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Pending Sync'}
                           </td>
                           <td className="px-8 py-5">
                              <Badge className="bg-primary/5 text-primary border-primary/20 uppercase font-black text-[10px] rounded-lg tracking-tight">
                                 {t.sessionType || 'General Purchase'}
                              </Badge>
                           </td>
                           <td className="px-8 py-5 text-xl font-black text-emerald-600 font-display">
                              ₹{(t.amountPaid || 0).toLocaleString()}
                           </td>
                           <td className="px-8 py-5 text-right font-mono text-[10px] font-black opacity-30 tracking-widest">
                              {t.paymentId || 'PAY_XXXX_XXXX'}
                           </td>
                        </motion.tr>
                      ))}
                   </AnimatePresence>
                </tbody>
             </table>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
