import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, Trash2, CheckCheck, AlertTriangle, 
  ShieldOff, ShieldCheck, Filter, Search,
  MessageSquare, Flag, Eye, EyeOff, Loader2,
  CheckCircle2, AlertCircle, User, Clock
} from "lucide-react";
import { db } from "@/firebase/config";
import { 
  collection, getDocs, doc, updateDoc, 
  deleteDoc, orderBy, query, onSnapshot 
} from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format } from "date-fns";

interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewerId: string;
  reviewerName?: string;
  sellerId: string;
  isFlagged: boolean;
  createdAt: any;
}

interface Report {
  id: string;
  listingId: string;
  reporterId: string;
  reason: string;
  description: string;
  status: 'pending' | 'resolved';
  actionTaken?: string;
  createdAt: any;
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star 
        key={s} 
        className={`w-4 h-4 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`} 
      />
    ))}
  </div>
);

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("reviews");

  useEffect(() => {
    setLoading(true);
    const qRev = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const qRep = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));

    const unsubRev = onSnapshot(qRev, (snap) => {
      setReviews(snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date(d.data().createdAt)
      } as Review)));
      setLoading(false);
    });

    const unsubRep = onSnapshot(qRep, (snap) => {
      setReports(snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date(d.data().createdAt)
      } as Report)));
    });

    return () => { unsubRev(); unsubRep(); };
  }, []);

  const handleAcknowledgeReview = async (id: string) => {
    try {
      await updateDoc(doc(db, 'reviews', id), { isFlagged: false });
      toast.success("Review verified");
    } catch (e) {
      toast.error("Action failed");
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Permanently incinerate this review?")) return;
    try {
      await deleteDoc(doc(db, 'reviews', id));
      toast.success("Review record expunged");
    } catch (e) {
      toast.error("Critical failure during deletion");
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      await updateDoc(doc(db, 'reports', reportId), { status: 'resolved' });
      toast.success("Report dismissed");
    } catch (e) {
      toast.error("Status update aborted");
    }
  };

  const handleTakeDownListing = async (listingId: string, reportId: string) => {
    if (!confirm("Exec takedown protocol for this listing?")) return;
    try {
      await updateDoc(doc(db, 'listings', listingId), { 
        status: 'rejected', 
        adminNote: 'Decommissioned via Administrative Takedown Protocol (User Reports).' 
      });
      await updateDoc(doc(db, 'reports', reportId), { 
        status: 'resolved', 
        actionTaken: 'Listing Terminated' 
      });
      toast.success("Listing neutralised");
    } catch (e) {
      toast.error("Neutralisation failed");
    }
  };

  const flaggedCount = reviews.filter(r => r.isFlagged).length;
  const pendingReports = reports.filter(r => r.status !== 'resolved').length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground font-display uppercase italic text-primary">Moderation Grid</h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-70">Monitor community feedback and marketplace integrity. 🛡️</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="bg-muted/10 p-4 rounded-[2.5rem] border border-muted-foreground/5 shadow-inner inline-flex">
          <TabsList className="bg-transparent h-auto p-0 flex gap-4">
             <TabsTrigger 
               value="reviews" 
               className="rounded-2xl px-10 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-3"
             >
                <Star className="w-3.5 h-3.5" /> Buyer Feedback
                {flaggedCount > 0 && <Badge className="bg-amber-500 text-white border-none h-5 px-1.5 animate-pulse">{flaggedCount}</Badge>}
             </TabsTrigger>
             <TabsTrigger 
               value="reports" 
               className="rounded-2xl px-10 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-destructive data-[state=active]:text-white transition-all gap-3"
             >
                <Flag className="w-3.5 h-3.5" /> Conflict Reports
                {pendingReports > 0 && <Badge className="bg-white text-destructive border-none h-5 px-1.5">{pendingReports}</Badge>}
             </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="reviews" className="animate-in fade-in zoom-in-95 duration-500 m-0">
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                 {loading ? (
                    Array(3).fill(0).map((_, i) => <div key={i} className="h-64 rounded-[3rem] bg-muted animate-pulse" />)
                 ) : reviews.length === 0 ? (
                    <div className="col-span-full h-80 flex flex-col items-center justify-center opacity-10 uppercase font-black italic">
                       <MessageSquare className="w-16 h-16 mb-4" /> Signal Lost / No Feedback
                    </div>
                 ) : reviews.map((rev, i) => (
                    <motion.div
                       key={rev.id}
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       transition={{ delay: i * 0.05 }}
                       className={`group rounded-[3rem] p-8 transition-all duration-500 relative bg-background border-none shadow-premium hover:shadow-2xl overflow-hidden
                         ${rev.isFlagged ? 'ring-4 ring-amber-500/20' : ''}`}
                    >
                       <div className="flex justify-between items-start mb-6">
                          <StarRating rating={rev.rating} />
                          {rev.isFlagged && <Badge className="bg-amber-500 text-white border-none font-black italic text-[8px] animate-pulse">FLAGGED</Badge>}
                       </div>

                       <div className="space-y-4">
                          <p className="text-sm font-bold italic leading-relaxed text-foreground/80 line-clamp-3">
                             "{rev.comment || 'No textual feedback provided.'}"
                          </p>
                          
                          <div className="pt-6 border-t border-muted/50 flex flex-col gap-1">
                             <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                <User className="w-3 h-3" /> {rev.reviewerName || 'Anonymous Human'}
                             </div>
                             <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-40 italic">
                                <Clock className="w-3 h-3" /> {format(rev.createdAt, "dd MMM yyyy")} • ID: {rev.id.slice(0, 8)}
                             </div>
                          </div>

                          <div className="pt-4 flex gap-2">
                             {rev.isFlagged && (
                                <Button 
                                  variant="ghost" 
                                  className="flex-1 rounded-xl h-9 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white font-black text-[9px] uppercase tracking-widest"
                                  onClick={() => handleAcknowledgeReview(rev.id)}
                                >
                                   Verify
                                </Button>
                             )}
                             <Button 
                               variant="ghost" 
                               className="rounded-xl w-9 h-9 p-0 bg-muted/50 hover:bg-destructive hover:text-white"
                               onClick={() => handleDeleteReview(rev.id)}
                             >
                                <Trash2 className="w-4 h-4" />
                             </Button>
                          </div>
                       </div>
                    </motion.div>
                 ))}
              </AnimatePresence>
           </div>
        </TabsContent>

        <TabsContent value="reports" className="animate-in fade-in zoom-in-95 duration-500 m-0">
           <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                 {reports.length === 0 ? (
                    <div className="h-80 flex flex-col items-center justify-center opacity-10 uppercase font-black italic bg-background rounded-[3rem] shadow-premium">
                       <ShieldCheck className="w-16 h-16 mb-4 text-emerald-500" /> Integrity Intact / No Reports
                    </div>
                 ) : reports.map((rep, i) => (
                    <motion.div
                       key={rep.id}
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: i * 0.05 }}
                       className={`group rounded-[3rem] p-8 flex flex-col md:flex-row gap-8 transition-all duration-500 relative bg-background border-none shadow-premium
                         ${rep.status === 'pending' ? 'ring-4 ring-destructive/10' : 'opacity-40 grayscale blur-[0.5px]'}`}
                    >
                       <div className="flex-1 space-y-4">
                          <div className="flex justify-between items-start">
                             <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl shadow-destructive/20 ${rep.status === 'pending' ? 'bg-destructive text-white' : 'bg-muted text-muted-foreground'}`}>
                                   <AlertTriangle className="w-7 h-7" />
                                </div>
                                <div>
                                   <h3 className="text-xl font-black font-display tracking-tight text-foreground uppercase">{rep.reason || 'Sovereign Violation'}</h3>
                                   <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mt-1 italic">
                                      <span>Target Listing: {rep.listingId}</span>
                                      <span>Reporter: {rep.reporterId.slice(0, 12)}</span>
                                      <span>{format(rep.createdAt, "dd MMM yyyy, HH:mm")}</span>
                                   </div>
                                </div>
                             </div>
                             <Badge variant={rep.status === 'resolved' ? "secondary" : "destructive"} className="rounded-xl h-6 font-black tracking-widest text-[9px]">
                                {rep.status === 'resolved' ? "NEUTRALISED" : "CRITICAL"}
                             </Badge>
                          </div>

                          <div className="p-6 rounded-[2rem] bg-muted/40 border border-muted text-xs font-bold leading-relaxed italic text-foreground opacity-80 uppercase tracking-tighter shadow-inner">
                             "{rep.description || 'No descriptive context provided.'}"
                          </div>
                       </div>

                       <div className="flex flex-row md:flex-col gap-3 justify-center">
                          {rep.status !== 'resolved' && (
                             <>
                                <Button 
                                  variant="destructive" 
                                  className="rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl shadow-destructive/20"
                                  onClick={() => handleTakeDownListing(rep.listingId, rep.id)}
                                >
                                   <ShieldOff className="w-4 h-4" /> Shutdown Listing
                                </Button>
                                <Button 
                                  variant="outline" 
                                  className="rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest border-2"
                                  onClick={() => handleResolveReport(rep.id)}
                                >
                                   Ignore Report
                                </Button>
                             </>
                          )}
                          {rep.actionTaken && (
                             <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-500/10 px-4 py-2 rounded-xl italic">
                                <CheckCircle2 className="w-3 h-3" /> {rep.actionTaken}
                             </div>
                          )}
                       </div>
                    </motion.div>
                 ))}
              </AnimatePresence>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
