import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, User, Bell, Sliders, 
  Settings as SettingsIcon, Save, 
  Lock, Phone, Mail, Globe,
  ShieldCheck, Info, Zap, Loader2,
  AlertCircle
} from "lucide-react";
import api from "@/lib/api";
import { auth } from "@/firebase/config";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface AppSettings {
  listingExpiryDays: number;
  supportPhone: string;
  supportEmail: string;
}

export default function Settings() {
  const [profile, setProfile] = useState({ name: 'Admin', bio: 'Platform Administrator' });
  const [appSettings, setAppSettings] = useState<AppSettings>({
    listingExpiryDays: 30,
    supportPhone: '+91 00000 00000',
    supportEmail: 'hemanthtech517@gmail.com'
  });
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get('/settings');
      if (res.data.settings) {
        setAppSettings({
          listingExpiryDays: Number(res.data.settings.listingExpiryDays || 30),
          supportPhone: res.data.settings.supportPhone || '+91 00000 00000',
          supportEmail: res.data.settings.supportEmail || 'hemanthtech517@gmail.com'
        });
      }
    } catch (e) {
      console.error("Settings retrieval failure", e);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await api.put('/settings', { settings: appSettings });
      toast.success("Platform configuration synchronized");
    } catch (e) {
      toast.error("Handshake failed with core API");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (pwd.newPwd !== pwd.confirm) {
      toast.error("Protocol Mismatch: Passwords do not align");
      return;
    }
    if (pwd.newPwd.length < 8) {
      toast.error("Entropy Low: Minimum 8 characters required");
      return;
    }
    setChangingPwd(true);
    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error("Null identity");
      const cred = EmailAuthProvider.credential(user.email, pwd.current);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, pwd.newPwd);
      toast.success("Security coordinates rotated");
      setPwd({ current: '', newPwd: '', confirm: '' });
    } catch (e: any) {
      toast.error(e.message || "Authentication denied");
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground font-display uppercase italic text-primary">System Core</h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-70">Calibrate platform parameters and security protocols. ⚙️</p>
        </div>
        <Button 
          onClick={handleSaveSettings}
          disabled={saving}
          className="rounded-2xl font-black bg-primary text-white shadow-2xl shadow-primary/30 h-14 px-8 hover:scale-[1.02] transition-all"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
          Commit Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Visual Identity Section */}
        <section className="space-y-6">
           <div className="flex items-center gap-4 px-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><User className="w-5 h-5" /></div>
              <h2 className="text-xl font-black uppercase tracking-widest italic opacity-80">Administrative Identity</h2>
           </div>
           <Card className="rounded-[3rem] border-none shadow-premium bg-background p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 italic">Canonical Name</label>
                    <Input className="rounded-2xl h-14 bg-muted border-none font-bold text-lg px-6 shadow-inner" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 italic">Public Bio / Role</label>
                    <Input className="rounded-2xl h-14 bg-muted border-none font-bold italic px-6 shadow-inner" value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 italic">NOC Support Phone</label>
                    <div className="relative">
                       <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
                       <Input className="pl-14 rounded-2xl h-14 bg-muted border-none font-black text-lg shadow-inner" value={appSettings.supportPhone} onChange={e => setAppSettings(a => ({ ...a, supportPhone: e.target.value }))} />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 italic">NOC Support Email</label>
                    <div className="relative">
                       <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
                       <Input className="pl-14 rounded-2xl h-14 bg-muted border-none font-black text-lg shadow-inner" value={appSettings.supportEmail} onChange={e => setAppSettings(a => ({ ...a, supportEmail: e.target.value }))} />
                    </div>
                 </div>
              </div>
           </Card>
        </section>

        {/* Global Parameters Section */}
        <section className="space-y-6">
           <div className="flex items-center gap-4 px-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center"><Sliders className="w-5 h-5" /></div>
              <h2 className="text-xl font-black uppercase tracking-widest italic opacity-80">Economic Constraints</h2>
           </div>
           <Card className="rounded-[3rem] border-none shadow-premium bg-background p-10 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none text-9xl font-black italic uppercase">FINANCE</div>
              <div className="grid grid-cols-1 gap-8 relative z-10">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 italic">Expiry Horizon (Days)</label>
                    <Input type="number" className="rounded-2xl h-16 bg-muted border-none font-black text-3xl text-amber-600 text-center shadow-inner" value={appSettings.listingExpiryDays} onChange={e => setAppSettings(a => ({ ...a, listingExpiryDays: Number(e.target.value) }))} />
                    <p className="text-[9px] font-medium text-center opacity-40 uppercase tracking-tighter">Automatic cache invalidation</p>
                 </div>
              </div>
           </Card>
        </section>

        {/* Security Vault Section */}
        <section className="space-y-6">
           <div className="flex items-center gap-4 px-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center"><Shield className="w-5 h-5" /></div>
              <h2 className="text-xl font-black uppercase tracking-widest italic opacity-80">Security Protocol</h2>
           </div>
           <Card className="rounded-[3rem] border-none shadow-premium bg-background p-12 space-y-8">
              <div className="flex items-center gap-4 p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10">
                 <Lock className="w-6 h-6 text-amber-600 animate-pulse" />
                 <div>
                    <h4 className="text-sm font-black uppercase tracking-tight italic">Rotation Protocol</h4>
                    <p className="text-[10px] font-bold text-muted-foreground opacity-60 italic">Update your administrative credentials immediately if compromise is suspected.</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                 <div className="space-y-2 col-span-full">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Active Password</label>
                    <Input type="password" placeholder="••••••••" className="rounded-2xl h-14 bg-muted border-none px-6 shadow-inner font-mono" value={pwd.current} onChange={e => setPwd(f => ({ ...f, current: e.target.value }))} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">New Sequence</label>
                    <Input type="password" placeholder="Minimum 8 characters" className="rounded-2xl h-14 bg-muted border-none px-6 shadow-inner font-mono" value={pwd.newPwd} onChange={e => setPwd(f => ({ ...f, newPwd: e.target.value }))} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Confirm Sequence</label>
                    <Input type="password" placeholder="••••••••" className="rounded-2xl h-14 bg-muted border-none px-6 shadow-inner font-mono" value={pwd.confirm} onChange={e => setPwd(f => ({ ...f, confirm: e.target.value }))} />
                 </div>
              </div>

              <div className="pt-6 border-t border-muted/50 flex justify-between items-center">
                 <div className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Identity: {auth.currentUser?.email}</div>
                 <Button 
                   onClick={handleUpdatePassword} 
                   disabled={changingPwd || !pwd.current || !pwd.newPwd}
                   variant="outline"
                   className="rounded-xl border-2 font-black uppercase text-[10px] h-10 px-6 gap-2"
                 >
                    {changingPwd ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                    Initiate Rotation
                 </Button>
              </div>
           </Card>
        </section>
      </div>
    </div>
  );
}
