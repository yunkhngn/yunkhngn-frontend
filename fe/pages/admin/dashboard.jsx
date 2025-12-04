import AdminLayout from "@/components/template/Admin/Layout";
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
import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/Badge";
import { useRouter } from "next/router";
import Image from "next/image";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, LineChart, Line } from 'recharts';

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

  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('24h');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };

        const [blogsRes, projectsRes, galleryRes, commentsRes, contactRes, analyticsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments?limit=1`, { headers }), // Fetch just 1 to get total count from meta
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/analytics?period=${analyticsPeriod}`, { headers })
        ]);

        const blogs = await blogsRes.json();
        const projects = await projectsRes.json();
        const gallery = await galleryRes.json();
        const commentsData = await commentsRes.json();
        const contacts = await contactRes.json();

        if (analyticsRes.ok) {
          const analytics = await analyticsRes.json();
          setAnalyticsData(analytics);
        }

        const publishedBlogs = blogs.filter(b => b.status === 'PUBLISHED');
        const draftBlogs = blogs.filter(b => b.status === 'DRAFT');
        const respondedContacts = contacts.filter(c => c.status === 'responded' || c.adminResponse);

        setStats({
          blogs: blogs.length,
          blogsDraft: draftBlogs.length,
          blogsPublished: publishedBlogs.length,
          projects: projects.length,
          gallery: gallery.length,
          comments: commentsData.meta?.total || 0,
          mailTotal: contacts.length + respondedContacts.length,
          mailReceived: contacts.length,
          mailSent: respondedContacts.length
        });

        setRecentBlogs(blogs.slice(0, 5));
        setRecentProjects(projects.slice(0, 4));
        setRecentPhotos(gallery.slice(0, 6));
        setRecentContacts(contacts.slice(0, 5));

        // Create activity feed
        const allActivities = [
          ...blogs.slice(0, 3).map(b => ({
            id: `blog-${b.id}`,
            type: 'blog',
            action: b.status === 'PUBLISHED' ? 'published' : 'drafted',
            title: b.title,
            timestamp: new Date(b.updatedAt || b.createdAt),
            status: b.status
          })),
          ...projects.slice(0, 2).map(p => ({
            id: `project-${p.id}`,
            type: 'project',
            action: 'added',
            title: p.title,
            timestamp: new Date(p.createdAt),
          })),
          ...gallery.slice(0, 2).map(g => ({
            id: `photo-${g.id}`,
            type: 'photo',
            action: 'uploaded',
            title: g.caption || 'Photo',
            timestamp: new Date(g.createdAt),
          })),
          ...contacts.slice(0, 3).map(c => ({
            id: `contact-${c.id}`,
            type: 'mail',
            action: 'received',
            title: `From: ${c.name} - ${c.subject}`,
            timestamp: new Date(c.createdAt),
          }))
        ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);

        setActivities(allActivities);
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
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
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

  // Chart data - dynamic colors based on theme
  const isDark = theme === 'dark';
  const contentData = [
    { name: 'Blogs', value: stats.blogs, color: isDark ? '#f5f5f5' : '#171717' },      // light: gray-100, dark: gray-900
    { name: 'Projects', value: stats.projects, color: isDark ? '#d4d4d4' : '#525252' }, // light: gray-300, dark: gray-600
    { name: 'Photos', value: stats.gallery, color: isDark ? '#a3a3a3' : '#737373' }     // light: gray-400, dark: gray-500
  ];

  const blogStatusData = [
    { name: 'Published', value: stats.blogsPublished, color: isDark ? '#f5f5f5' : '#171717' }, // light: gray-100, dark: gray-900
    { name: 'Draft', value: stats.blogsDraft, color: isDark ? '#d4d4d4af' : '#525252' }          // light: gray-300, dark: gray-600
  ];

  // Activity timeline data - last 7 days
  const getActivityData = () => {
    const days = 7;
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Count items created on this date
      const blogsCount = recentBlogs.filter(b =>
        new Date(b.createdAt).toISOString().split('T')[0] === dateStr
      ).length;

      const projectsCount = recentProjects.filter(p =>
        new Date(p.createdAt).toISOString().split('T')[0] === dateStr
      ).length;

      const photosCount = recentPhotos.filter(p =>
        new Date(p.createdAt).toISOString().split('T')[0] === dateStr
      ).length;

      const contactsCount = recentContacts.filter(c =>
        new Date(c.createdAt).toISOString().split('T')[0] === dateStr
      ).length;

      data.push({
        date: format(date, 'MMM dd'),
        blogs: blogsCount,
        projects: projectsCount,
        photos: photosCount,
        mail: contactsCount,
        total: blogsCount + projectsCount + photosCount + contactsCount
      });
    }

    return data;
  };

  const activityData = getActivityData();

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

      const data = await res.json();
      setAiSummary(data.summary);
    } catch (error) {
      console.error(error);
      setAiSummary('<p class="text-destructive">Failed to generate summary. Please try again later.</p>');
    } finally {
      setGeneratingAi(false);
    }
  };

  return (
    <AdminLayout title="Dashboard">
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

      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.displayName || user?.email}
            </p>
          </div>
          <div className="grid grid-cols-2 md:flex gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              className="col-span-2 md:col-span-1 border-yellow-500/50 hover:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
              onClick={handleGenerateSummary}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Summary
            </Button>
            <Button asChild variant="outline" className="flex-1 md:flex-none">
              <Link href="/admin/blog/new">
                <Plus className="h-4 w-4 mr-2" />
                New Blog
              </Link>
            </Button>
            <Button asChild className="flex-1 md:flex-none">
              <Link href="/admin/project/add-project">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Link>
            </Button>
          </div>
        </div>

        {/* System Status */}
        {/* System Status */}
        <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-full bg-green-500/20 text-green-500">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Backend API</p>
                <p className="text-xs text-green-500 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Operational
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-full bg-green-500/20 text-green-500">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Database</p>
                <p className="text-xs text-green-500 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Connected
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-full bg-green-500/20 text-green-500">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Mail Service</p>
                <p className="text-xs text-green-500 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        {/* Stats Grid */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Blogs"
            value={stats.blogs}
            subtitle={`${stats.blogsPublished} published, ${stats.blogsDraft} drafts`}
            icon={FileText}
          />
          <StatCard
            title="Projects"
            value={stats.projects}
            subtitle="Showcased works"
            icon={Folder}
          />
          <StatCard
            title="Gallery"
            value={stats.gallery}
            subtitle="Photos uploaded"
            icon={ImageIcon}
          />
          <StatCard
            title="Published"
            value={stats.blogsPublished}
            subtitle="Live articles"
            icon={CheckCircle2}
          />
          <StatCard
            title="Total Comments"
            value={stats.comments}
            subtitle="Across all posts"
            icon={MessageSquare}
          />
          <StatCard
            title="Total Mail"
            value={stats.mailTotal}
            subtitle="Total interactions"
            icon={Mail}
          />
          <StatCard
            title="Received"
            value={stats.mailReceived}
            subtitle="Incoming messages"
            icon={Mail}
          />
          <StatCard
            title="Responded"
            value={stats.mailSent}
            subtitle="Replies sent"
            icon={Mail}
          />
        </div>

        {/* Analytics Section */}
        {analyticsData && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Web Analytics
              </CardTitle>
              <Select value={analyticsPeriod} onValueChange={setAnalyticsPeriod}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold">{analyticsData.totals.requests.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Data Transfer</p>
                  <p className="text-2xl font-bold">{(analyticsData.totals.bytes / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Page Views</p>
                  <p className="text-2xl font-bold">{analyticsData.totals.pageViews.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Threats Blocked</p>
                  <p className="text-2xl font-bold">{analyticsData.totals.threats.toLocaleString()}</p>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#404040" : "#e5e5e5"} />
                    <XAxis
                      dataKey="time"
                      tickFormatter={(time) => format(new Date(time), analyticsPeriod === '24h' ? 'HH:mm' : 'MMM dd')}
                      stroke={isDark ? "#a3a3a3" : "#737373"}
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis
                      stroke={isDark ? "#a3a3a3" : "#737373"}
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                      labelFormatter={(label) => format(new Date(label), 'MMM dd, HH:mm')}
                      contentStyle={{
                        backgroundColor: isDark ? '#171717' : '#ffffff',
                        border: `1px solid ${isDark ? '#404040' : '#e5e5e5'}`,
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="requests" stroke={isDark ? "#f5f5f5" : "#171717"} name="Requests" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="pageViews" stroke={isDark ? "#a3a3a3" : "#737373"} name="Page Views" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts Section */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {/* Content Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Content Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={contentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {contentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Blog Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Blog Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={blogStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {blogStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Activity Timeline Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Activity Timeline (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isDark ? "#f5f5f5" : "#171717"} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={isDark ? "#f5f5f5" : "#171717"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#404040" : "#e5e5e5"} />
                <XAxis
                  dataKey="date"
                  stroke={isDark ? "#a3a3a3" : "#737373"}
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke={isDark ? "#a3a3a3" : "#737373"}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#171717' : '#ffffff',
                    border: `1px solid ${isDark ? '#404040' : '#e5e5e5'}`,
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke={isDark ? "#f5f5f5" : "#171717"}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
                        {format(new Date(blog.createdAt), 'MMM d, yyyy')}
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
      </div>
    </AdminLayout>
  );
}