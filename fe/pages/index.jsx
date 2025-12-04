import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Github,
  Facebook,
  Linkedin,
  Mail,
  FileText,
  Star,
  GitFork,
  Instagram,
  FileUser,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { extractTextFromTipTap } from '@/lib/utils';
import Layout from '@/components/template/Default/Layout';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import JsonLd from '@/components/seo/JsonLd';

export default function Home() {
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [featuredRepos, setFeaturedRepos] = useState([]);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/github/repos`);
        if (res.ok) {
          const data = await res.json();
          // Sort by stars and take top 3
          const topRepos = data
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 3);
          setFeaturedRepos(topRepos);
        }
      } catch (error) {
        console.error('Failed to fetch repos', error);
      }
    };
    fetchRepos();
  }, []);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});

  const calculateReadTime = (contentJSON) => {
    const text = extractTextFromTipTap(contentJSON);
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} mins read`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blogsRes, projectsRes, galleryRes, settingsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`)
        ]);

        if (blogsRes.ok) {
          const blogs = await blogsRes.json();
          setRecentBlogs(blogs.filter(b => b.status === 'PUBLISHED').slice(0, 3));
        }

        if (projectsRes.ok) {
          const projects = await projectsRes.json();
          setFeaturedProjects(projects.slice(0, 5));
        }

        if (galleryRes.ok) {
          const photos = await galleryRes.json();
          setGalleryPhotos(photos.slice(0, 10));
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          const settingsObj = settingsData.reduce((acc, curr) => {
            acc[curr.settingTitle] = curr.content;
            return acc;
          }, {});
          setSettings(settingsObj);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const jsonLdData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Khoa Nguyễn (yunkhngn)',
      url: 'https://yunkhngn.dev', // Replace with actual domain
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://yunkhngn.dev/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Khoa Nguyễn',
      url: 'https://yunkhngn.dev',
      image: 'https://github.com/yunkhngn.png',
      sameAs: [
        settings.facebook || 'https://facebook.com/yunkhngn',
        settings.instagram || 'https://instagram.com/yunkhngn',
        settings.github || 'https://github.com/yunkhngn',
        settings.linkedin || 'https://linkedin.com/in/yunkhngn'
      ],
      jobTitle: 'Software Developer',
      worksFor: {
        '@type': 'Organization',
        name: 'FPT University'
      }
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 md:py-24 max-w-7xl space-y-32">
      <JsonLd data={jsonLdData} />
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center justify-center space-y-8 py-20 md:py-32 max-w-4xl mx-auto">

        <div className="space-y-6">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter font-serif">
            Khoa Nguyễn
          </h1>
        </div>

        <div className="space-y-6 text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          <p>
            Tớ là <strong className="font-semibold">Khoa Nguyễn (yun.khngn)</strong>, sinh viên ngành Kỹ thuật phần mềm tại FPT University.
            Công việc của tớ xoay quanh <strong className="font-semibold">Software Development</strong>,
            <strong className="font-semibold"> Graphic Design</strong> và <strong className="font-semibold">Guitarist</strong>.
            <br />Đây là nơi tớ lưu lại dự án, bài viết và những điều hay!
            <br />Chào mừng tới website của <strong className="font-semibold">yunkhngn</strong>!
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-8 relative z-10">
          <Link href="/showcase">
            <Button className="rounded-full px-8 h-12 text-base">
              Showcase
            </Button>
          </Link>

          <div className="flex gap-6">
            {(settings.facebook || settings.instagram || settings.github || settings.linkedin) ? (
              <>
                {settings.facebook && <SocialLink href={settings.facebook} icon={<Facebook size={24} />} label="Facebook" />}
                {settings.instagram && <SocialLink href={settings.instagram} icon={<Instagram size={24} />} label="Instagram" />}
                {settings.github && <SocialLink href={settings.github} icon={<Github size={24} />} label="GitHub" />}
                {settings.linkedin && <SocialLink href={settings.linkedin} icon={<Linkedin size={24} />} label="LinkedIn" />}
                <SocialLink href="https://yunkhngn.dev/resume" icon={<FileUser size={24} />} label="Resume" />
              </>
            ) : (
              <>
                <SocialLink href="https://facebook.com/yunkhngn" icon={<Facebook size={24} />} label="Facebook" />
                <SocialLink href="https://instagram.com/yunkhngn" icon={<Instagram size={24} />} label="Instagram" />
                <SocialLink href="https://github.com/yunkhngn" icon={<Github size={24} />} label="GitHub" />
                <SocialLink href="https://linkedin.com/in/yunkhngn" icon={<Linkedin size={24} />} label="LinkedIn" />
                <SocialLink href="https://yunkhngn.dev/resume" icon={<FileUser size={24} />} label="Resume" />
              </>
            )}
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="max-w-3xl mx-auto space-y-12 text-lg leading-relaxed text-gray-600 dark:text-gray-300 font-medium">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-background shadow-xl">
            <Image
              src="https://github.com/yunkhngn.png"
              alt="Khoa Nguyễn"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground">Khoa Nguyễn</h2>
            <p className="text-muted-foreground text-base md:text-lg">Software Developer • Graphic Designer • Guitarist</p>
          </div>
        </div>

        {settings.bio ? (
          <div dangerouslySetInnerHTML={{ __html: settings.bio }} className="whitespace-pre-wrap" />
        ) : (
          <p>
            Xin chào, tớ là <strong className="text-foreground">Khoa Nguyễn (yun.khngn)</strong>, sinh viên chuyên ngành Kỹ thuật phần mềm tại Đại học FPT.
            Tớ đang là freelancer thiết kế đồ hoạ và là một guitarist.
            Tớ đang hướng tới trở thành một <strong className="text-foreground">Fullstack Developer</strong> và thực hiện thêm nhiều ước mơ phía trước.
          </p>
        )}
      </section>

      {/* Recent Blogs */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold font-serif">Recent Blogs</h2>
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

      {/* Featured Projects - Bento Grid */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold font-serif">Featured Projects</h2>
          <Link href="/project" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]">
          {featuredProjects.map((project, i) => (
            <Link
              href={`/project/${project.slug}`}
              key={project.id}
              className={`group relative rounded-2xl overflow-hidden bg-muted ${i === 0 ? 'md:col-span-2 md:row-span-2' : 'md:col-span-1 md:row-span-1'}`}
            >
              {project.cover && (
                <Image
                  src={project.cover}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

              <div className="absolute bottom-0 left-0 p-6 w-full">
                <h3 className={`font-bold text-white mb-2 ${i === 0 ? 'text-2xl md:text-3xl' : 'text-lg'}`}>
                  {project.title}
                </h3>
                {i === 0 && (
                  <p className="text-gray-200 line-clamp-2 mb-3 max-w-md">
                    {project.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(project.techStack) && project.techStack.slice(0, 2).map((tech, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm text-[10px] px-2 h-5">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Open Source Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold mb-12 text-center flex items-center justify-center gap-3">
          <Github className="h-8 w-8" />
          Open Source
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredRepos.map((repo) => (
            <a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block h-full"
            >
              <Card className="h-full hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="group-hover:text-primary transition-colors line-clamp-1">{repo.name}</span>
                    <Badge variant="secondary" className="font-normal text-xs">
                      {repo.language || 'Code'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm line-clamp-2 h-10">
                    {repo.description || 'No description available.'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {repo.stargazers_count}
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork className="h-4 w-4 text-blue-500" />
                      {repo.forks_count}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
          {featuredRepos.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-8">
              {loading ? 'Loading repositories...' : 'No featured repositories found.'}
            </div>
          )}
        </div>
        <div className="text-center mt-10">
          <Link href="https://github.com/yunkhngn?tab=repositories" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg" className="gap-2">
              View All Repositories <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Gallery - Masonry */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold font-serif">Locket Gallery</h2>
          <Link href="/photo" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
            View gallery <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {galleryPhotos.map((photo) => (
            <div key={photo.id} className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer">
              <Image
                src={photo.imageUrl}
                alt={photo.caption || 'Gallery Photo'}
                width={500}
                height={500}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                {photo.caption && (
                  <p className="text-white p-4 font-medium text-sm md:text-base">
                    {photo.caption}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

Home.getLayout = function getLayout(page) {
  return (
    <Layout
      title="Khoa Nguyễn - Software Developer / Graphic Designer"
      description="Xin chào, tớ là Khoa Nguyễn. Tớ là sinh viên chuyên ngành Kỹ thuật phần mềm tại Đại học FPT. Hiện tại tớ cũng đang là freelancer thiết kế đồ hoạ và phát triển một số dự án cá nhân."
    >
      {page}
    </Layout>
  );
};

function SocialLink({ href, icon, label }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            {icon}
          </a>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
