'use client';

import { readNestJson } from '@/lib/api/readJson';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

import { Button } from '@/components/ui/Button';
import { Loader2, Trash2, Search, Eye, X, Bot, User, Clock, Image as ImageIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { ConfirmModal } from '@/components/ui/ConfirmModal';


export default function ChatLogsClient() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);


  const fetchLogs = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
      });
      if (search) {
        params.set('search', search);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat-logs?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await readNestJson(res);
        setLogs(data.data);
        setTotalPages(data.meta.lastPage);
        setTotal(data.meta.total);
      }
    } catch (error) {
      console.error('Failed to fetch chat logs', error);
      toast.error('Failed to load chat logs');
    } finally {
      setLoading(false);
    }
  }, [user, page, search]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleDelete = (id) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat-logs/${deleteId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success('Log deleted successfully');
        fetchLogs();
      } else {
        toast.error('Failed to delete log');
      }
    } catch (error) {
      console.error('Delete error', error);
      toast.error('An error occurred while deleting');
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const truncate = (str, length = 80) => {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chat Audit Logs</h1>
          <p className="text-sm text-muted-foreground">
            Monitor and review AI chatbot interactions. Total: {total} logs.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search messages or responses..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-sm focus:ring-1 focus:ring-primary/50 outline-none transition-all"
          />
        </div>
        <Button type="submit" variant="secondary" size="sm">
          Search
        </Button>
        {search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('');
              setSearchInput('');
              setPage(1);
            }}
          >
            Clear
          </Button>
        )}
      </form>

      {/* Table Container */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading chat logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20">
            <Bot className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">No chat logs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[35%]">User Message</TableHead>
                  <TableHead className="w-[35%]">AI Response</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead className="text-right px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="group cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setSelectedLog(log)}
                  >
                    <TableCell className="font-medium text-xs max-w-0">
                      <div className="truncate">{log.userMessage}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-0">
                      <div className="flex items-center gap-2 truncate">
                        {log.imageUrl && (
                          <ImageIcon className="w-3 h-3 text-primary shrink-0" />
                        )}
                        <span>{truncate(log.aiResponse)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(log.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.responseTime ? (
                        <span className={log.responseTime > 5000 ? 'text-amber-500' : ''}>
                          {(log.responseTime / 1000).toFixed(1)}s
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(log.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <div className="text-xs font-medium px-4">
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
        </div>
      )}

      {/* Conversation Detail Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col m-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">Conversation Details</h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                    {selectedLog.id.split('-')[0]} • {new Date(selectedLog.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
                onClick={() => setSelectedLog(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Body (Chat View) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* User Message */}
              <div className="flex flex-col items-end gap-2 max-w-[85%] ml-auto">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">User</span>
                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-3 h-3" />
                  </div>
                </div>
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-none px-4 py-3 text-sm shadow-sm">
                  {selectedLog.userMessage}
                </div>
              </div>

              {/* AI Response */}
              <div className="flex flex-col items-start gap-2 max-w-[90%]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-tight">AI Assistant</span>
                </div>
                <div className="bg-muted/40 border border-border/50 rounded-2xl rounded-tl-none px-5 py-4 text-sm shadow-sm w-full">
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed">
                    <ReactMarkdown>{selectedLog.aiResponse}</ReactMarkdown>
                  </div>
                  
                  {selectedLog.imageUrl && (
                    <div className="mt-4 pt-4 border-t border-border/20">
                      <p className="text-[10px] font-bold text-muted-foreground mb-2 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> GENERATED IMAGE
                      </p>
                      <a 
                        href={selectedLog.imageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block group relative rounded-xl overflow-hidden border border-border/50 bg-black/5"
                      >
                        <Image 
                          src={selectedLog.imageUrl} 
                          alt="Generated output" 
                          width={800}
                          height={600}
                          className="w-full h-auto max-h-80 object-contain transition-transform group-hover:scale-[1.02]" 
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="secondary" size="sm" className="pointer-events-none">View Full Image</Button>
                        </div>
                      </a>

                    </div>
                  )}
                </div>
              </div>

              {/* Metadata Stats */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-border">
                <div className="bg-muted/30 p-3 rounded-xl flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Latency</p>
                    <p className="text-sm font-semibold">
                      {selectedLog.responseTime ? `${(selectedLog.responseTime / 1000).toFixed(2)}s` : 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className="bg-muted/30 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-muted-foreground rounded-sm flex items-center justify-center text-[8px] font-bold text-muted-foreground">VI</div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Language</p>
                    <p className="text-sm font-semibold uppercase">{selectedLog.language || 'vi'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border flex justify-end gap-2 bg-muted/10">
              <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => {
                  handleDelete(selectedLog.id);
                  setSelectedLog(null);
                }}
              >
                Delete Log
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Chat Log"
        description="Are you sure you want to delete this chat log entry? This action cannot be undone."
      />
    </div>

  );
}
