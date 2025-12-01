import AdminLayout from "@/components/template/Admin/Layout";
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/Badge";
import { useRouter } from "next/router";
import Image from "next/image";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    blogs: 0,
    blogsDraft: 0,
    blogsPublished: 0,
    projects: 0,
    gallery: 0
  });
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentPhotos, setRecentPhotos] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };

        const [blogsRes, projectsRes, galleryRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery`)
        ]);

        const blogs = await blogsRes.json();
        const projects = await projectsRes.json();
        const gallery = await galleryRes.json();

        const publishedBlogs = blogs.filter(b => b.status === 'PUBLISHED');
        const draftBlogs = blogs.filter(b => b.status === 'DRAFT');

        setStats({
          blogs: blogs.length,
          blogsDraft: draftBlogs.length,
          blogsPublished: publishedBlogs.length,
          projects: projects.length,
          gallery: gallery.length
        });

        setRecentBlogs(blogs.slice(0, 5));
        setRecentProjects(projects.slice(0, 4));
        setRecentPhotos(gallery.slice(0, 6));

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
          }))
        ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 6);

        setActivities(allActivities);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

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

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground">Here's what's happening with your content today.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        </div>

        <div className="grid gap-4 lg:grid-cols-7">
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
        <div className="grid gap-4 md:grid-cols-2">
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
              <div className="grid grid-cols-2 gap-3">
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