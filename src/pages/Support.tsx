import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, CheckCircle, Clock, Trash2, Search, 
  Filter, Inbox, Reply, User, Calendar,
  MoreVertical, ShieldAlert, Loader2,
  CheckCircle2
} from "lucide-react";
import { db } from "@/firebase/config";
import { 
  collection, query, orderBy, onSnapshot, 
  doc, updateDoc, deleteDoc 
} from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  comment: string;
  status: 'read' | 'unread';
  createdAt: any;
}

export default function Support() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const q = query(
      collection(db, 'contact_messages'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
      } as ContactMessage));
      setMessages(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching support messages:", error);
      toast.error("CRM Sync Interrupted");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleMarkStatus = async (msg: ContactMessage) => {
    try {
      const newStatus = msg.status === 'unread' ? 'read' : 'unread';
      await updateDoc(doc(db, 'contact_messages', msg.id), { status: newStatus });
      toast.success(newStatus === 'read' ? "Marked as processed" : "Marked as pending");
    } catch (error) {
      toast.error("Status update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently archive this inquiry?")) return;
    try {
      await deleteDoc(doc(db, 'contact_messages', id));
      toast.success("Inquiry expunged from records");
    } catch (error) {
      toast.error("Deletion failed");
    }
  };

  const filtered = messages.filter(msg => {
    const matchesSearch = 
      msg.name?.toLowerCase().includes(search.toLowerCase()) ||
      msg.email?.toLowerCase().includes(search.toLowerCase()) ||
      msg.comment?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ? true : msg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground font-display uppercase italic text-primary flex items-center gap-3">
             Command Inbox <Badge className="bg-primary text-white border-none font-black h-6">{unreadCount}</Badge>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium font-sans">Manage user inquiries and community signals. 📩</p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 items-center bg-muted/10 p-4 rounded-[2.5rem] border border-muted-foreground/5 shadow-inner">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
               placeholder="Search signal stream..." 
               className="pl-12 h-12 bg-background border-none shadow-sm rounded-2xl font-bold italic"
               value={search}
               onChange={e => setSearch(e.target.value)}
            />
         </div>
         <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full xl:w-56 h-12 rounded-2xl bg-background border-none shadow-sm font-black uppercase text-[10px] tracking-widest px-6 italic">
               <SelectValue placeholder="All Signals" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-premium font-black uppercase text-[10px] p-2">
               <SelectItem value="all">ALL SIGNALS</SelectItem>
               <SelectItem value="unread">PENDING</SelectItem>
               <SelectItem value="read">PROCESSED</SelectItem>
            </SelectContent>
         </Select>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
           {loading ? (
              Array(3).fill(0).map((_, i) => <div key={i} className="h-48 rounded-[2.5rem] bg-muted animate-pulse border-none shadow-premium" />)
           ) : filtered.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center opacity-20 uppercase font-black italic">
                 <Inbox className="w-16 h-16 mb-4" /> Frequency Silent / No Messages
              </div>
           ) : filtered.map((msg, i) => (
             <motion.div
               key={msg.id}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.05 }}
               className={`group flex flex-col md:flex-row gap-8 rounded-[2.5rem] p-8 transition-all duration-500 overflow-hidden relative
                 ${msg.status === 'unread' ? 'bg-background hover:shadow-2xl border-2 border-primary/10' : 'bg-muted/30 grayscale opacity-60'}`}
             >
                <div className="flex-1 space-y-4">
                   <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${msg.status === 'unread' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-muted text-muted-foreground'}`}>
                            {msg.name.charAt(0).toUpperCase()}
                         </div>
                         <div>
                            <h3 className="text-xl font-black font-display tracking-tight text-foreground uppercase flex items-center gap-2">
                               {msg.name}
                               {msg.status === 'unread' && <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />}
                            </h3>
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">
                               <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {msg.email}</span>
                               {msg.phone && <span className="opacity-50">• {msg.phone}</span>}
                               <span className="opacity-50">• {msg.createdAt && !isNaN(msg.createdAt.getTime()) ? format(msg.createdAt, "dd MMM yyyy, HH:mm") : "Date Pending"}</span>
                            </div>
                         </div>
                      </div>
                      <div className="hidden md:flex gap-2">
                         <Button 
                           variant="outline" 
                           className={`rounded-xl font-black uppercase tracking-widest text-[9px] h-9 gap-2 transition-all ${msg.status === 'unread' ? 'bg-emerald-500/10 text-emerald-600 border-none' : ''}`}
                           onClick={() => handleMarkStatus(msg)}
                         >
                            {msg.status === 'unread' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            {msg.status === 'unread' ? "Resolve" : "Re-queue"}
                         </Button>
                         <Button 
                           variant="ghost" 
                           onClick={() => handleDelete(msg.id)}
                           className="rounded-xl w-9 h-9 p-0 bg-muted hover:bg-destructive hover:text-white"
                         >
                            <Trash2 className="w-3.5 h-3.5" />
                         </Button>
                      </div>
                   </div>

                   <div className="p-6 rounded-[1.5rem] bg-muted/40 border border-muted text-sm font-medium leading-relaxed italic text-foreground/80 relative group-hover:bg-muted/60 transition-colors">
                      "{msg.comment}"
                      <Reply className="absolute top-4 right-4 w-4 h-4 opacity-10 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-primary" onClick={() => window.location.href=`mailto:${msg.email}?subject=PetSaathi Support Response`} />
                   </div>
                </div>
             </motion.div>
           ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
