import AdminLayout from "@/components/template/Admin/Layout";
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileText, Folder, Image as ImageIcon, Plus, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/Badge";
import { useRouter } from "next/router";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    blogs: 0,
    projects: 0,
    gallery: 0
  });
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
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

        setStats({
          blogs: blogs.length,
          projects: projects.length,
          gallery: gallery.length
        });

        setRecentBlogs(blogs.slice(0, 5));
        setRecentProjects(projects.slice(0, 5));
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

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.blogs}</div>
              <p className="text-xs text-muted-foreground">Published articles</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.projects}</div>
              <p className="text-xs text-muted-foreground">Showcased projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gallery Images</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.gallery}</div>
              <p className="text-xs text-muted-foreground">Captured moments</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Recent Blogs */}
          <Card className="col-span-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Blogs</CardTitle>
              <Link href="/admin/blog" className="text-sm text-primary hover:underline flex items-center">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBlogs.map((blog) => (
                  <div key={blog.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium line-clamp-1">{blog.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(blog.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <Badge variant={blog.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                      {blog.status}
                    </Badge>
                  </div>
                ))}
                {recentBlogs.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">No blogs yet.</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Recent Projects */}
          <div className="col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Link href="/admin/blog/new">
                  <Button className="w-full justify-start" variant="outline">
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

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Projects</CardTitle>
                <Link href="/admin/project" className="text-sm text-primary hover:underline flex items-center">
                  View all <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="flex items-center gap-3 border-b pb-2 last:border-0 last:pb-0">
                      <div className="h-8 w-8 rounded bg-muted overflow-hidden relative flex-shrink-0">
                        {project.cover && (
                          <img src={project.cover} alt="" className="object-cover w-full h-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{project.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{project.description}</p>
                      </div>
                    </div>
                  ))}
                  {recentProjects.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">No projects yet.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}