import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Trash2, ShoppingBag, PawPrint, Wrench,
  BadgeCheck, ShieldOff, ShieldCheck, Loader2, User as UserIcon,
  Phone, Mail, AtSign, Calendar
} from "lucide-react";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";

interface User {
  uid: string;
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  isBlocked: boolean;
  isVerified?: boolean;
  createdAt?: string;
  authProvider?: string;
  gender?: string;
}
interface InventoryItem {
  id: string;
  title?: string;
  name?: string;
  price?: number;
  sellingPrice?: number | null;
  mrp?: number | null;
  images?: string[];
  status?: string;
  views?: number;
  contactCount?: number;
}
interface UserInventory {
  pets: InventoryItem[];
  services: InventoryItem[];
  products: InventoryItem[];
}

/// Full-page admin view of a single user. Replaces the previous dialog so
/// the admin has more room to audit listings and take actions.
export default function UserDetail() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [inventory, setInventory] = useState<UserInventory>({ pets: [], services: [], products: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const [userRes, invRes] = await Promise.all([
        api.get(`/users/admin/${uid}`),
        api.get(`/listings/user/${uid}/everything`),
      ]);
      setUser(userRes.data.user || userRes.data);
      setInventory({
        pets: invRes.data.pets || [],
        services: invRes.data.services || [],
        products: invRes.data.products || [],
      });
    } catch (e) {
      console.error('Failed to load user:', e);
      toast.error('Failed to load user.');
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleToggleBlock = async () => {
    if (!user) return;
    setBusy(true);
    try {
      await api.patch(`/users/${uid}/status`, { isBlocked: !user.isBlocked });
      toast.success(user.isBlocked ? 'User unblocked' : 'User suspended');
      fetchAll();
    } catch (e) {
      toast.error('Action failed');
    } finally {
      setBusy(false);
    }
  };

  const handleToggleVerified = async () => {
    if (!user) return;
    setBusy(true);
    try {
      await api.patch(`/users/${uid}/status`, { isVerified: !user.isVerified });
      toast.success(user.isVerified ? 'Verification removed' : 'Marked as verified');
      fetchAll();
    } catch (e) {
      toast.error('Action failed');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    if (!window.confirm(`Delete ${user.name || 'this user'} and ALL their data permanently?\n\nThis removes their Firebase login, every listing, every review they gave or received, bookings, messages — everything.`)) return;
    setBusy(true);
    try {
      await api.delete(`/users/${uid}`);
      toast.success('User deleted');
      navigate('/users');
    } catch (e) {
      toast.error('Delete failed');
      setBusy(false);
    }
  };

  const handleDeleteItem = async (kind: 'pet' | 'service' | 'product', id: string) => {
    if (!window.confirm(`Permanently delete this ${kind}? This can't be undone.`)) return;
    setDeletingItemId(id);
    try {
      const endpoint = kind === 'product' ? `/products/${id}` : `/listings/${id}`;
      await api.delete(endpoint);
      toast.success(`${kind} deleted.`);
      fetchAll();
    } catch (e) {
      toast.error('Failed to delete.');
    } finally {
      setDeletingItemId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <UserIcon className="w-12 h-12 opacity-20" />
        <p className="font-bold">User not found</p>
        <Button onClick={() => navigate('/users')} variant="outline">Back to Users</Button>
      </div>
    );
  }

  const totalListings = inventory.pets.length + inventory.services.length + inventory.products.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/users')} className="rounded-xl">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Users
        </Button>
      </div>

      {/* Profile card */}
      <Card className="border-none shadow-soft overflow-hidden">
        <div className="bg-primary h-24 relative">
          <div className="absolute -bottom-12 left-8 w-24 h-24 rounded-3xl bg-background p-1 shadow-xl">
            <div className="w-full h-full rounded-2xl bg-muted flex items-center justify-center text-primary text-3xl font-black border border-primary/5">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>
        <CardContent className="pt-16 px-8 pb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black tracking-tight">{user.name || 'Platform User'}</h1>
                {user.isVerified && (
                  <Badge className="bg-blue-500 text-white rounded-lg">
                    <BadgeCheck className="w-3 h-3 mr-1" /> Verified
                  </Badge>
                )}
                <Badge variant={user.isBlocked ? 'destructive' : 'success'} className="rounded-lg uppercase">
                  {user.isBlocked ? 'Blocked' : 'Active'}
                </Badge>
              </div>
              <p className="text-muted-foreground">User ID: {uid}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleToggleVerified} disabled={busy} variant={user.isVerified ? 'outline' : 'default'} className="rounded-xl">
                <BadgeCheck className="w-4 h-4 mr-2" />
                {user.isVerified ? 'Remove Verification' : 'Mark Verified'}
              </Button>
              <Button onClick={handleToggleBlock} disabled={busy} variant={user.isBlocked ? 'success' : 'destructive'} className="rounded-xl">
                {user.isBlocked ? <ShieldCheck className="w-4 h-4 mr-2" /> : <ShieldOff className="w-4 h-4 mr-2" />}
                {user.isBlocked ? 'Unblock' : 'Suspend'}
              </Button>
              <Button onClick={handleDeleteUser} disabled={busy} variant="outline" className="rounded-xl border-red-200 text-red-500 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-2" /> Delete User
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Stat icon={<Phone className="w-4 h-4" />} label="Phone" value={user.phone || '—'} />
            <Stat icon={<AtSign className="w-4 h-4" />} label="Email" value={user.email || '—'} />
            <Stat icon={<UserIcon className="w-4 h-4" />} label="Auth" value={user.authProvider || 'email'} />
            <Stat icon={<Calendar className="w-4 h-4" />} label="Joined" value={user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '—'} />
          </div>
        </CardContent>
      </Card>

      {/* Inventory */}
      <Card className="border-none shadow-soft">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black">User's Inventory</h2>
            <span className="text-sm text-muted-foreground font-bold">
              {totalListings} {totalListings === 1 ? 'item' : 'items'} total
            </span>
          </div>
          {totalListings === 0 ? (
            <p className="text-sm text-muted-foreground italic py-8 text-center">
              This user has no listings yet.
            </p>
          ) : (
            <div className="space-y-6">
              <InventoryGroup
                label="Pets"
                icon={<PawPrint className="w-4 h-4" />}
                items={inventory.pets}
                onDelete={(id) => handleDeleteItem('pet', id)}
                deletingId={deletingItemId}
              />
              <InventoryGroup
                label="Services"
                icon={<Wrench className="w-4 h-4" />}
                items={inventory.services}
                onDelete={(id) => handleDeleteItem('service', id)}
                deletingId={deletingItemId}
              />
              <InventoryGroup
                label="Products"
                icon={<ShoppingBag className="w-4 h-4" />}
                items={inventory.products}
                onDelete={(id) => handleDeleteItem('product', id)}
                deletingId={deletingItemId}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-4 rounded-2xl bg-muted/40 border border-muted-foreground/5">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <p className="text-[10px] uppercase font-black tracking-widest">{label}</p>
      </div>
      <p className="font-bold text-sm truncate">{value}</p>
    </div>
  );
}

function InventoryGroup({
  label, icon, items, onDelete, deletingId,
}: {
  label: string;
  icon: React.ReactNode;
  items: InventoryItem[];
  onDelete: (id: string) => void;
  deletingId: string | null;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-primary">{icon}</span>
        <span className="text-xs font-extrabold uppercase tracking-wider">
          {label} ({items.length})
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map(item => {
          const title = item.title || item.name || 'Untitled';
          const price = item.sellingPrice ?? item.mrp ?? item.price ?? 0;
          const thumb = item.images?.[0];
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-muted-foreground/5"
            >
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {thumb ? (
                  <img src={thumb} alt={title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    No img
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{title}</p>
                <p className="text-xs text-muted-foreground">
                  ₹{Number(price).toFixed(0)}
                  {item.views !== undefined && ` · ${item.views} views`}
                  {item.contactCount !== undefined && ` · ${item.contactCount} contacts`}
                </p>
                {item.status && (
                  <Badge variant={item.status === 'active' ? 'success' : 'secondary'} className="rounded-md uppercase text-[9px] font-bold mt-1">
                    {item.status}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={deletingId === item.id}
                onClick={() => onDelete(item.id)}
                className="rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                {deletingId === item.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
