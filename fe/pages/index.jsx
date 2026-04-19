import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
  ArrowRight,
  LayoutGrid
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
import Terminal from '@/components/home/Terminal';
import { getOptimizedUrl, getBlurUrl } from '@/lib/cloudinary';
import { readCachedSettings, writeCachedSettings } from '@/lib/settingsCache';

export default function Home({
  recentBlogs = [],
  featuredRepos = [],
  featuredProjects = [],
  galleryPhotos = [],
  settings: initialSettings = {}
}) {
  const [cachedSettings, setCachedSettings] = useState({});
  const settings =
    initialSettings && Object.keys(initialSettings).length > 0
      ? initialSettings
      : cachedSettings || {};

  useEffect(() => {
    if (!initialSettings || Object.keys(initialSettings).length === 0) {
      setCachedSettings(readCachedSettings() || {});
    }
  }, [initialSettings]);

  useEffect(() => {
    if (initialSettings && Object.keys(initialSettings).length > 0) {
      writeCachedSettings(initialSettings);
    }
  }, [initialSettings]);

  const calculateReadTime = (contentJSON) => {
    const text = extractTextFromTipTap(contentJSON);
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} mins read`;
  };

  const jsonLdData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Khoa Nguyễn (yunkhngn)',
      url: 'https://yunkhngn.dev',
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
      jobTitle: 'Software Engineer',
      worksFor: {
        '@type': 'Organization',
        name: 'FPT University'
      }
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 md:py-24 max-w-7xl space-y-20">
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
            I am <strong className="font-semibold">Khoa Nguyen (yun.khngn)</strong> - a talented software engineering student, self-taught creator, graphic designer, and guitarist/musician, driven by ambition, curiosity, and the desire to turn ideas into something real.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-8 relative z-10">
          <Link href="/resume">
            <Button className="rounded-full px-8 h-12 text-base">
              Resume
            </Button>
          </Link>

          <div className="flex gap-6">
            {(settings.facebook || settings.instagram || settings.tiktok || settings.github || settings.linkedin) ? (
              <>
                {settings.facebook && <SocialLink href={settings.facebook} icon={<Facebook size={24} />} label="Facebook" />}
                {settings.instagram && <SocialLink href={settings.instagram} icon={<Instagram size={24} />} label="Instagram" />}
                {settings.tiktok && <SocialLink href={settings.tiktok} icon={<TikTok size={24} />} label="TikTok" />}
                {settings.github && <SocialLink href={settings.github} icon={<Github size={24} />} label="GitHub" />}
                {settings.linkedin && <SocialLink href={settings.linkedin} icon={<Linkedin size={24} />} label="LinkedIn" />}
                <SocialLink href="/showcase" icon={<LayoutGrid size={24} />} label="Showcase" />
              </>
            ) : (
              <>
                <SocialLink href="https://facebook.com/yunkhngn" icon={<Facebook size={24} />} label="Facebook" />
                <SocialLink href="https://instagram.com/yunkhngn" icon={<Instagram size={24} />} label="Instagram" />
                <SocialLink href="https://www.tiktok.com/@yun.khngn" icon={<TikTok size={24} />} label="TikTok" />
                <SocialLink href="https://github.com/yunkhngn" icon={<Github size={24} />} label="GitHub" />
                <SocialLink href="https://linkedin.com/in/yunkhngn" icon={<Linkedin size={24} />} label="LinkedIn" />
                <SocialLink href="/showcase" icon={<LayoutGrid size={24} />} label="Showcase" />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Neofetch Style Window */}
      <section className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full rounded-xl overflow-hidden border border-border/50 bg-black/95 shadow-2xl relative"
        >
          {/* Unified Window Header */}
          <div className="bg-muted/10 px-4 py-3 flex items-center justify-between border-b border-white/10 backdrop-blur-md">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors" />
              <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors" />
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono flex items-center gap-2 opacity-70">
              <span className="hidden md:inline">yunkhngn@macbook-pro: ~</span>
            </div>
            <div className="opacity-0 w-12" /> {/* Spacer */}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Pane: Profile */}
            <div className="p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col items-center lg:items-start text-center lg:text-left justify-center bg-gradient-to-b from-white/5 to-transparent">
              <div className="relative mb-8">
                <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl">
                  <Image
                    src={settings.avatar || "https://github.com/yunkhngn.png"}
                    alt="Khoa Nguyễn"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute bottom-4 right-4 w-5 h-5 bg-green-500 border-4 border-[#1a1a1a] rounded-full animate-pulse z-10" />
              </div>

              <div className="space-y-4 w-full">
                <h2 className="text-4xl md:text-5xl font-bold font-heading tracking-tight text-white mb-2">
                  Khoa Nguyễn
                </h2>
                <div className="flex flex-col gap-2 text-sm md:text-base font-mono text-muted-foreground/80">
                  <div className="flex items-center gap-3 justify-center lg:justify-start">
                    <span className="text-blue-400">role:</span>
                    <span className="text-gray-300">Software Engineer</span>
                  </div>
                  <div className="flex items-center gap-3 justify-center lg:justify-start">
                    <span className="text-blue-400">also:</span>
                    <span className="text-gray-300">Graphic Designer & Guitarist</span>
                  </div>
                  <div className="flex items-center gap-3 justify-center lg:justify-start">
                    <span className="text-blue-400">location:</span>
                    <span className="text-gray-300">Hanoi, Vietnam</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-base leading-relaxed text-gray-400 font-light max-w-md">
                {
                  settings.homepage_description ? (
                    <div
                      className="whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(settings.homepage_description)
                      }}
                    />
                  ) : (
                    <p>
                      Hi, I&apos;m <strong className="text-gray-200 font-medium">Khoa</strong>. I build things for the web and sometimes I break them too. Welcome to my personal terminal.
                    </p>
                  )
                }
              </div>
            </div>

            {/* Right Pane: Terminal */}
            <div className="bg-black/50 min-h-[400px] lg:min-h-[500px] relative">
              <Terminal embedded className="h-full border-none shadow-none bg-transparent !my-0 !rounded-none" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* DigitalOcean Support Banner */}
      <section className="w-full">
        <a
          href="https://www.digitalocean.com/?refcode=623e10fe3eb7&utm_campaign=Referral_Invite&utm_medium=Referral_Program&utm_source=badge"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full"
        >
          <div className="transition-all duration-300 w-full rounded-2xl border border-[#0080ff]/30 bg-gradient-to-r from-[#0061eb]/10 via-[#0080ff]/5 to-[#0061eb]/10 hover:from-[#0061eb]/20 hover:via-[#0080ff]/10 hover:to-[#0061eb]/20 transition-all duration-300 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* DigitalOcean logo SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="h-10 w-10 flex-shrink-0">
                <circle cx="100" cy="100" r="100" fill="#0080ff" />
                <path d="M100 139.8v-28.5c19.5 0 34.7-19.4 27.1-40.1-3.1-8.7-10.2-15.7-19-18.9-20.7-7.5-40.1 7.6-40.1 27.1H39.4C39.4 49.7 68.7 19 101 19c34.4 0 62.2 27.8 62.2 62.2 0 32.4-24.4 59.1-55.9 62.1l-7.3-.5zM71.5 160.5H100v-28.5H71.5v28.5zM47.5 160.5h24v-24h-24v24zM47.5 136.5H71.5v-24H47.5v24z" fill="white" />
              </svg>
              <div>
                <p className="font-semibold text-base text-foreground">Ủng hộ nuôi website</p>
                <p className="text-sm text-muted-foreground">Nếu bạn là Dev, hãy đăng ký DigitalOcean qua link này, bạn nhận $200 credit - mình cũng được hỗ trợ chi phí duy trì server</p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#0080ff] hover:bg-[#0061eb] text-white text-sm font-medium px-5 py-2.5 transition-colors">
                Đăng ký ngay
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </a>
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
                    <span suppressHydrationWarning>{format(new Date(blog.createdAt), 'd MMM yyyy')}</span>
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full">
                <h3 className={`font-bold text-white mb-1 md:mb-2 ${i === 0 ? 'text-xl md:text-2xl lg:text-3xl' : 'text-base md:text-lg'}`}>
                  {project.title}
                </h3>
                {i === 0 && (
                  <p className="text-gray-200 text-sm md:text-base line-clamp-2 mb-2 md:mb-3 max-w-md">
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
      </section >

      {/* Open Source Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold mb-12 flex items-center gap-3">
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
              No featured repositories found.
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
      </section >

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
                src={getOptimizedUrl(photo.imageUrl, { width: 500, quality: 80 })}
                alt={photo.caption || 'Gallery Photo'}
                width={500}
                height={500}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                placeholder={getBlurUrl(photo.imageUrl) ? 'blur' : 'empty'}
                blurDataURL={getBlurUrl(photo.imageUrl)}
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

export async function getStaticProps(context) {
  try {
    const [blogsRes, projectsRes, galleryRes, settingsRes, reposRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs`),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery`),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/github/repos`)
    ]);

    let recentBlogs = [];
    if (blogsRes.ok) {
      const blogs = await blogsRes.json();
      if (Array.isArray(blogs)) {
        recentBlogs = blogs.filter(b => b.status === 'PUBLISHED').slice(0, 3);
      }
    }

    let featuredProjects = [];
    if (projectsRes.ok) {
      const projects = await projectsRes.json();
      if (Array.isArray(projects)) {
        // Parse techStack if it's a string
        const parsedProjects = projects.map(p => {
          let techStack = p.techStack;
          if (typeof techStack === 'string') {
            try {
              techStack = JSON.parse(techStack);
            } catch (e) {
              techStack = [];
            }
          }
          return { ...p, techStack };
        });
        featuredProjects = parsedProjects.slice(0, 5);
      }
    }

    let galleryPhotos = [];
    if (galleryRes.ok) {
      const result = await galleryRes.json();
      const photos = result.data || (Array.isArray(result) ? result : []);
      if (Array.isArray(photos)) {
        galleryPhotos = photos.slice(0, 12);
      }
    }

    let settings = {};
    if (settingsRes.ok) {
      const settingsData = await settingsRes.json();
      settings = settingsData.reduce((acc, curr) => {
        acc[curr.settingTitle] = curr.content;
        return acc;
      }, {});
    }

    let featuredRepos = [];
    if (reposRes.ok) {
      const data = await reposRes.json();
      if (Array.isArray(data)) {
        featuredRepos = data
          .sort((a, b) => b.stargazers_count - a.stargazers_count)
          .slice(0, 9);
      }
    }

    return {
      props: {
        recentBlogs,
        featuredProjects,
        galleryPhotos,
        settings,
        featuredRepos
      },
      revalidate: 120
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return {
      props: {
        recentBlogs: [],
        featuredProjects: [],
        galleryPhotos: [],
        settings: {},
        featuredRepos: []
      },
      revalidate: 120
    };
  }
}

Home.getLayout = function getLayout(page) {
  return (
    <Layout
      title="Khoa Nguyễn - Software Engineer"
      description="I’m Khoa Nguyen (yun.khngn) - a talented software engineering student, self-taught creator, graphic designer, and guitarist/musician, driven by ambition, curiosity, and the desire to turn ideas into something real. Welcome to my personal nerd world !!!"
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

function TikTok({ size = 24, className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}
