import { motion } from "framer-motion";
import { 
  Users, TrendingUp, ShoppingBag, CalendarDays, 
  AlertTriangle, ArrowUpRight, TrendingDown,
  Clock, CheckCircle, Package, MessageSquare
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";

const data = [
  { day: "Mon", earnings: 4500, users: 400 },
  { day: "Tue", earnings: 5200, users: 300 },
  { day: "Wed", earnings: 4800, users: 500 },
  { day: "Thu", earnings: 6100, users: 200 },
  { day: "Fri", earnings: 5900, users: 600 },
  { day: "Sat", earnings: 7200, users: 400 },
  { day: "Sun", earnings: 6800, users: 700 },
];


const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statsCards = [
    { label: "Total Users", value: stats?.users || 0, icon: Users, color: "text-blue-500", trend: "+12%", up: true },
    { label: "Active Pets", value: stats?.activePets || 0, icon: TrendingUp, color: "text-orange-500", trend: "+5%", up: true },
    { label: "Active Products", value: stats?.activeProducts || 0, icon: ShoppingBag, color: "text-green-500", trend: "+18%", up: true },
    { label: "Subscriptions", value: stats?.subs || 0, icon: CalendarDays, color: "text-purple-500", trend: "+2%", up: true },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time insights into your pet care ecosystem.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium">Last updated</p>
            <p className="text-xs text-muted-foreground">Today at 05:40 AM</p>
          </div>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold shadow-premium hover:opacity-90 transition-opacity">
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-soft hover:shadow-premium transition-all duration-300 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                )}
                <div className={`flex items-center text-xs mt-1 text-muted-foreground/60 italic`}>
                  Live database count
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-soft overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Earnings Analytics</CardTitle>
              <p className="text-sm text-muted-foreground">Weekly revenue performance in ₹</p>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: "hsl(var(--background))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)"
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorEarnings)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Queue Moderation</CardTitle>
              <p className="text-sm text-muted-foreground">Listings awaiting review.</p>
            </div>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
              {stats?.pendingModeration || 0} Pending Items
            </span>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-12 h-12 rounded-xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                ))
              ) : stats?.recentPending && stats.recentPending.length > 0 ? (
                stats.recentPending.map((listing: any, i: number) => (
                  <div key={listing.id} className="flex items-center justify-between group cursor-pointer hover:bg-muted/50 p-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden">
                        <img 
                          src={listing.images?.[0] || `https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=150&h=150`} 
                          alt="pet" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-sm tracking-tight">{listing.breed || listing.title}</p>
                        <p className="text-[10px] font-black uppercase text-muted-foreground opacity-60">₹{(listing.price || 0).toLocaleString()} • {listing.city}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-lg tracking-widest uppercase">Awaiting</span>
                      <Link to="/moderation" className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                   <CheckCircle className="w-10 h-10 mb-2" />
                   <p className="text-xs font-bold uppercase tracking-widest">Queue Clear</p>
                </div>
              )}
            </div>
            <Link to="/moderation" className="block w-full text-center mt-6 py-2 text-xs font-black uppercase text-primary hover:underline tracking-widest">
              Review Full Moderation Queue →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
