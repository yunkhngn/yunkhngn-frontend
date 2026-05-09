'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { readNestJson } from '@/lib/api/readJson';
import { AdminPageHeader } from '@/components/admin/shared/AdminPageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { 
  Gauge, 
  Zap, 
  Smartphone, 
  Monitor, 
  Loader2,
  AlertCircle,
  Activity,
  Clock,
  Layers,
  Layout
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format } from 'date-fns';

const VitalCard = ({ title, value, unit, status, icon: Icon }) => {
  const getStatusColor = (s) => {
    switch (s?.toLowerCase()) {
      case 'good': return 'text-emerald-500 bg-emerald-500/10';
      case 'needs-improvement': return 'text-amber-500 bg-amber-500/10';
      case 'poor': return 'text-rose-500 bg-rose-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold">{value}</span>
            <span className="text-[10px] text-muted-foreground">{unit}</span>
          </div>
        </div>
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(status)}`}>
          {status || 'Unknown'}
        </div>
      </CardContent>
    </Card>
  );
};

const ScoreGauge = ({ score }) => {
  const getColor = (s) => {
    if (s >= 90) return '#10b981'; // emerald
    if (s >= 50) return '#f59e0b'; // amber
    return '#ef4444'; // rose
  };

  const getStatus = (s) => {
    if (s >= 90) return 'Great';
    if (s >= 50) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-muted stroke-current"
            strokeWidth="8"
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
          />
          <circle
            className="stroke-current transition-all duration-1000 ease-out"
            strokeWidth="8"
            strokeDasharray={`${score * 2.51} 251`}
            strokeLinecap="round"
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            style={{ color: getColor(score), transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-black tracking-tighter" style={{ color: getColor(score) }}>{Math.round(score)}</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Experience Score</span>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor(score) }} />
        <span className="text-sm font-semibold">{getStatus(score)}</span>
      </div>
    </div>
  );
};

export default function SpeedInsightsClient() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [device, setDevice] = useState('all');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const token = await user.getIdToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/vercel/speed-insights?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch speed insights');

        const result = await readNestJson(res);
        if (!result) {
          setError('Vercel credentials not configured.');
        } else {
          setData(result);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const latestStats = data?.stats?.[data.stats.length - 1] || {};
  const resScore = latestStats.score || 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Speed Insights" 
        description="Core Web Vitals and performance metrics"
        icon={Zap}
      >
        <div className="flex items-center gap-2">
          <Select value={device} onValueChange={setDevice}>
            <SelectTrigger className="w-[120px] bg-card/50 backdrop-blur-sm border-none shadow-sm">
              <SelectValue placeholder="Device" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Devices</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
              <SelectItem value="desktop">Desktop</SelectItem>
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px] bg-card/50 backdrop-blur-sm border-none shadow-sm">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </AdminPageHeader>

      {error ? (
        <Card className="border-dashed border-2 bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
          {/* Main Score & Chart */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <VitalCard 
                title="LCP" 
                value={(latestStats.lcp / 1000 || 0).toFixed(2)} 
                unit="s" 
                status={latestStats.lcpStatus}
                icon={Clock} 
              />
              <VitalCard 
                title="FID" 
                value={Math.round(latestStats.fid || 0)} 
                unit="ms" 
                status={latestStats.fidStatus}
                icon={Activity} 
              />
              <VitalCard 
                title="CLS" 
                value={(latestStats.cls || 0).toFixed(3)} 
                unit="" 
                status={latestStats.clsStatus}
                icon={Layout} 
              />
            </div>

            <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Performance Trends
                </CardTitle>
                <CardDescription className="text-[10px]">P75 Percentile over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data?.stats || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.1)" />
                      <XAxis 
                        dataKey="time" 
                        axisLine={false} 
                        tickLine={false} 
                        tickFormatter={(t) => format(new Date(t), 'MMM d')}
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '11px'
                        }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                      <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} name="Experience Score" />
                      <Line type="monotone" dataKey="fcp" stroke="#8b5cf6" strokeWidth={2} dot={false} name="FCP" />
                      <Line type="monotone" dataKey="lcp" stroke="#3b82f6" strokeWidth={2} dot={false} name="LCP" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Score */}
          <div className="lg:col-span-4">
            <Card className="h-full border-none shadow-md bg-card/50 backdrop-blur-sm flex flex-col items-center justify-center text-center">
              <CardHeader className="w-full">
                <CardTitle className="text-lg font-bold">Real Experience Score</CardTitle>
                <CardDescription className="text-xs">Based on actual visitor data</CardDescription>
              </CardHeader>
              <CardContent className="w-full">
                <ScoreGauge score={resScore} />
                <div className="mt-8 space-y-3 w-full">
                  <div className="flex items-center justify-between text-xs px-4">
                    <span className="flex items-center gap-2"><Smartphone className="h-3 w-3" /> Mobile</span>
                    <span className="font-bold text-amber-500">{(data?.mobileScore || 0).toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs px-4">
                    <span className="flex items-center gap-2"><Monitor className="h-3 w-3" /> Desktop</span>
                    <span className="font-bold text-emerald-500">{(data?.desktopScore || 0).toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
