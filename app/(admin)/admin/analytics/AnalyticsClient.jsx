'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { readNestJson } from '@/lib/api/readJson';
import { AdminPageHeader } from '@/components/admin/shared/AdminPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { 
  BarChart3, 
  Users, 
  Eye, 
  MousePointer2, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  AlertCircle
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';

const StatCard = ({ title, value, change, icon: Icon, description }) => (
  <Card className="overflow-hidden border-none shadow-md bg-card/50 backdrop-blur-sm">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-xs font-medium ${change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {change >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="text-2xl font-bold mt-1 tracking-tight">{value}</div>
        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
          {description}
        </p>
      </div>
    </CardContent>
  </Card>
);

export default function AnalyticsClient() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const token = await user.getIdToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/vercel/analytics?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
            if (res.status === 404) throw new Error('Vercel API endpoint not found. Please ensure backend is updated.');
            throw new Error('Failed to fetch analytics data');
        }

        const result = await readNestJson(res);
        if (!result) {
          setError('Vercel credentials not configured in Settings.');
          setData(null);
        } else {
          setData(result);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, period]);

  const chartData = data?.timeseries?.map(item => ({
    date: format(new Date(item.time), 'MMM d'),
    visitors: item.devices?.reduce((acc, d) => acc + (d.visitors || 0), 0) || 0,
    views: item.devices?.reduce((acc, d) => acc + (d.views || 0), 0) || 0,
  })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Web Analytics" 
        description="Traffic and visitor insights from Vercel"
        icon={BarChart3}
      >
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px] bg-card/50 backdrop-blur-sm border-none shadow-sm">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </AdminPageHeader>

      {error ? (
        <Card className="border-dashed border-2 bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center max-w-md">
              {error}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Total Visitors" 
              value={data?.stats?.visitors?.total || 0}
              change={data?.stats?.visitors?.change}
              icon={Users}
              description="Unique Users"
            />
            <StatCard 
              title="Page Views" 
              value={data?.stats?.views?.total || 0}
              change={data?.stats?.views?.change}
              icon={Eye}
              description="Total Impressions"
            />
            <StatCard 
              title="Bounce Rate" 
              value={`${(data?.stats?.bounceRate?.total * 100 || 0).toFixed(1)}%`}
              change={data?.stats?.bounceRate?.change}
              icon={MousePointer2}
              description="Engagement"
            />
            <StatCard 
              title="Avg. Time" 
              value={`${Math.round(data?.stats?.avgTime?.total || 0)}s`}
              change={data?.stats?.avgTime?.change}
              icon={BarChart3}
              description="Per Session"
            />
          </div>

          <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Traffic Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.1)" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="visitors" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#colorVisitors)" 
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stroke="hsl(var(--secondary))" 
                      fillOpacity={1} 
                      fill="url(#colorViews)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
