import { useState, useEffect } from 'react';
import { DefaultFooter, DefaultNavbar, Metadata } from "@/components/template";
import { Button } from '@/components/ui/Button';

import { Github, Facebook, Instagram, Linkedin, ArrowRight, Command } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import InteractiveBackground from '@/components/ui/InteractiveBackground';
import { extractTextFromTipTap } from '@/lib/utils';

export default function Home() {
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const calculateReadTime = (contentJSON) => {
    const text = extractTextFromTipTap(contentJSON);
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} mins read`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blogsRes, projectsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`)
        ]);

        if (blogsRes.ok) {
          const blogs = await blogsRes.json();
          setRecentBlogs(blogs.filter(b => b.status === 'PUBLISHED').slice(0, 9));
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
              Tớ là <strong className="font-semibold">Khoa Nguyễn (yun.khngn)</strong>, sinh viên ngành Kỹ thuật phần mềm tại FPT University.
              Công việc của tớ xoay quanh <strong className="font-semibold">Software Development</strong>,
              <strong className="font-semibold"> Graphic Design</strong> và <strong className="font-semibold">Guitarist</strong>.
              <br />Đây là nơi tớ lưu lại dự án, bài viết và những điều hay!
              <br />Chào mừng tới website của <strong className="font-semibold">yunkhngn</strong>!
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

          <div className="grid gap-8 md:grid-cols-3">
            {recentBlogs.map((blog) => {
              const plainText = extractTextFromTipTap(blog.contentJSON);
              const readTime = calculateReadTime(blog.contentJSON);
              const firstTag = blog.tags ? blog.tags.split(',')[0].trim() : 'Blog';

              return (
                <Link href={`/blog/${blog.slug || blog.id}`} key={blog.id} className="group flex flex-col space-y-4">
                  <div className="aspect-[4/3] relative rounded-2xl overflow-hidden bg-muted">
                    {blog.thumbnail && (
                      <Image
                        src={blog.thumbnail}
                        alt={blog.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-md border-none rounded-full px-3 py-1 text-xs font-medium">
                        {firstTag}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3 flex-1 flex flex-col">
                    <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                      <span>{format(new Date(blog.createdAt), 'd MMM yyyy')}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                      <span>{readTime}</span>
                    </div>

                    <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {blog.title}
                    </h3>

                    <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed flex-1">
                      {plainText}
                    </p>
                  </div>
                </Link>
              );
            })}
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
