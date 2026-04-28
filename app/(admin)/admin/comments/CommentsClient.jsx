'use client';

import { readNestJson } from '@/lib/api/readJson';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/Tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal, Eye, EyeOff, Trash2, CheckCircle2, XCircle, MessageSquare, Flag } from 'lucide-react';
import Link from 'next/link';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function AdminComments() {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedComments, setSelectedComments] = useState([]);
    const [selectedReports, setSelectedReports] = useState([]);
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        description: '',
        action: null,
        loading: false
    });

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [reportPage, setReportPage] = useState(1);
    const [reportTotalPages, setReportTotalPages] = useState(1);
    const limit = 100;

    const fetchComments = useCallback(async (pageNum = 1) => {
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments?includeHidden=true&page=${pageNum}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch comments');
            const { data, meta } = await readNestJson(res);
            setComments(data);
            setPage(meta.page);
            setTotalPages(meta.lastPage);
        } catch (error) {
            console.error('Error fetching comments:', error);
            toast.error('Failed to fetch comments');
        }
    }, [user]);

    const fetchReports = useCallback(async (pageNum = 1) => {
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/admin/reports?page=${pageNum}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch reports');
            const { data, meta } = await readNestJson(res);
            setReports(data);
            setReportPage(meta.page);
            setReportTotalPages(meta.lastPage);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Failed to fetch reports');
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            Promise.all([fetchComments(1), fetchReports(1)])
                .finally(() => setLoading(false));
        }
    }, [user, fetchComments, fetchReports]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchComments(newPage);
        }
    };

    const handleReportPageChange = (newPage) => {
        if (newPage >= 1 && newPage <= reportTotalPages) {
            fetchReports(newPage);
        }
    };

    // ... (rest of the handlers: handleToggleHidden, handleDelete, handleUpdateReportStatus)

    const handleToggleHidden = async (commentId, currentHidden) => {
        try {
            const token = await user.getIdToken();
            const endpoint = currentHidden ? 'unhide' : 'hide';
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${commentId}/${endpoint}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error(`Failed to ${endpoint} comment`);

            setComments(comments.map(c =>
                c.id === commentId ? { ...c, hidden: !currentHidden } : c
            ));
            toast.success(`Comment ${currentHidden ? 'visible' : 'hidden'}`);
        } catch (error) {
            console.error('Error toggling visibility:', error);
            toast.error('Failed to update comment status');
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedComments(comments.map(c => c.id));
        } else {
            setSelectedComments([]);
        }
    };

    const handleSelectComment = (commentId, checked) => {
        if (checked) {
            setSelectedComments(prev => [...prev, commentId]);
        } else {
            setSelectedComments(prev => prev.filter(id => id !== commentId));
        }
    };

    const handleSelectAllReports = (checked) => {
        if (checked) {
            setSelectedReports(reports.map(r => r.id));
        } else {
            setSelectedReports([]);
        }
    };

    const handleSelectReport = (reportId, checked) => {
        if (checked) {
            setSelectedReports(prev => [...prev, reportId]);
        } else {
            setSelectedReports(prev => prev.filter(id => id !== reportId));
        }
    };

    const handleBulkDeleteClick = () => {
        setConfirmConfig({
            isOpen: true,
            title: 'Delete Comments',
            description: `Are you sure you want to delete ${selectedComments.length} comments? This action cannot be undone.`,
            action: bulkDeleteComments
        });
    };

    const bulkDeleteComments = async () => {
        setConfirmConfig(prev => ({ ...prev, loading: true }));
        try {
            const token = await user.getIdToken();
            await Promise.all(selectedComments.map(id =>
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                })
            ));

            setComments(comments.filter(c => !selectedComments.includes(c.id)));
            setSelectedComments([]);
            toast.success('Comments deleted');
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
            console.error('Error deleting comments:', error);
            toast.error('Failed to delete comments');
            setConfirmConfig(prev => ({ ...prev, loading: false }));
        }
    };

    const handleBulkHide = async (hide) => {
        try {
            const token = await user.getIdToken();
            const endpoint = hide ? 'hide' : 'unhide';

            await Promise.all(selectedComments.map(id =>
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${id}/${endpoint}`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` }
                })
            ));

            setComments(comments.map(c =>
                selectedComments.includes(c.id) ? { ...c, hidden: hide } : c
            ));
            setSelectedComments([]);
            toast.success(`Comments ${hide ? 'hidden' : 'visible'}`);
        } catch (error) {
            console.error('Error updating comments:', error);
            toast.error('Failed to update comments');
        }
    };

    const handleDeleteClick = (commentId) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Delete Comment',
            description: 'Are you sure you want to delete this comment permanently? This action cannot be undone.',
            action: () => deleteComment(commentId)
        });
    };

    const deleteComment = async (commentId) => {
        setConfirmConfig(prev => ({ ...prev, loading: true }));
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${commentId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to delete comment');

            // Remove from comments list
            setComments(comments.filter(c => c.id !== commentId));

            // Update associated reports to resolved
            setReports(reports.map(r =>
                r.commentId === commentId ? { ...r, status: 'resolved' } : r
            ));

            toast.success('Comment deleted and reports resolved');
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast.error('Failed to delete comment');
            setConfirmConfig(prev => ({ ...prev, loading: false }));
        }
    };

    const handleRejectReportClick = (reportId) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Reject Report',
            description: 'Are you sure you want to reject this report? This will remove the report but keep the comment.',
            action: () => rejectReport(reportId)
        });
    };

    const rejectReport = async (reportId) => {
        setConfirmConfig(prev => ({ ...prev, loading: true }));
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/admin/reports/${reportId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to delete report');

            setReports(reports.filter(r => r.id !== reportId));
            setReports(reports.filter(r => r.id !== reportId));
            toast.success('Report rejected');
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
            console.error('Error rejecting report:', error);
            toast.error('Failed to reject report');
            setConfirmConfig(prev => ({ ...prev, loading: false }));
        }
    };

    const handleUpdateReportStatus = async (reportId, status) => {
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/admin/reports/${reportId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (!res.ok) throw new Error('Failed to update report status');

            setReports(reports.map(r =>
                r.id === reportId ? { ...r, status } : r
            ));
            toast.success(`Report marked as ${status}`);
        } catch (error) {
            console.error('Error updating report:', error);
            toast.error('Failed to update report status');
        }
    };

    const handleBulkRejectReportsClick = () => {
        setConfirmConfig({
            isOpen: true,
            title: 'Reject Reports',
            description: `Are you sure you want to reject ${selectedReports.length} reports? This will remove the reports but keep the comments.`,
            action: bulkRejectReports
        });
    };

    const bulkRejectReports = async () => {
        setConfirmConfig(prev => ({ ...prev, loading: true }));
        try {
            const token = await user.getIdToken();
            await Promise.all(selectedReports.map(id =>
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/admin/reports/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                })
            ));

            setReports(reports.filter(r => !selectedReports.includes(r.id)));
            setSelectedReports([]);
            setReports(reports.filter(r => !selectedReports.includes(r.id)));
            setSelectedReports([]);
            toast.success('Reports rejected');
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
            console.error('Error rejecting reports:', error);
            toast.error('Failed to reject reports');
            setConfirmConfig(prev => ({ ...prev, loading: false }));
        }
    };

    const handleBulkResolveReportsClick = async () => {
        setConfirmConfig(prev => ({ ...prev, loading: true })); // Reuse loading state if needed, or just run immediately as it's less destructive
        // For resolve, maybe we don't need a confirm modal? Or maybe we do. Let's skip modal for resolve as it's reversible.
        // Actually, let's just do it directly.
        try {
            const token = await user.getIdToken();
            await Promise.all(selectedReports.map(id =>
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/admin/reports/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: 'resolved' })
                })
            ));

            setReports(reports.map(r =>
                selectedReports.includes(r.id) ? { ...r, status: 'resolved' } : r
            ));
            setSelectedReports([]);
            toast.success('Reports marked as resolved');
        } catch (error) {
            console.error('Error updating reports:', error);
            toast.error('Failed to update reports');
        }
    };

    if (loading) {
        return (
            <>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="space-y-6">


                {selectedReports.length > 0 && (
                    <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                        <span className="text-sm font-medium">
                            {selectedReports.length} reports selected
                        </span>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={handleBulkResolveReportsClick}>
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Resolved
                            </Button>
                            <Button size="sm" variant="destructive" onClick={handleBulkRejectReportsClick}>
                                <XCircle className="mr-2 h-4 w-4" /> Reject Selected
                            </Button>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Comments & Reports</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage user comments and moderation reports
                        </p>
                    </div>
                </div>

                {selectedComments.length > 0 && (
                    <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                        <span className="text-sm font-medium">
                            {selectedComments.length} selected
                        </span>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleBulkHide(true)}>
                                <EyeOff className="mr-2 h-4 w-4" /> Hide
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleBulkHide(false)}>
                                <Eye className="mr-2 h-4 w-4" /> Unhide
                            </Button>
                            <Button size="sm" variant="destructive" onClick={handleBulkDeleteClick}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                        </div>
                    </div>
                )}

                <Tabs defaultValue="comments" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="comments" className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            All Comments
                        </TabsTrigger>
                        <TabsTrigger value="reports" className="flex items-center gap-2">
                            <Flag className="h-4 w-4" />
                            Reports
                            {reports.length > 0 && reports.some(r => r.status === 'pending') && (
                                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                                    !
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="comments">
                        <Card>
                            <CardHeader>
                                <CardTitle>All Comments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">
                                                <Checkbox
                                                    checked={selectedComments.length === comments.length && comments.length > 0}
                                                    onCheckedChange={handleSelectAll}
                                                />
                                            </TableHead>
                                            <TableHead>Author</TableHead>
                                            <TableHead className="w-[40%]">Content</TableHead>
                                            <TableHead>Blog Post</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {comments.map((comment) => (
                                            <TableRow key={comment.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedComments.includes(comment.id)}
                                                        onCheckedChange={(checked) => handleSelectComment(comment.id, checked)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={comment.user?.avatarUrl} />
                                                            <AvatarFallback>{comment.displayName?.[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-sm">{comment.displayName}</span>
                                                            {comment.user?.role === 'ADMIN' && (
                                                                <span className="text-[10px] text-primary font-medium">ADMIN</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <p className="text-sm line-clamp-2" title={comment.content}>
                                                        {comment.content}
                                                    </p>
                                                </TableCell>
                                                <TableCell>
                                                    {comment.blog ? (
                                                        <Link href={`/blog/${comment.blog.slug}`} className="text-sm text-primary hover:underline line-clamp-1">
                                                            {comment.blog.title}
                                                        </Link>
                                                    ) : comment.project ? (
                                                        <Link href={`/project/${comment.project.slug}`} className="text-sm text-primary hover:underline line-clamp-1">
                                                            {comment.project.title}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">Unknown</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={comment.hidden ? "secondary" : "outline"}>
                                                        {comment.hidden ? "Hidden" : "Visible"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleToggleHidden(comment.id, comment.hidden)}>
                                                                {comment.hidden ? (
                                                                    <>
                                                                        <Eye className="mr-2 h-4 w-4" /> Unhide
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <EyeOff className="mr-2 h-4 w-4" /> Hide
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteClick(comment.id)}
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {comments.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                    No comments found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>

                                {/* Pagination Controls for Comments */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-end space-x-2 py-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(page - 1)}
                                            disabled={page === 1}
                                        >
                                            Previous
                                        </Button>
                                        <div className="text-sm font-medium">
                                            Page {page} of {totalPages}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(page + 1)}
                                            disabled={page === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reports">
                        <Card>
                            <CardHeader>
                                <CardTitle>Reported Comments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">
                                                <Checkbox
                                                    checked={selectedReports.length === reports.length && reports.length > 0}
                                                    onCheckedChange={handleSelectAllReports}
                                                />
                                            </TableHead>
                                            <TableHead>Reporter</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead className="w-[30%]">Comment Content</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reports.map((report) => (
                                            <TableRow key={report.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedReports.includes(report.id)}
                                                        onCheckedChange={(checked) => handleSelectReport(report.id, checked)}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium text-sm">
                                                    {report.reporterUid.slice(0, 8)}...
                                                </TableCell>
                                                <TableCell className="text-sm">{report.reason}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <p className="text-sm line-clamp-2 text-muted-foreground italic">
                                                            &quot;{report.comment?.content}&quot;
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <span className="font-medium">{report.comment?.displayName}</span>
                                                            {report.comment?.blog ? (
                                                                <Link href={`/blog/${report.comment.blog.slug}`} className="text-primary hover:underline">
                                                                    View Post
                                                                </Link>
                                                            ) : report.comment?.project ? (
                                                                <Link href={`/project/${report.comment.project.slug}`} className="text-primary hover:underline">
                                                                    View Post
                                                                </Link>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        report.status === 'resolved' ? 'default' :
                                                            report.status === 'rejected' ? 'secondary' :
                                                                'destructive'
                                                    }>
                                                        {report.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleUpdateReportStatus(report.id, 'resolved')}>
                                                                <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Resolved
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleRejectReportClick(report.id)}>
                                                                <XCircle className="mr-2 h-4 w-4" /> Reject (Delete Report)
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteClick(report.commentId)}
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete Comment
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {reports.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                    No reports found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>

                                {/* Pagination Controls for Reports */}
                                {reportTotalPages > 1 && (
                                    <div className="flex items-center justify-end space-x-2 py-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleReportPageChange(reportPage - 1)}
                                            disabled={reportPage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <div className="text-sm font-medium">
                                            Page {reportPage} of {reportTotalPages}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleReportPageChange(reportPage + 1)}
                                            disabled={reportPage === reportTotalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmConfig.action}
                title={confirmConfig.title}
                description={confirmConfig.description}
                loading={confirmConfig.loading}
            />
        </>
    );
}
