import { useState, useEffect } from 'react';
import { DefaultFooter, DefaultNavbar, Metadata } from "@/components/template";
import { Button } from '@/components/ui/Button';
import { CommandMenu } from '@/components/ui/CommandMenu';
import { Github, Facebook, Instagram, Linkedin, ArrowRight, Command } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import InteractiveBackground from '@/components/ui/InteractiveBackground';

export default function Home() {
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blogsRes, projectsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`)
        ]);

        if (blogsRes.ok) {
          const blogs = await blogsRes.json();
          setRecentBlogs(blogs.filter(b => b.status === 'PUBLISHED').slice(0, 3));
        }

        if (projectsRes.ok) {
          const projects = await projectsRes.json();
          setFeaturedProjects(projects.slice(0, 3));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background text-foreground relative">
      <Metadata
        title="Khoa Nguyễn - Graphic Designer / Software Engineer"
        description="Portfolio of Khoa Nguyễn (yun.khngn)"
      />

      <div className="absolute top-0 left-0 w-full h-screen overflow-hidden z-0">
        <InteractiveBackground />
      </div>

      <DefaultNavbar />
      <CommandMenu />

      <main className="flex-1 container mx-auto px-4 py-12 md:py-24 max-w-5xl space-y-24 relative z-10">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center justify-center space-y-8 py-20 md:py-32 max-w-4xl mx-auto">

          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter font-serif">
              Khoa Nguyễn
            </h1>
          </div>

          <div className="space-y-6 text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-light">
            <p>
              Xin chào, tớ là Khoa Nguyễn (yun.khngn), sinh viên chuyên ngành Kỹ thuật phần mềm tại Đại học FPT.
              Tớ đang là freelancer thiết kế đồ hoạ và là một guitarist.
              Tớ đang hướng tới trở thành một Fullstack Developer và thực hiện thêm nhiều ước mơ phía trước.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 relative z-10">
            <Link href="/resume">
              <Button className="rounded-full px-8 h-12 text-base">
                Resume
              </Button>
            </Link>

            <div className="flex gap-6">
              <SocialLink href="https://facebook.com/yunkhngn" icon={<Facebook size={24} />} />
              <SocialLink href="https://instagram.com/yunkhngn" icon={<Instagram size={24} />} />
              <SocialLink href="https://github.com/yunkhngn" icon={<Github size={24} />} />
              <SocialLink href="https://linkedin.com/in/yunkhngn" icon={<Linkedin size={24} />} />
            </div>
          </div>
        </section>

        {/* Recent Blogs */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Writings</h2>
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {recentBlogs.map((blog) => (
              <Link href={`/blog/${blog.slug || blog.id}`} key={blog.id} className="group block space-y-3">
                <div className="aspect-video relative rounded-xl overflow-hidden bg-muted">
                  {blog.thumbnail && (
                    <Image
                      src={blog.thumbnail}
                      alt={blog.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {format(new Date(blog.createdAt), 'MMM d, yyyy')}
                  </div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Projects */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Featured Projects</h2>
            <Link href="/project" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {featuredProjects.map((project) => (
              <Link href={`/project/${project.id}`} key={project.id} className="group flex gap-4 items-start p-4 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden relative flex-shrink-0">
                  {project.cover && (
                    <Image
                      src={project.cover}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold group-hover:text-primary transition-colors mb-1">
                    {project.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(project.techStack) && project.techStack.slice(0, 3).map((tech, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <DefaultFooter />
    </div>
  );
}

function SocialLink({ href, icon }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted-foreground hover:text-foreground transition-colors p-1"
    >
      {icon}
    </a>
  );
}
