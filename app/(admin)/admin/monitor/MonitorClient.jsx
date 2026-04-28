'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { readNestJson } from '@/lib/api/readJson';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import {
  Server,
  Terminal,
  AlertCircle,
  RefreshCw,
  Play,
  Pause,
  Trash2,
  Activity,
  Box,
  Search,
  Filter,
  ArrowDownCircle,
  Cpu,
  Database
} from 'lucide-react';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

export default function MonitorClient() {
  const { user } = useAuth();
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [logs, setLogs] = useState({}); // { [containerId]: [] }
  const [isPaused, setIsPaused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('all'); // all, error, warn

  const socketRef = useRef(null);
  const logsEndRef = useRef({}); // { [containerId]: ref }

  const fetchContainers = async () => {
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
  };

  useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 10000); // Polling containers every 10s
    return () => clearInterval(interval);
  }, [user]);

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
        // Keep max 1000 lines for premium feel
        const updated = [...containerLogs, {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          message: data.message,
          timestamp: new Date().toISOString()
        }].slice(-1000);

        return {
          ...prev,
          [data.containerId]: updated
        };
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isPaused]);

  // Subscribe/Unsubscribe on tab change
  useEffect(() => {
    if (activeTab !== 'overview' && socketRef.current) {
      socketRef.current.emit('monitor:subscribe', { containerId: activeTab });
    }

    return () => {
      if (activeTab !== 'overview' && socketRef.current) {
        socketRef.current.emit('monitor:unsubscribe', { containerId: activeTab });
      }
    };
  }, [activeTab]);

  const scrollToBottom = (containerId) => {
    if (logsEndRef.current[containerId]) {
      logsEndRef.current[containerId].scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!isPaused && activeTab !== 'overview') {
      scrollToBottom(activeTab);
    }
  }, [logs, activeTab, isPaused]);

  const clearLogs = (containerId) => {
    setLogs((prev) => ({ ...prev, [containerId]: [] }));
  };

  const getStatusColor = (state) => {
    switch (state?.toLowerCase()) {
      case 'running': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20';
      case 'exited': return 'bg-rose-500/10 text-rose-600 dark:text-rose-500 border-rose-500/20';
      case 'restarting': return 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-500 border-slate-500/20';
    }
  };

  const highlightLog = (message) => {
    const isError = /error|exception|fail|panic|fatal/i.test(message);
    const isWarn = /warn|warning/i.test(message);
    const isSuccess = /success|ready|connected|started/i.test(message);

    if (isError) return 'text-rose-600 dark:text-rose-400 border-l-2 border-rose-500 pl-3 bg-rose-500/5';
    if (isWarn) return 'text-amber-600 dark:text-amber-400 border-l-2 border-amber-500 pl-3 bg-amber-500/5';
    if (isSuccess) return 'text-emerald-600 dark:text-emerald-400 pl-3';
    return 'text-muted-foreground pl-3 hover:text-foreground transition-colors';
  };

  const filterLogs = (containerLogs) => {
    if (!containerLogs) return [];
    return containerLogs.filter(log => {
      const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase());
      const isError = /error|exception|fail|panic|fatal/i.test(log.message);
      const isWarn = /warn|warning/i.test(log.message);

      if (filterLevel === 'error') return matchesSearch && isError;
      if (filterLevel === 'warn') return matchesSearch && isWarn;
      return matchesSearch;
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-2 border-primary animate-spin"></div>
          <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary/50 animate-pulse" />
        </div>
        <p className="text-muted-foreground font-medium animate-pulse">Initializing Monitor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 space-y-6 animate-in fade-in duration-700 bg-background text-foreground">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              System Monitor
            </h1>
          </div>
          <p className="text-muted-foreground text-xs font-medium pl-10">
            Real-time infrastructure pulse & distributed container insights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full border border-border text-xs font-mono text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            AGENT CONNECTED
          </div>
          <Button
            onClick={fetchContainers}
            variant="outline"
            size="sm"
            className="rounded-full transition-all active:scale-95"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 -mx-6 px-6">
          <TabsList className="bg-muted border border-border p-1.5 flex flex-wrap h-auto gap-1.5 rounded-2xl w-full justify-start overflow-x-auto no-scrollbar">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground text-xs py-2 px-4 rounded-xl transition-all font-semibold flex items-center gap-2"
            >
              <Server className="h-4 w-4" /> Overview
            </TabsTrigger>
            {containers.map((container) => {
              const name = container.names?.[0]?.replace(/^\//, '') || container.id.substring(0, 12);
              return (
                <TabsTrigger
                  key={container.id}
                  value={container.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground text-xs py-2 px-4 rounded-xl transition-all font-semibold flex items-center gap-2 border border-transparent data-[state=active]:border-primary/20"
                >
                  <span className={`w-2 h-2 rounded-full ${container.state === 'running' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                  {name}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="overview" className="mt-4">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {containers.map((container) => {
                  const name = container.names?.[0]?.replace(/^\//, '') || 'Unknown';
                  return (
                    <Card
                      key={container.id}
                      className="group bg-card hover:border-primary/50 transition-all duration-500 cursor-pointer overflow-hidden relative border-border shadow-sm"
                      onClick={() => setActiveTab(container.id)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 z-10">
                        <div className="space-y-0.5">
                          <CardTitle className="text-sm font-bold truncate pr-2 text-foreground group-hover:text-primary transition-colors">
                            {name}
                          </CardTitle>
                          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-mono">
                            <Box className="h-2.5 w-2.5" />
                            {container.id.substring(0, 12)}
                          </div>
                        </div>
                        <Badge variant="outline" className={`${getStatusColor(container.state)} font-bold text-[9px] px-1.5 py-0 rounded-md border h-4`}>
                          {container.state.toUpperCase()}
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-2 p-3 pt-0 z-10 relative">
                        <div className="space-y-1 text-[10px]">
                          <div className="flex justify-between items-center text-muted-foreground">
                            <span className="flex items-center gap-1"><Cpu className="h-2.5 w-2.5" /> Image</span>
                            <span className="font-mono truncate max-w-[120px]">{container.image.split(':')[0]}</span>
                          </div>
                          <div className="flex justify-between items-center text-muted-foreground">
                            <span className="flex items-center gap-1"><RefreshCw className="h-2.5 w-2.5" /> Uptime</span>
                            <span className="text-emerald-600 dark:text-emerald-500/80 font-medium">{container.status}</span>
                          </div>
                        </div>

                        <Button variant="ghost" size="sm" className="w-full h-7 text-[9px] border border-border hover:bg-primary hover:text-primary-foreground rounded-md transition-all group-hover:border-primary/20">
                          VIEW LOGS & METRICS
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {containers.map((container) => {
              const name = container.names?.[0]?.replace(/^\//, '') || container.id;
              const currentLogs = filterLogs(logs[container.id]);

              return (
                <TabsContent key={container.id} value={container.id} className="mt-6">
                  <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    {/* Log Terminal Area */}
                    <div className="xl:col-span-3 flex flex-col h-[75vh] border border-border rounded-3xl bg-card overflow-hidden shadow-sm relative">
                      {/* Terminal Glow */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

                      {/* Log Toolbar */}
                      <div className="px-6 py-4 bg-muted/50 border-b border-border flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-xl">
                            <Terminal className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h2 className="text-base font-bold text-foreground leading-none">{name}</h2>
                            <p className="text-[10px] text-muted-foreground mt-1 font-mono">{container.image}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <input
                              type="text"
                              placeholder="Grep logs..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="bg-background border border-border text-xs pl-8 pr-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary w-40 md:w-56 text-foreground placeholder:text-muted-foreground transition-all"
                            />
                          </div>

                          <div className="flex items-center bg-background border border-border rounded-xl p-1">
                            <Filter className="h-3.5 w-3.5 text-muted-foreground ml-2" />
                            <select
                              value={filterLevel}
                              onChange={(e) => setFilterLevel(e.target.value)}
                              className="bg-transparent border-none text-[11px] px-2 py-1 focus:ring-0 text-foreground cursor-pointer outline-none"
                            >
                              <option value="all">ALL</option>
                              <option value="error">ERRORS</option>
                              <option value="warn">WARNINGS</option>
                            </select>
                          </div>

                          <div className="h-6 w-px bg-border mx-1" />

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsPaused(!isPaused)}
                            className={`rounded-xl h-9 px-4 transition-all ${isPaused ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-500 hover:bg-amber-500/20'}`}
                          >
                            {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                            <span className="font-bold text-xs uppercase tracking-wider">{isPaused ? 'Resume' : 'Pause'}</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearLogs(container.id)}
                            className="rounded-xl h-9 px-3 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Log Stream Area */}
                      <div className="flex-1 p-6 overflow-y-auto font-mono text-[11px] leading-relaxed scroll-smooth bg-zinc-950 dark:bg-black/40 text-zinc-300 selection:bg-primary/30 selection:text-white">
                        {currentLogs.length > 0 ? (
                          <div className="space-y-1.5">
                            {currentLogs.map((log) => (
                              <div key={log.id} className={`group py-1 rounded-md transition-all duration-300 ${highlightLog(log.message)}`}>
                                <div className="flex items-start gap-4">
                                  <span className="text-zinc-500 opacity-40 group-hover:opacity-100 transition-opacity whitespace-nowrap pt-0.5">
                                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                                  </span>
                                  <span className="break-all whitespace-pre-wrap">{log.message}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-zinc-600 animate-pulse">
                            <Terminal className="h-12 w-12 mb-4 opacity-20" />
                            <p className="text-sm font-medium">Waiting for log stream...</p>
                            <p className="text-[10px] mt-2 opacity-50">New events will appear here in real-time</p>
                          </div>
                        )}
                        <div ref={(el) => (logsEndRef.current[container.id] = el)} />
                      </div>

                      {/* Terminal Footer */}
                      <div className="px-6 py-2 bg-muted/50 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-4 text-[10px] font-mono">
                          <span className="text-muted-foreground">LINES: <span className="text-foreground">{currentLogs.length}</span></span>
                          <span className="text-muted-foreground">BUFFER: <span className="text-foreground">1000 MAX</span></span>
                        </div>
                        <div
                          className="cursor-pointer text-muted-foreground hover:text-primary transition-colors p-1"
                          onClick={() => scrollToBottom(container.id)}
                        >
                          <ArrowDownCircle className="h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    {/* Side Info Panel */}
                    <div className="space-y-4">
                      <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-sm">
                        <CardHeader className="py-2.5 px-4 border-b border-border bg-muted/30">
                          <CardTitle className="text-xs font-bold flex items-center gap-2 text-foreground">
                            <Activity className="h-3.5 w-3.5 text-primary" /> Metrics
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] text-muted-foreground uppercase tracking-tighter font-bold">
                              <span>Health Score</span>
                              <span className="text-emerald-600 dark:text-emerald-500">98%</span>
                            </div>
                            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 w-[98%]" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2.5 rounded-xl bg-muted/50 border border-border">
                              <p className="text-[9px] text-muted-foreground font-bold uppercase">CPU</p>
                              <p className="text-base font-mono font-bold text-foreground">1.2%</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-muted/50 border border-border">
                              <p className="text-[9px] text-muted-foreground font-bold uppercase">MEM</p>
                              <p className="text-base font-mono font-bold text-foreground">42MB</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-sm">
                        <CardHeader className="py-2.5 px-4 border-b border-border bg-muted/30">
                          <CardTitle className="text-xs font-bold flex items-center gap-2 text-foreground">
                            <Database className="h-3.5 w-3.5 text-primary" /> Environment
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-2 font-mono text-[9px]">
                            <div className="pb-1.5 border-b border-border">
                              <p className="text-muted-foreground mb-0.5 uppercase tracking-tighter font-bold">Network</p>
                              <p className="text-foreground">app-network (bridge)</p>
                            </div>
                            <div className="pb-1.5 border-b border-border">
                              <p className="text-muted-foreground mb-0.5 uppercase tracking-tighter font-bold">Restart Policy</p>
                              <p className="text-foreground">always</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-0.5 uppercase tracking-tighter font-bold">Privileged</p>
                              <p className="text-rose-600 dark:text-rose-500">false</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
