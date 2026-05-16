'use client';

import { readNestJson } from '@/lib/api/readJson';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import {
  Loader2,
  Search,
  Eye,
  Shield,
  Clock,
  Globe,
  Monitor,
  User as UserIcon,
  ExternalLink,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import { AdminPageHeader } from '@/components/admin/shared/AdminPageHeader';
import { AdminEmptyState } from '@/components/admin/shared/AdminEmptyState';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 20;

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

function parseDetails(raw) {
  if (!raw) return null;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function entityAdminLink(entity, entityId, slug) {
  if (entity === 'Blog') return `/admin/blog/${entityId}/edit`;
  if (entity === 'Project' && slug) return `/admin/project/edit-project/${slug}`;
  return null;
}

const LOCAL_TZ =
  typeof Intl !== 'undefined'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : 'UTC';

function formatAbsolute(date) {
  return format(date, 'yyyy-MM-dd HH:mm:ss');
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
  const [userIdFilter, setUserIdFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [entities, setEntities] = useState([
    'Blog',
    'Project',
  ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch(`${API_URL}/audit-logs/metadata`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok || cancelled) return;
        const data = await readNestJson(res);
        if (Array.isArray(data?.entities) && data.entities.length > 0) {
          setEntities(data.entities);
        }
      } catch {
        // metadata is best-effort; keep defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const fetchLogs = useCallback(
    async (signal) => {
      if (!user) return;
      try {
        setLoading(true);
        const token = await user.getIdToken();
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
        });
        if (search) params.set('search', search);
        if (entityFilter) params.set('entity', entityFilter);
        if (userIdFilter) params.set('userId', userIdFilter);
        if (from) params.set('from', new Date(from).toISOString());
        if (to) {
          const end = new Date(to);
          end.setHours(23, 59, 59, 999);
          params.set('to', end.toISOString());
        }

        const res = await fetch(`${API_URL}/audit-logs?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal,
        });

        if (!res.ok) {
          toast.error(`Failed to load audit logs (${res.status})`);
          return;
        }

        const data = await readNestJson(res);
        if (signal?.aborted) return;
        setLogs(data.data);
        setTotalPages(data.meta.lastPage);
        setTotal(data.meta.total);
      } catch (error) {
        if (error?.name === 'AbortError') return;
        console.error('Failed to fetch audit logs', error);
        toast.error('Failed to load audit logs');
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [user, page, search, entityFilter, userIdFilter, from, to],
  );

  useEffect(() => {
    const ctrl = new AbortController();
    fetchLogs(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchLogs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const resetFilters = () => {
    setSearch('');
    setSearchInput('');
    setEntityFilter('');
    setUserIdFilter('');
    setFrom('');
    setTo('');
    setPage(1);
  };

  const prettyDetails = useMemo(() => {
    if (!selectedLog?.details) return null;
    try {
      return JSON.stringify(JSON.parse(selectedLog.details), null, 2);
    } catch {
      return String(selectedLog.details);
    }
  }, [selectedLog]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Audit Logs"
        description={`Track all admin actions across the system. Total: ${total} logs.`}
      />

      <div className="flex flex-col gap-3">
        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row md:items-center gap-2"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search actions, entities, details..."
              aria-label="Search audit logs"
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
          {(search ||
            entityFilter ||
            userIdFilter ||
            from ||
            to) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetFilters}
            >
              Clear all
            </Button>
          )}
        </form>

        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col text-xs text-muted-foreground gap-1">
            <span>Entity</span>
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by entity"
              className="h-10 px-3 border border-border rounded-md bg-background text-sm"
            >
              <option value="">All</option>
              {entities.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-xs text-muted-foreground gap-1 flex-1 min-w-[12rem]">
            <span>Actor (email)</span>
            <Input
              value={userIdFilter}
              onChange={(e) => {
                setUserIdFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by email"
              aria-label="Filter by actor email"
            />
          </label>
          <label className="flex flex-col text-xs text-muted-foreground gap-1">
            <span>From</span>
            <Input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
              aria-label="From date"
            />
          </label>
          <label className="flex flex-col text-xs text-muted-foreground gap-1">
            <span>To</span>
            <Input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
              aria-label="To date"
            />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="border border-border rounded-xl bg-card shadow-sm flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading audit logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <AdminEmptyState
          icon={<Shield className="w-12 h-12" />}
          message="No audit logs found."
        />
      ) : (
        <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right px-6">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const created = new Date(log.createdAt);
                  const details = parseDetails(log.details);
                  const entityTitle = details?.title;
                  const adminLink = entityAdminLink(log.entity, log.entityId, details?.slug);
                  return (
                    <TableRow
                      key={log.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${getActionColor(log.action)}`}
                        >
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {log.entity}
                      </TableCell>
                      <TableCell className="text-sm max-w-[180px]">
                        {entityTitle && adminLink ? (
                          <Link
                            href={adminLink}
                            className="font-medium hover:underline text-foreground truncate flex items-center gap-1 group"
                            title={entityTitle}
                          >
                            <span className="truncate">{entityTitle}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
                          </Link>
                        ) : entityTitle ? (
                          <span className="font-medium truncate block" title={entityTitle}>{entityTitle}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground font-mono" title={log.entityId || ''}>
                            {log.entityId ? log.entityId.substring(0, 8) + '…' : '-'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell
                        className="text-xs text-muted-foreground font-mono"
                        title={log.userId || 'system'}
                      >
                        {log.userId || 'system'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {log.ipAddress || '-'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        <time
                          dateTime={created.toISOString()}
                          title={`${formatAbsolute(created)} (${LOCAL_TZ})`}
                          className="block"
                        >
                          {formatAbsolute(created)}
                        </time>
                        <span className="block text-[10px] opacity-70">
                          {formatDistanceToNow(created, { addSuffix: true })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setSelectedLog(log)}
                          aria-label={`View details for audit log ${log.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Audit log pagination"
          className="flex items-center justify-center gap-2 mt-4"
        >
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <div className="text-xs font-medium px-4" aria-live="polite">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </nav>
      )}

      <Dialog
        open={!!selectedLog}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedLog && (() => {
            const dlDetails = parseDetails(selectedLog.details);
            const dlTitle = dlDetails?.title;
            const dlLink = entityAdminLink(selectedLog.entity, selectedLog.entityId, dlDetails?.slug);
            return (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="w-5 h-5 text-primary" />
                  </span>
                  <span>
                    Audit Log Detail
                    <span className="block text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                      {selectedLog.id.split('-')[0]} •{' '}
                      {formatAbsolute(new Date(selectedLog.createdAt))} (
                      {LOCAL_TZ})
                    </span>
                  </span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <DetailTile
                    icon={<Shield className="w-4 h-4 text-muted-foreground" />}
                    label="Action"
                    value={selectedLog.action}
                  />
                  <DetailTile
                    icon={<Monitor className="w-4 h-4 text-muted-foreground" />}
                    label="Entity"
                    value={selectedLog.entity}
                  />
                  <DetailTile
                    icon={<UserIcon className="w-4 h-4 text-muted-foreground" />}
                    label="Actor"
                    value={selectedLog.userId || 'system'}
                    mono
                  />
                  <DetailTile
                    icon={<Globe className="w-4 h-4 text-muted-foreground" />}
                    label="IP Address"
                    value={selectedLog.ipAddress || 'Unknown'}
                  />
                  <DetailTile
                    icon={<Clock className="w-4 h-4 text-muted-foreground" />}
                    label={`Time (${LOCAL_TZ})`}
                    value={formatAbsolute(new Date(selectedLog.createdAt))}
                  />
                </div>

                {(dlTitle || selectedLog.entityId) && (
                  <div className="bg-muted/30 p-3 rounded-xl">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">
                      Target
                    </p>
                    {dlTitle && dlLink ? (
                      <Link
                        href={dlLink}
                        className="text-sm font-semibold hover:underline flex items-center gap-1.5 group"
                      >
                        {dlTitle}
                        <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ) : dlTitle ? (
                      <p className="text-sm font-semibold">{dlTitle}</p>
                    ) : (
                      <p className="text-sm font-mono break-all">{selectedLog.entityId}</p>
                    )}
                    {selectedLog.entityId && (
                      <p className="text-[10px] text-muted-foreground font-mono mt-1 break-all">
                        ID: {selectedLog.entityId}
                      </p>
                    )}
                  </div>
                )}

                {prettyDetails && (
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase mb-2">
                      Details (JSON)
                    </p>
                    <pre className="bg-muted/30 border border-border/50 rounded-xl p-4 text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap">
                      {prettyDetails}
                    </pre>
                  </div>
                )}

                {selectedLog.userAgent && (
                  <div className="bg-muted/30 p-3 rounded-xl">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">
                      User Agent
                    </p>
                    <p className="text-xs text-muted-foreground break-all">
                      {selectedLog.userAgent}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedLog(null)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailTile({ icon, label, value, mono = false }) {
  return (
    <div className="bg-muted/30 p-3 rounded-xl flex items-center gap-3">
      {icon}
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground font-bold uppercase">
          {label}
        </p>
        <p
          className={`text-sm font-semibold truncate ${mono ? 'font-mono' : ''}`}
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
