import AdminLayout from "@/components/template/Admin/Layout";
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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

export default function AdminComments() {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [reportPage, setReportPage] = useState(1);
    const [reportTotalPages, setReportTotalPages] = useState(1);
    const limit = 100;

    const fetchComments = async (pageNum = 1) => {
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments?includeHidden=true&page=${pageNum}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch comments');
            const { data, meta } = await res.json();
            setComments(data);
            setPage(meta.page);
            setTotalPages(meta.lastPage);
        } catch (error) {
            console.error('Error fetching comments:', error);
            toast.error('Failed to fetch comments');
        }
    };

    const fetchReports = async (pageNum = 1) => {
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/admin/reports?page=${pageNum}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch reports');
            const { data, meta } = await res.json();
            setReports(data);
            setReportPage(meta.page);
            setReportTotalPages(meta.lastPage);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Failed to fetch reports');
        }
    };

    useEffect(() => {
        if (user) {
            Promise.all([fetchComments(1), fetchReports(1)])
                .finally(() => setLoading(false));
        }
    }, [user]);

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

    const handleDelete = async (commentId) => {
        if (!confirm('Are you sure you want to delete this comment permanently?')) return;

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
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast.error('Failed to delete comment');
        }
    };

    const handleDismissReport = async (reportId) => {
        if (!confirm('Are you sure you want to delete this report?')) return;

        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/admin/reports/${reportId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to delete report');

            setReports(reports.filter(r => r.id !== reportId));
            toast.success('Report deleted');
        } catch (error) {
            console.error('Error deleting report:', error);
            toast.error('Failed to delete report');
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

    if (loading) {
        return (
            <AdminLayout title="Comments & Reports">
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Comments & Reports">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Comments & Reports</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage user comments and moderation reports
                        </p>
                    </div>
                </div>

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
                                                                onClick={() => handleDelete(comment.id)}
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
                                                            {report.comment?.blogId && (
                                                                <Link href={`/blog/${report.comment.blogId}`} className="text-primary hover:underline">
                                                                    View Post
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        report.status === 'resolved' ? 'default' :
                                                            report.status === 'dismissed' ? 'secondary' :
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
                                                            <DropdownMenuItem onClick={() => handleDismissReport(report.id)}>
                                                                <XCircle className="mr-2 h-4 w-4" /> Dismiss (Delete)
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(report.commentId)}
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
        </AdminLayout>
    );
}
