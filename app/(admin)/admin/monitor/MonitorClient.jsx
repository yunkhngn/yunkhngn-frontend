'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { readNestJson } from '@/lib/api/readJson';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Server, Terminal, Activity, Box, Search, Filter, ArrowDownCircle, Cpu, Database, RefreshCw, Play, Pause, Trash2 } from 'lucide-react';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import InfrastructureStatus from '@/components/template/Admin/InfrastructureStatus';
import SystemStatsCards from '@/components/template/Admin/SystemStatsCards';
import ActiveInfrastructure from '@/components/template/Admin/ActiveInfrastructure';
import { cn } from '@/lib/utils';

export default function MonitorClient() {
  const { user } = useAuth();
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [logs, setLogs] = useState({});
  const [stats, setStats] = useState({}); // { [containerId]: { cpu, memory, ... } }
  const [isPaused, setIsPaused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [systemStats, setSystemStats] = useState(null);
  const [serviceStatuses, setServiceStatuses] = useState({
    backend: { status: 'pending', message: 'Checking...' },
    cloudinary: { status: 'pending', message: 'Checking...' },
    firebase: { status: 'pending', message: 'Checking...' },
    gemini: { status: 'pending', message: 'Checking...' },
    resend: { status: 'pending', message: 'Checking...' },
    cloudflare: { status: 'pending', message: 'Checking...' },
  });
  const [checkingServices, setCheckingServices] = useState(false);

  const socketRef = useRef(null);
  const logsEndRef = useRef({});

  const fetchContainers = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/monitor/containers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await readNestJson(res);
        setContainers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load containers', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 15000);
    return () => clearInterval(interval);
  }, [user, fetchContainers]);

  useEffect(() => {
    let intervalId;
    const fetchSystemStats = async () => {
      if (!user) return;
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      try {
        const token = await user.getIdToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/system/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setSystemStats(await readNestJson(res));
        }
      } catch (error) {
        console.error("Failed to fetch system stats", error);
      }
    };

    fetchSystemStats();
    intervalId = setInterval(fetchSystemStats, 5000);

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchSystemStats();
      }
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      clearInterval(intervalId);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [user]);

  const checkExternalServices = useCallback(async () => {
    setCheckingServices(true);
    setServiceStatuses({
      backend: { status: 'pending', message: 'Checking...' },
      cloudinary: { status: 'pending', message: 'Checking...' },
      firebase: { status: 'pending', message: 'Checking...' },
      gemini: { status: 'pending', message: 'Checking...' },
      resend: { status: 'pending', message: 'Checking...' },
      cloudflare: { status: 'pending', message: 'Checking...' },
    });

    // 1. Firebase check
    setServiceStatuses(prev => ({ ...prev, firebase: { status: user ? 'success' : 'error', message: user ? 'Authenticated' : 'Not Authenticated' } }));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`);
      if (res.ok) {
        const data = await readNestJson(res);
        setServiceStatuses(prev => ({
          ...prev,
          backend: { status: 'success', message: 'Online' },
          gemini: { status: data.services?.gemini ? 'success' : 'error', message: data.services?.gemini ? 'Configured' : 'Missing Key' },
          resend: { status: data.services?.resend ? 'success' : 'error', message: data.services?.resend ? 'Configured' : 'Missing Key' },
          cloudflare: { status: data.services?.cloudflare ? 'success' : 'error', message: data.services?.cloudflare ? 'Configured' : 'Missing Key' },
          cloudinary: { status: data.services?.cloudinary ? 'success' : 'error', message: data.services?.cloudinary ? 'Configured' : 'Missing Key' },
        }));
      } else {
        const errObj = { status: 'error', message: 'Offline' };
        setServiceStatuses(prev => ({ ...prev, backend: errObj, gemini: errObj, resend: errObj, cloudflare: errObj, cloudinary: errObj }));
      }
    } catch (error) {
      const errObj = { status: 'error', message: 'Unreachable' };
      setServiceStatuses(prev => ({ ...prev, backend: errObj, gemini: errObj, resend: errObj, cloudflare: errObj, cloudinary: errObj }));
    } finally {
      setCheckingServices(false);
    }
  }, [user]);

  useEffect(() => {
    checkExternalServices();
    const interval = setInterval(checkExternalServices, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkExternalServices]);


  useEffect(() => {
    const startUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const socketUrl = startUrl.replace(/\/api$/, '');

    socketRef.current = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('monitor:log', (data) => {
      if (isPaused) return;
      setLogs((prev) => {
        const containerLogs = prev[data.containerId] || [];
        return {
          ...prev,
          [data.containerId]: [...containerLogs, {
            id: `${Date.now()}-${Math.random()}`,
            message: data.message,
            timestamp: new Date().toISOString()
          }].slice(-500)
        };
      });
    });

    socketRef.current.on('monitor:stats', (data) => {
      setStats((prev) => ({
        ...prev,
        [data.containerId]: data
      }));
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [isPaused]);

  // Subscribe/Unsubscribe on tab change
  useEffect(() => {
    if (activeTab !== 'overview' && socketRef.current) {
      socketRef.current.emit('monitor:subscribe', { containerId: activeTab });
      socketRef.current.emit('monitor:subscribeStats', { containerId: activeTab });
    }

    return () => {
      if (activeTab !== 'overview' && socketRef.current) {
        socketRef.current.emit('monitor:unsubscribe', { containerId: activeTab });
        socketRef.current.emit('monitor:unsubscribeStats', { containerId: activeTab });
      }
    };
  }, [activeTab]);

  const getStatusColor = (state) => {
    switch (state?.toLowerCase()) {
      case 'running': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20';
      case 'exited': return 'bg-rose-500/10 text-rose-600 dark:text-rose-500 border-rose-500/20';
      case 'restarting': return 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-500 border-slate-500/20';
    }
  };

  const highlightLog = (message) => {
    if (/error|exception|fail|panic|fatal/i.test(message)) return 'text-rose-600 dark:text-rose-400 border-l-2 border-rose-500 pl-3 bg-rose-500/5';
    if (/warn|warning/i.test(message)) return 'text-amber-600 dark:text-amber-400 border-l-2 border-amber-500 pl-3 bg-amber-500/5';
    if (/success|ready|connected|started/i.test(message)) return 'text-emerald-600 dark:text-emerald-400 pl-3';
    return 'text-muted-foreground pl-3 hover:text-foreground transition-colors';
  };

  return (
    <div className="mx-auto space-y-6 bg-background text-foreground">
      {/* Header Section */}
      <div className="flex flex-row items-end justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">System Monitor</h1>
          </div>
          <p className="text-muted-foreground text-xs font-medium">Real-time infrastructure pulse & distributed container insights.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full border border-border text-[10px] font-mono text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> AGENT CONNECTED
          </div>
          <Button onClick={() => { fetchContainers(); checkExternalServices(); }} variant="outline" size="sm" className="rounded-full" disabled={loading || checkingServices}>
            <RefreshCw className={cn("h-4 w-4 mr-2", (loading || checkingServices) && "animate-spin")} />
            Sync
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted border border-border p-1.5 flex flex-wrap h-auto gap-1.5 rounded-2xl w-full justify-start overflow-x-auto no-scrollbar">
          <TabsTrigger value="overview" className="text-xs py-2 px-4 rounded-xl flex items-center gap-2"><Server className="h-4 w-4" /> Overview</TabsTrigger>
          {containers.map((container) => (
            <TabsTrigger key={container.id} value={container.id} className="text-xs py-2 px-4 rounded-xl flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${container.state === 'running' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {container.names?.[0]?.replace(/^\//, '')}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview" className="mt-4 space-y-8">
          <SystemStatsCards systemStats={systemStats} />
          <InfrastructureStatus serviceStatuses={serviceStatuses} checkingServices={checkingServices} />
          <ActiveInfrastructure containers={containers} getStatusColor={getStatusColor} setActiveTab={setActiveTab} />
        </TabsContent>

        {containers.map((container) => {
          const currentStats = stats[container.id] || { cpu: '0.00', memoryFormatted: '0MB', networks: {}, restartPolicy: 'always' };
          const healthScore = 100 - parseFloat(currentStats.cpu || 0) * 0.5; // Dummy health calculation

          return (
            <TabsContent key={container.id} value={container.id} className="mt-6 grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Terminal */}
              <div className="xl:col-span-3 flex flex-col h-[70vh] border border-border rounded-3xl bg-zinc-950 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                  <div className="flex items-center gap-3">
                    <Terminal className="h-5 w-5 text-primary" />
                    <span className="text-sm font-bold text-white">{container.names?.[0]?.replace(/^\//, '')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="text" placeholder="Grep..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-zinc-800 border-none text-xs px-3 py-1.5 rounded-lg text-white w-32" />
                    <Button variant="ghost" size="sm" onClick={() => setIsPaused(!isPaused)} className="h-8 rounded-lg text-white bg-zinc-800 hover:bg-zinc-700">{isPaused ? <Play size={14} /> : <Pause size={14} />}</Button>
                    <Button variant="ghost" size="sm" onClick={() => setLogs(p => ({ ...p, [container.id]: [] }))} className="h-8 rounded-lg text-white bg-zinc-800 hover:bg-zinc-700"><Trash2 size={14} /></Button>
                  </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto font-mono text-[11px] text-zinc-300">
                  {(logs[container.id] || []).filter(l => l.message.toLowerCase().includes(searchQuery.toLowerCase())).map((log) => (
                    <div key={log.id} className={`py-0.5 ${highlightLog(log.message)}`}>{log.message}</div>
                  ))}
                  <div ref={(el) => (logsEndRef.current[container.id] = el)} />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <Card className="bg-card border-border rounded-2xl">
                  <CardHeader className="py-2.5 px-4 border-b border-border bg-muted/30">
                    <CardTitle className="text-xs font-bold flex items-center gap-2"><Activity size={14} className="text-primary" /> Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold"><span>HEALTH SCORE</span><span className="text-emerald-500">{healthScore.toFixed(0)}%</span></div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${healthScore}%` }} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl bg-muted/50 border border-border">
                        <p className="text-[9px] text-muted-foreground font-bold">CPU</p>
                        <p className="text-lg font-mono font-bold text-primary">{currentStats.cpu}%</p>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/50 border border-border">
                        <p className="text-[9px] text-muted-foreground font-bold">MEM</p>
                        <p className="text-lg font-mono font-bold text-primary">{currentStats.memoryFormatted}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border rounded-2xl">
                  <CardHeader className="py-2.5 px-4 border-b border-border bg-muted/30">
                    <CardTitle className="text-xs font-bold flex items-center gap-2"><Database size={14} className="text-primary" /> Environment</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 font-mono text-[9px]">
                    <div className="pb-1.5 border-b border-border">
                      <p className="text-muted-foreground font-bold mb-1">NETWORK</p>
                      <p>{Object.keys(currentStats.networks || {}).join(', ') || 'bridge'}</p>
                    </div>
                    <div className="pb-1.5 border-b border-border">
                      <p className="text-muted-foreground font-bold mb-1">RESTART POLICY</p>
                      <p>{currentStats.restartPolicy}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
