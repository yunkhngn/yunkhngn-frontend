'use client';

import { readNestJson } from '@/lib/api/readJson';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Loader2, Search, Eye, X, Shield, Clock, Globe, Monitor } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/Table';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';

const ACTION_COLORS = {
  CREATE: 'bg-green-500/10 text-green-600 dark:text-green-400',
  UPDATE: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  DELETE: 'bg-red-500/10 text-red-600 dark:text-red-400',
  LOGIN: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
};

function getActionColor(action) {
  const prefix = action?.split('_')[0];
  return ACTION_COLORS[prefix] || 'bg-muted text-muted-foreground';
}

export default function AuditLogsClient() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (entityFilter) params.set('entity', entityFilter);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/audit-logs?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.ok) {
        const data = await readNestJson(res);
        setLogs(data.data);
        setTotalPages(data.meta.lastPage);
        setTotal(data.meta.total);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [user, page, search, entityFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const entities = ['Blog', 'Project', 'Comment', 'Settings', 'ShortLink', 'Journal'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-sm text-muted-foreground">
            Track all admin actions across the system. Total: {total} logs.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search actions, entities, details..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-sm focus:ring-1 focus:ring-primary/50 outline-none transition-all"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">Search</Button>
          {search && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}>
              Clear
            </Button>
          )}
        </form>
        <select
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
        >
          <option value="">All Entities</option>
          {entities.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20">
            <Shield className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">No audit logs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Entity ID</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right px-6">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="group cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setSelectedLog(log)}
                  >
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{log.entity}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {log.entityId ? log.entityId.substring(0, 8) + '...' : '-'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{log.ipAddress || '-'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <div className="text-xs font-medium px-4">Page {page} of {totalPages}</div>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col m-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">Audit Log Detail</h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                    {selectedLog.id.split('-')[0]} • {format(new Date(selectedLog.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => setSelectedLog(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 p-3 rounded-xl flex items-center gap-3">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Action</p>
                    <p className="text-sm font-semibold">{selectedLog.action}</p>
                  </div>
                </div>
                <div className="bg-muted/30 p-3 rounded-xl flex items-center gap-3">
                  <Monitor className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Entity</p>
                    <p className="text-sm font-semibold">{selectedLog.entity}</p>
                  </div>
                </div>
                <div className="bg-muted/30 p-3 rounded-xl flex items-center gap-3">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">IP Address</p>
                    <p className="text-sm font-semibold">{selectedLog.ipAddress || 'Unknown'}</p>
                  </div>
                </div>
                <div className="bg-muted/30 p-3 rounded-xl flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Time</p>
                    <p className="text-sm font-semibold">{format(new Date(selectedLog.createdAt), 'yyyy-MM-dd HH:mm:ss')}</p>
                  </div>
                </div>
              </div>

              {selectedLog.entityId && (
                <div className="bg-muted/30 p-3 rounded-xl">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Entity ID</p>
                  <p className="text-sm font-mono">{selectedLog.entityId}</p>
                </div>
              )}

              {selectedLog.details && (
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase mb-2">Details (JSON)</p>
                  <pre className="bg-muted/30 border border-border/50 rounded-xl p-4 text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap">
                    {(() => {
                      try { return JSON.stringify(JSON.parse(selectedLog.details), null, 2); }
                      catch { return selectedLog.details; }
                    })()}
                  </pre>
                </div>
              )}

              {selectedLog.userAgent && (
                <div className="bg-muted/30 p-3 rounded-xl">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">User Agent</p>
                  <p className="text-xs text-muted-foreground break-all">{selectedLog.userAgent}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border flex justify-end bg-muted/10">
              <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
