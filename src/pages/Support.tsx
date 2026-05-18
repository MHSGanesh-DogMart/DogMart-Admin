import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, CheckCircle2, Inbox, Reply, User as UserIcon,
  Loader2, AlertCircle, Search
} from "lucide-react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";

// SupportTicket comes from POST /api/support — fired by the Flutter app's
// Help & Support → "Message Admin Directly" form.
interface SupportUser {
  uid: number;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}
interface Ticket {
  id: number;
  userId: number;
  subject: string;
  message: string;
  status: 'open' | 'resolved' | 'closed';
  adminReply: string | null;
  createdAt: string;
  updatedAt: string;
  user: SupportUser | null;
}

export default function Support() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved' | 'closed'>('all');
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/support');
      setTickets(res.data.tickets || []);
    } catch (e) {
      console.error('Failed to fetch tickets:', e);
      toast.error('Failed to load support tickets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const filtered = tickets.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      t.subject.toLowerCase().includes(s) ||
      t.message.toLowerCase().includes(s) ||
      (t.user?.name || '').toLowerCase().includes(s) ||
      (t.user?.email || '').toLowerCase().includes(s)
    );
  });

  const openCount = tickets.filter(t => t.status === 'open').length;

  const handleSendReply = async () => {
    if (!selected || !replyText.trim()) return;
    setSending(true);
    try {
      await api.put(`/support/${selected.id}`, {
        adminReply: replyText.trim(),
        status: 'resolved',
      });
      toast.success('Reply sent. User has been notified.');
      setReplyText('');
      setSelected(null);
      fetchTickets();
    } catch (e) {
      console.error('Reply failed:', e);
      toast.error('Failed to send reply.');
    } finally {
      setSending(false);
    }
  };

  const handleMarkStatus = async (ticket: Ticket, status: 'open' | 'resolved' | 'closed') => {
    try {
      await api.put(`/support/${ticket.id}`, { status });
      toast.success(`Marked as ${status}`);
      fetchTickets();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">
            Messages from users sent via the app's "Message Admin Directly" form.
            {openCount > 0 && (
              <span className="ml-2 font-bold text-primary">
                {openCount} open
              </span>
            )}
          </p>
        </div>
      </div>

      <Card className="border-none shadow-soft">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-muted/30 p-4 rounded-2xl border">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search subject, message, or user..."
                className="pl-10 bg-background border-none shadow-sm rounded-xl"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex bg-background border rounded-xl p-1 shadow-sm">
              {(['all', 'open', 'resolved', 'closed'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === f
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Inbox className="w-12 h-12 opacity-20" />
              <p className="font-bold">No tickets match your filter</p>
            </div>
          ) : (
            <AnimatePresence>
              {filtered.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-4 p-4 rounded-2xl border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
                  onClick={() => { setSelected(t); setReplyText(t.adminReply || ''); }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm truncate">{t.subject}</span>
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {t.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                      <UserIcon className="w-3 h-3 inline mr-1" />
                      {t.user?.name || `User #${t.userId}`}
                      {t.user?.phone && ` · ${t.user.phone}`}
                      <span className="mx-1">·</span>
                      {format(new Date(t.createdAt), 'MMM d, HH:mm')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </CardContent>
      </Card>

      {/* Reply dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-xl rounded-3xl">
          <DialogHeader>
            <DialogTitle>{selected?.subject}</DialogTitle>
            <p className="text-xs text-muted-foreground font-medium pt-1">
              From {selected?.user?.name || `User #${selected?.userId}`}
              {selected?.user?.phone && ` · ${selected.user.phone}`}
              {selected?.user?.email && ` · ${selected.user.email}`}
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/40 border whitespace-pre-wrap text-sm">
              {selected?.message}
            </div>
            {selected?.adminReply && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-xs font-bold text-primary mb-1">YOUR PREVIOUS REPLY</p>
                <p className="text-sm whitespace-pre-wrap">{selected.adminReply}</p>
              </div>
            )}
            <Textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Type your reply… The user will get a push notification."
              rows={4}
              maxLength={2000}
            />
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            {selected?.status !== 'closed' && (
              <Button
                variant="outline"
                onClick={() => selected && handleMarkStatus(selected, 'closed')}
                className="rounded-xl"
              >
                Close ticket
              </Button>
            )}
            <Button
              onClick={handleSendReply}
              disabled={sending || !replyText.trim()}
              className="rounded-xl"
            >
              {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Reply className="w-4 h-4 mr-2" />}
              {sending ? 'Sending…' : 'Send Reply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: 'open' | 'resolved' | 'closed' }) {
  if (status === 'open') {
    return <Badge variant="destructive" className="rounded-md uppercase text-[10px] font-black"><AlertCircle className="w-3 h-3 mr-1" />Open</Badge>;
  }
  if (status === 'resolved') {
    return <Badge variant="success" className="rounded-md uppercase text-[10px] font-black"><CheckCircle2 className="w-3 h-3 mr-1" />Resolved</Badge>;
  }
  return <Badge variant="secondary" className="rounded-md uppercase text-[10px] font-black">Closed</Badge>;
}
