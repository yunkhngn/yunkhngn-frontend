'use client';

import { readNestJson } from '@/lib/api/readJson';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  FileText,
  Folder,
  Image as ImageIcon,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Clock,
  CheckCircle2,
  FileEdit,
  Upload,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  MessageSquare,
  Mail,
  Server,
  Database,
  Activity,
  X,
  Loader2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import Link from "next/link";
import { format, formatDistanceToNow, isValid } from "date-fns";
import { Badge } from "@/components/ui/Badge";
import { useRouter } from 'next/navigation'
import Image from "next/image";
import dynamic from 'next/dynamic';

const DashboardCharts = dynamic(() => import('@/components/admin/DashboardCharts'), {
  loading: () => <div className="h-96 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
  ssr: false
});

export default function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [stats, setStats] = useState({
    blogs: 0,
    blogsDraft: 0,
    blogsPublished: 0,
    projects: 0,
    gallery: 0,
    comments: 0,
    mailTotal: 0,
    mailReceived: 0,
    mailSent: 0
  });
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentPhotos, setRecentPhotos] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);

  const [activityData, setActivityData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };



        // Fetch consolidated dashboard stats
        const [dashboardRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/system/dashboard-stats`, { headers })
        ]);

        if (dashboardRes.ok) {
          const data = await readNestJson(dashboardRes);
          setStats(data.stats);
          setRecentBlogs(data.recentBlogs || []);
          setRecentProjects(data.recentProjects || []);
          setRecentPhotos(data.recentPhotos || []);
          setRecentContacts(data.recentContacts || []);
          
          const blogs = data.recentBlogs || [];
          const projects = data.recentProjects || [];
          const gallery = data.recentPhotos || [];
          const contacts = data.recentContacts || [];
          
          // Create activity feed
          const allActivities = [
            ...blogs.map(b => ({
              id: `blog-${b.id}`,
              type: 'blog',
              action: b.status === 'PUBLISHED' ? 'published' : 'drafted',
              title: b.title,
              timestamp: new Date(b.createdAt),
              status: b.status
            })),
            ...projects.map(p => ({
              id: `project-${p.id}`,
              type: 'project',
              action: 'added',
              title: p.title,
              timestamp: new Date(p.createdAt),
            })),
            ...gallery.map(g => ({
              id: `photo-${g.id}`,
              type: 'photo',
              action: 'uploaded',
              title: g.caption || 'Photo',
              timestamp: new Date(g.createdAt),
            })),
            ...contacts.map(c => ({
              id: `contact-${c.id}`,
              type: 'mail',
              action: 'received',
              title: `From: ${c.name} - ${c.subject}`,
              timestamp: new Date(c.createdAt),
            }))
          ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);

          setActivities(allActivities);

          // Build activityData for the Activity Timeline chart (last 7 days)
          const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
          });
          const allItems = [
            ...blogs.map(b => b.createdAt),
            ...projects.map(p => p.createdAt),
            ...gallery.map(g => g.createdAt),
            ...contacts.map(c => c.createdAt),
          ];
          const countsByDate = {};
          last7Days.forEach(d => { countsByDate[d] = 0; });
          allItems.forEach(ts => {
            const date = new Date(ts).toISOString().split('T')[0];
            if (countsByDate[date] !== undefined) countsByDate[date]++;
          });
          setActivityData(last7Days.map(d => ({
            date: new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            total: countsByDate[d],
          })));
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, analyticsPeriod]);

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, trend }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-2 rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-muted-foreground">{subtitle}</p>
          {trend && (
            <div className={`flex items-center text-xs text-muted-foreground`}>
              {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span className="ml-1">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const ActivityItem = ({ activity }) => {
    const getActivityIcon = () => {
      switch (activity.type) {
        case 'blog':
          return activity.action === 'published' ? CheckCircle2 : FileEdit;
        case 'project':
          return Folder;
        case 'photo':
          return Upload;
        case 'mail':
          return Mail;
        default:
          return Sparkles;
      }
    };

    const Icon = getActivityIcon();

    return (
      <div className="flex items-start gap-3 py-3 border-b last:border-0">
        <div className="p-2 rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium line-clamp-1">{activity.title}</p>
          <p className="text-xs text-muted-foreground">
            {activity.action} • {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
          </p>
        </div>
      </div>
    );
  };



  const handleGenerateSummary = async () => {
    setGeneratingAi(true);
    setShowAiModal(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/dashboard-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          stats,
          recentActivities: activities,
          language: 'vi' // Default to Vietnamese as requested
        })
      });

      if (!res.ok) throw new Error('Failed to generate summary');

      const data = await readNestJson(res);
      setAiSummary(data.summary);
    } catch (error) {
      console.error(error);
      setAiSummary('<p class="text-destructive">Failed to generate summary. Please try again later.</p>');
    } finally {
      setGeneratingAi(false);
    }
  };

  return (
    <>
      <Dialog open={showAiModal} onOpenChange={setShowAiModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              AI Weekly Summary
            </DialogTitle>
            <DialogDescription>
              AI-powered insights based on your dashboard activity.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {generatingAi ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Analyzing your data...</p>
              </div>
            ) : (
              <div
                className="prose dark:prose-invert max-w-none [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mt-4 [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>li]:mb-1"
                dangerouslySetInnerHTML={{ __html: aiSummary }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col h-[calc(100vh-6rem)] overflow-hidden gap-4">
        {/* Header */}
        <div className="flex-none flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Welcome back, {user?.displayName || user?.email}
            </p>
          </div>
          <div className="grid grid-cols-2 md:flex gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="col-span-2 md:col-span-1 border-yellow-500/50 hover:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
              onClick={handleGenerateSummary}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Summary
            </Button>
            <Button asChild variant="outline" size="sm" className="flex-1 md:flex-none">
              <Link href="/admin/blog/new">
                <Plus className="h-4 w-4 mr-2" />
                Blog
              </Link>
            </Button>
            <Button asChild size="sm" className="flex-1 md:flex-none">
              <Link href="/admin/project/add-project">
                <Plus className="h-4 w-4 mr-2" />
                Project
              </Link>
            </Button>
          </div>
        </div>


        {/* Stats Grid */}
        <div className="flex-none grid gap-3 grid-cols-2 lg:grid-cols-4 h-24">
          <StatCard
            title="Blogs"
            value={stats.blogs}
            subtitle={`${stats.blogsPublished} pub, ${stats.blogsDraft} draft`}
            icon={FileText}
          />
          <StatCard
            title="Projects"
            value={stats.projects}
            subtitle="Showcased works"
            icon={Folder}
          />
          <StatCard
            title="Comments"
            value={stats.comments}
            subtitle="Total interactions"
            icon={MessageSquare}
          />
          <StatCard
            title="Mail"
            value={stats.mailTotal}
            subtitle={`${stats.mailReceived} received`}
            icon={Mail}
          />
        </div>

        <DashboardCharts
          stats={stats}
          theme={theme}
          activityData={activityData}
        />

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          {/* Recent Blogs */}
          <Card className="lg:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Blogs
              </CardTitle>
              <Link href="/admin/blog" className="text-sm text-primary hover:underline flex items-center">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentBlogs.map((blog) => (
                  <div key={blog.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                    <div className="h-12 w-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {blog.thumbnail ? (
                        <Image src={blog.thumbnail} alt="" width={48} height={48} className="object-cover w-full h-full" />
                      ) : (
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-1 group-hover:text-primary transition-colors">{blog.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {blog.createdAt && isValid(new Date(blog.createdAt)) ? format(new Date(blog.createdAt), 'MMM d, yyyy') : 'No Date'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={blog.status === 'PUBLISHED' ? 'default' : 'secondary'} className="text-xs">
                        {blog.status}
                      </Badge>
                      <Link href={`/admin/blog/${blog.slug || blog.id}/edit`}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                {recentBlogs.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">No blogs yet.</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed & Quick Actions */}
          <div className="lg:col-span-3 space-y-4">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Link href="/admin/blog/new">
                  <Button className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" /> Create New Blog
                  </Button>
                </Link>
                <Link href="/admin/project/add-project">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Add New Project
                  </Button>
                </Link>
                <Link href="/admin/photo">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Upload Photo
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {activities.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                  {activities.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">No recent activity.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Projects & Gallery */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {/* Recent Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Recent Projects
              </CardTitle>
              <Link href="/admin/project" className="text-sm text-primary hover:underline flex items-center">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentProjects.map((project) => (
                  <Link
                    href={`/admin/project/${project.slug}`}
                    key={project.id}
                    className="group relative aspect-video rounded-lg overflow-hidden bg-muted hover:shadow-md transition-shadow border"
                  >
                    {project.cover ? (
                      <Image
                        src={project.cover}
                        alt={project.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Folder className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                      <div className="p-2 w-full">
                        <p className="text-foreground text-sm font-medium line-clamp-1">{project.title}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {recentProjects.length === 0 && (
                <div className="text-center text-muted-foreground py-8">No projects yet.</div>
              )}
            </CardContent>
          </Card>

          {/* Recent Photos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Recent Photos
              </CardTitle>
              <Link href="/admin/photo" className="text-sm text-primary hover:underline flex items-center">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {recentPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-lg overflow-hidden bg-muted hover:shadow-md transition-shadow group cursor-pointer border"
                  >
                    <Image
                      src={photo.imageUrl}
                      alt={photo.caption || 'Photo'}
                      width={200}
                      height={200}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
              {recentPhotos.length === 0 && (
                <div className="text-center text-muted-foreground py-8">No photos yet.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div >
    </>
  );
}