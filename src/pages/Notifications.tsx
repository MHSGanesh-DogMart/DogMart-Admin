import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, Send, Users, User, Clock, 
  CheckCircle, AlertCircle, Megaphone, Loader2,
  Zap, Info, Sparkles, MessageSquare, History,
  Search
} from "lucide-react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";

const TYPE_OPTIONS = [
  { value: 'announcement', label: '📢 Announcement', desc: 'Global ecosystem updates', color: 'primary' },
  { value: 'promotion', label: '🎉 Promotion', desc: 'Incentives and seasonal offers', color: 'emerald' },
  { value: 'maintenance', label: '🛠️ Maintenance', desc: 'Critical system downtime alerts', color: 'amber' },
  { value: 'general', label: '🔔 General', desc: 'Miscellaneous platform pings', color: 'indigo' },
];

interface NotificationHistory {
  id: string;
  title: string;
  body: string;
  type: string;
  createdAt: string;
  target?: string;
}

export default function Notifications() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('announcement');
  const [targetMode, setTargetMode] = useState<"all" | "user">('all');
  const [targetUserId, setTargetUserId] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchData = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const [usersRes, historyRes] = await Promise.all([
        api.get('/users'),
        api.get('/admin/notify/history')
      ]);
      setUsers(usersRes.data.users || []);
      setHistory(historyRes.data.notifications || []);
    } catch (e) {
      console.error(e);
      toast.error("Transmission logs unavailable");
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Payload incomplete");
      return;
    }
    setSending(true);
    try {
      const payload: any = { title, body, type };
      if (targetMode === 'user' && targetUserId) {
        payload.targetUserId = targetUserId;
      }
      const res = await api.post('/admin/notify', payload);
      const data = res.data;
      
      toast.success(targetMode === 'all' 
        ? `Broadcast deployed to ${data.fcmSent} endpoints` 
        : `Targeted ping delivered`);
      
      setTitle('');
      setBody('');
      setTargetUserId('');
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Transmission failure");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground font-display uppercase italic text-primary">Emission Center</h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-70">Direct-to-device broadcast and targeted user pings. 📡</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Compose Module */}
        <Card className="xl:col-span-7 rounded-[3rem] border-none shadow-premium bg-background overflow-hidden h-full">
           <div className="bg-primary/5 p-10 border-b border-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/20">
                    <Megaphone className="w-6 h-6" />
                 </div>
                 <h2 className="text-2xl font-black font-display tracking-tight uppercase">Compose Broadcast</h2>
              </div>
              <Badge className="bg-primary/10 text-primary border-none font-bold italic tracking-widest text-[9px] px-3">ENC: SECURE</Badge>
           </div>
           
           <CardContent className="p-10 space-y-8">
              <div className="space-y-6">
                 {/* Mode Toggle */}
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 px-1">Target Dimension</label>
                    <div className="flex gap-3 bg-muted/50 p-2 rounded-2xl border border-muted shadow-inner">
                       <Button 
                         variant={targetMode === "all" ? "default" : "ghost"}
                         onClick={() => setTargetMode("all")}
                         className={`flex-1 rounded-xl h-12 font-black uppercase tracking-widest text-[10px] gap-2 ${targetMode === "all" ? "bg-primary text-white" : ""}`}
                       >
                          <Users className="w-4 h-4" /> All Users
                       </Button>
                       <Button 
                         variant={targetMode === "user" ? "default" : "ghost"}
                         onClick={() => setTargetMode("user")}
                         className={`flex-1 rounded-xl h-12 font-black uppercase tracking-widest text-[10px] gap-2 ${targetMode === "user" ? "bg-primary text-white" : ""}`}
                       >
                          <User className="w-4 h-4" /> Specific Singularity
                       </Button>
                    </div>
                 </div>

                 {targetMode === "user" && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 px-1">Select User Singularity</label>
                       <Select value={targetUserId} onValueChange={setTargetUserId}>
                          <SelectTrigger className="h-14 rounded-2xl bg-muted border-none font-bold px-6 shadow-inner italic">
                             <SelectValue placeholder="Search target by ID/Email..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-premium font-bold italic text-sm p-2 max-h-64">
                             {users.map(u => (
                                <SelectItem key={u.id} value={u.id} className="rounded-xl">{u.name || 'Unknown Entity'} ({u.email})</SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                    </motion.div>
                 )}

                 {/* Type Selection */}
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 px-1">Payload Classification</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {TYPE_OPTIONS.map(opt => (
                          <div 
                            key={opt.value}
                            onClick={() => setType(opt.value)}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer group hover:-translate-y-1
                              ${type === opt.value ? 'bg-primary/5 border-primary shadow-soft' : 'bg-muted/30 border-transparent opacity-60 hover:opacity-100 hover:border-primary/20'}`}
                          >
                             <div className="font-black text-[11px] uppercase tracking-widest leading-none mb-1 group-hover:text-primary transition-colors">{opt.label}</div>
                             <div className="text-[9px] font-bold text-muted-foreground italic opacity-70">{opt.desc}</div>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Payload Details */}
                 <div className="space-y-6 pt-4 border-t border-muted/50">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 px-1">Headline Content</label>
                       <Input 
                         placeholder="e.g. 🎉 NEW FEATURES ONLINE" 
                         className="rounded-2xl h-14 bg-muted border-none font-black text-lg px-6 shadow-inner italic uppercase tracking-tight"
                         maxLength={80}
                         value={title}
                         onChange={e => setTitle(e.target.value)}
                       />
                       <div className="text-right text-[9px] font-black opacity-30 px-2 italic uppercase">{title.length}/80 CHARS</div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 px-1">Core Signal Transmission</label>
                       <Textarea 
                         placeholder="Detail the payload for direct emission to mobile devices..." 
                         className="rounded-2xl bg-muted border-none font-bold text-sm px-6 py-5 shadow-inner resize-none h-40 italic font-sans"
                         maxLength={200}
                         value={body}
                         onChange={e => setBody(e.target.value)}
                       />
                       <div className={`text-right text-[9px] font-black px-2 italic uppercase ${body.length > 180 ? 'text-destructive' : 'opacity-30'}`}>{200 - body.length} BITS REMAINING</div>
                    </div>
                 </div>
              </div>

              <Button 
                onClick={handleSend}
                disabled={sending || !title.trim() || !body.trim()}
                className="w-full h-16 rounded-[1.5rem] bg-primary text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/30 hover:scale-[1.01] transition-all gap-4"
              >
                 {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                 {sending ? "TRANSMITTING..." : "DEPLOY PUSH SIGNAL"}
              </Button>
           </CardContent>
        </Card>

        {/* Logs Module */}
        <Card className="xl:col-span-5 rounded-[3rem] border-none shadow-premium bg-background overflow-hidden h-full">
           <div className="bg-muted/30 p-10 border-b border-muted flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-border text-foreground flex items-center justify-center">
                 <History className="w-6 h-6 opacity-40" />
              </div>
              <div>
                 <h2 className="text-xl font-black font-display tracking-tight uppercase opacity-60">Transmission Logs</h2>
                 <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40 italic">Historical Audit Trail</p>
              </div>
           </div>

           <CardContent className="p-8 h-[700px] overflow-y-auto scrollbar-hide">
              <AnimatePresence mode="popLayout">
                 {loadingHistory ? (
                    Array(5).fill(0).map((_, i) => <div key={i} className="h-32 rounded-3xl bg-muted animate-pulse mb-4" />)
                 ) : history.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 uppercase font-black italic">
                       <MessageSquare className="w-12 h-12 mb-4" /> Static Signal / No History
                    </div>
                 ) : history.map((n, i) => (
                    <motion.div
                       key={n.id || i}
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: i * 0.05 }}
                       className="p-6 rounded-[2rem] bg-muted/20 border border-muted mb-6 group hover:border-primary/20 transition-all hover:bg-muted/40"
                    >
                       <div className="flex justify-between items-start mb-3">
                          <Badge variant="outline" className="rounded-lg h-5 text-[8px] font-black uppercase tracking-widest border-primary/20 text-primary opacity-60">{n.type || 'Announcement'}</Badge>
                          <span className="text-[9px] font-black opacity-20 uppercase tracking-tighter italic whitespace-nowrap">{format(new Date(n.createdAt), "dd MMM, HH:mm")}</span>
                       </div>
                       <h4 className="text-sm font-black uppercase tracking-tight text-foreground line-clamp-1">{n.title}</h4>
                       <p className="text-[11px] font-medium text-muted-foreground italic mt-2 line-clamp-2 leading-relaxed opacity-70">"{n.body}"</p>
                    </motion.div>
                 ))}
              </AnimatePresence>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
