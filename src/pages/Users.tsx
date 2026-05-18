import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search, User as UserIcon, Download, BadgeCheck
} from "lucide-react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface User {
  // Backend returns the Prisma primary key as `uid` (string after JSON serialization).
  // Older code used `id` — keep optional for backward-compat.
  uid: string;
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  isBlocked: boolean;
  isVerified?: boolean;
  createdAt?: string;
}

// Helper — works whether the API returns uid or id
const userKey = (u: User) => u.uid || u.id || '';

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data.users || []);
      setFiltered(res.data.users || []);
    } catch (e) {
      console.error("Failed to fetch users:", e);
      toast.error("Failed to load users from server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    let res = users;
    if (filter === "blocked") res = res.filter(u => u.isBlocked);
    if (filter === "active") res = res.filter(u => !u.isBlocked);
    if (search) {
      const s = search.toLowerCase();
      res = res.filter(u => 
        (u.name || "").toLowerCase().includes(s) || 
        (u.phone || "").includes(s) ||
        (u.email || "").toLowerCase().includes(s)
      );
    }
    setFiltered(res);
  }, [search, filter, users]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage access for all platform users.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl font-bold border-primary/20 hover:bg-primary/5">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button className="rounded-xl font-bold shadow-premium bg-primary text-primary-foreground hover:opacity-90">
            Add New User
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-soft overflow-hidden">
        <CardHeader className="pb-0 pt-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-muted/30 p-4 rounded-2xl border">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search by name, email, or phone..." 
                className="pl-10 bg-background border-none shadow-sm rounded-xl"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex bg-background border rounded-xl p-1 shadow-sm">
              {["all", "active", "blocked"].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filter === f ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
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
                    <th className="px-8 py-4 text-xs font-extrabold text-muted-foreground tracking-wider uppercase">User Profile</th>
                    <th className="px-8 py-4 text-xs font-extrabold text-muted-foreground tracking-wider uppercase">Contact Info</th>
                    <th className="px-8 py-4 text-xs font-extrabold text-muted-foreground tracking-wider uppercase">Status</th>
                    <th className="px-8 py-4 text-xs font-extrabold text-muted-foreground tracking-wider uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="h-64 text-center py-20">
                          <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <UserIcon className="w-12 h-12 opacity-20" />
                            <p className="font-bold">No users matches your criteria</p>
                          </div>
                        </td>
                      </tr>
                    ) : filtered.map((u, i) => (
                      <motion.tr 
                        key={userKey(u)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b hover:bg-muted/30 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/users/${userKey(u)}`)}
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner border border-primary/5">
                              {u.name?.[0]?.toUpperCase() || <UserIcon className="w-5 h-5" />}
                            </div>
                            <span className="font-bold text-sm tracking-tight">{u.name || "Unknown User"}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="text-sm font-medium">{u.email || "—"}</div>
                          <div className="text-[10px] text-muted-foreground font-bold tracking-tight uppercase mt-0.5">{u.phone || "No Phone"}</div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <Badge variant={u.isBlocked ? "destructive" : "success"} className="rounded-lg px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                              {u.isBlocked ? "Blocked" : "Active"}
                            </Badge>
                            {u.isVerified && (
                              <Badge variant="default" className="rounded-lg px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-sm bg-blue-500 text-white hover:bg-blue-600">
                                <BadgeCheck className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <Button variant="ghost" size="sm" className="rounded-lg font-bold group-hover:bg-primary group-hover:text-white transition-all underline underline-offset-4 decoration-primary/20 group-hover:decoration-white/20">
                            View Details
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

    </div>
  );
}
