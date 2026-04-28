'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Server, Terminal, AlertCircle, RefreshCw, Play, Pause, Trash2 } from 'lucide-react';
import io from 'socket.io-client';

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
        const data = await res.json();
        setContainers(data);
      }
    } catch (err) {
      console.error('Failed to load containers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 5000);
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
        // Keep max 500 lines
        const updated = [...containerLogs, {
          id: Date.now() + Math.random().toString(),
          message: data.message,
          timestamp: new Date().toISOString()
        }].slice(-500);

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
      case 'running': return 'bg-green-500 hover:bg-green-600';
      case 'exited': return 'bg-red-500 hover:bg-red-600';
      case 'restarting': return 'bg-yellow-500 hover:bg-yellow-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const highlightLog = (message) => {
    const isError = /error|exception|fail|panic/i.test(message);
    const isWarn = /warn|warning/i.test(message);

    if (isError) return 'bg-red-500/10 text-red-500 border-l-4 border-red-500 pl-2';
    if (isWarn) return 'bg-yellow-500/10 text-yellow-500 border-l-4 border-yellow-500 pl-2';
    return 'text-slate-300 pl-3';
  };

  const filterLogs = (containerLogs) => {
    if (!containerLogs) return [];
    return containerLogs.filter(log => {
      const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase());
      const isError = /error|exception|fail|panic/i.test(log.message);
      const isWarn = /warn|warning/i.test(log.message);

      if (filterLevel === 'error') return matchesSearch && isError;
      if (filterLevel === 'warn') return matchesSearch && isWarn;
      return matchesSearch;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Monitor</h1>
          <p className="text-muted-foreground mt-1">Real-time Docker health metrics and live logging.</p>
        </div>
        <Button onClick={fetchContainers} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800 p-1 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-slate-800 text-xs py-1.5 px-3">
            <Server className="h-4 w-4 mr-1.5" /> Overview
          </TabsTrigger>
          {containers.map((container) => {
            const name = container.names?.[0]?.replace(/^\//, '') || container.id.substring(0, 12);
            return (
              <TabsTrigger
                key={container.id}
                value={container.id}
                className="data-[state=active]:bg-slate-800 text-xs py-1.5 px-3 flex items-center gap-2"
              >
                <span className={`w-2 h-2 rounded-full ${container.state === 'running' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                {name}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {containers.map((container) => {
              const name = container.names?.[0]?.replace(/^\//, '') || 'Unknown';
              return (
                <Card key={container.id} className="bg-slate-950 border-slate-800 hover:border-slate-700 transition-all cursor-pointer" onClick={() => setActiveTab(container.id)}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-semibold truncate pr-4">{name}</CardTitle>
                    <Badge className={getStatusColor(container.state)}>{container.state}</Badge>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p><span className="font-semibold text-slate-400">Image:</span> {container.image}</p>
                      <p><span className="font-semibold text-slate-400">Status:</span> {container.status}</p>
                    </div>
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
              <div className="flex flex-col h-[70vh] border border-slate-800 rounded-xl bg-slate-950 overflow-hidden shadow-2xl">
                {/* Log Controls */}
                <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-indigo-400" />
                    <h2 className="text-base font-medium">{name} Logs</h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Search */}
                    <input
                      type="text"
                      placeholder="Search log lines..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs px-3 py-1.5 rounded-md focus:outline-none focus:border-slate-600 w-48 text-slate-100"
                    />

                    {/* Filter Levels */}
                    <select
                      value={filterLevel}
                      onChange={(e) => setFilterLevel(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs px-2 py-1.5 rounded-md focus:outline-none focus:border-slate-600 text-slate-100"
                    >
                      <option value="all">All Levels</option>
                      <option value="error">Errors</option>
                      <option value="warn">Warnings</option>
                    </select>

                    {/* Controls */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsPaused(!isPaused)}
                      className="text-xs hover:bg-slate-800 h-8 text-slate-300"
                    >
                      {isPaused ? <Play className="h-4 w-4 mr-1 text-green-500" /> : <Pause className="h-4 w-4 mr-1 text-yellow-500" />}
                      {isPaused ? 'Resume' : 'Pause'}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearLogs(container.id)}
                      className="text-xs hover:bg-slate-800 h-8 text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Clear
                    </Button>
                  </div>
                </div>

                {/* Log Stream Area */}
                <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 bg-black">
                  {currentLogs.map((log) => (
                    <div key={log.id} className={`py-0.5 rounded transition-all duration-200 ${highlightLog(log.message)}`}>
                      <span className="text-slate-600 mr-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span>{log.message}</span>
                    </div>
                  ))}

                  {currentLogs.length === 0 && (
                    <div className="flex items-center justify-center h-full text-slate-500">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      No logs captured or matching the filter.
                    </div>
                  )}
                  <div ref={(el) => (logsEndRef.current[container.id] = el)} />
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
