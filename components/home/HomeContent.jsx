'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import HeroBackground from '@/components/home/HeroBackground';
import RevealHeading from '@/components/home/RevealHeading';
import TiltCard from '@/components/home/TiltCard';
import { Button } from '@/components/ui/Button';
import {
  Github,
  Facebook,
  Linkedin,
  Star,
  GitFork,
  Instagram,
  ArrowRight,
  LayoutGrid,
  Coffee,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { extractTextFromTipTap } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import JsonLd from '@/components/seo/JsonLd';
import Terminal from '@/components/home/Terminal';
import { getOptimizedUrl, getBlurUrl } from '@/lib/cloudinary';
import { readCachedSettings, writeCachedSettings } from '@/lib/settingsCache';
import StatusBadge from '@/components/live/StatusBadge';
import { sanitizeRichTextToPlainText } from '@/lib/sanitizeRichText';
import LiveActivityInline from '@/components/live/LiveActivityInline';
import TextDecode from '@/components/home/TextDecode';

function HomeMasonryGallery({ photos }) {
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 768) setColumns(3);
      else setColumns(2);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const cols = Array.from({ length: columns }, () => []);
  photos.forEach((photo, i) => cols[i % columns].push(photo));

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {cols.map((colPhotos, ci) => (
        <div key={ci} className="space-y-4">
          {colPhotos.map((photo) => (
            <Link
              key={photo.id}
              href="/photo"
              className="relative block group rounded-xl overflow-hidden bg-muted"
            >
              <Image
                src={getOptimizedUrl(photo.imageUrl, { width: 600, quality: 80 })}
                alt={photo.caption || 'Gallery Photo'}
                width={photo.width || 800}
                height={photo.height || 600}
                sizes="(max-width: 768px) 50vw, 33vw"
                className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                placeholder={getBlurUrl(photo.imageUrl) ? 'blur' : 'empty'}
                blurDataURL={getBlurUrl(photo.imageUrl)}
              />
              {photo.caption && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <p className="text-white p-4 text-sm font-medium line-clamp-2">{photo.caption}</p>
                </div>
              )}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function HomeContent({
  recentBlogs = [],
  featuredRepos = [],
  featuredProjects = [],
  galleryPhotos = [],
  settings: initialSettings = {},
}) {
  const cachedSettings = useMemo(() => readCachedSettings() || {}, []);
  const settings =
    initialSettings && Object.keys(initialSettings).length > 0
      ? initialSettings
      : cachedSettings || {};

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
        'query-input': 'required name=search_term_string',
      },
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
        settings.linkedin || 'https://linkedin.com/in/yunkhngn',
      ],
      jobTitle: 'Software Engineer',
      worksFor: {
        '@type': 'Organization',
        name: 'FPT University',
      },
    },
  ];

  const heroContainerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2 } },
  };

  const heroItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  const cardContainerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const cardItemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className="container mx-auto px-4 pb-12 md:pb-24 pt-0 max-w-7xl space-y-32 overflow-x-hidden">
      <HeroBackground />
      <JsonLd data={jsonLdData} />
      <section className="relative flex flex-col items-center text-center justify-start pt-16 md:pt-24 space-y-8 min-h-[80vh] max-w-4xl mx-auto">
        <motion.div
          variants={heroContainerVariants}
          initial="hidden"
          animate="visible"
          className="w-full flex flex-col items-center space-y-8"
        >
          <motion.div variants={heroItemVariants}>
            <h1 className="text-7xl md:text-9xl font-bold tracking-tighter font-serif bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent py-4 leading-tight">
              Khoa Nguyễn
            </h1>
          </motion.div>
          <motion.div variants={heroItemVariants} className="flex flex-wrap items-center justify-center gap-3">
            {['Software Engineer', 'Graphic Designer', 'Guitarist'].map((role, idx) => (
              <span
                key={role}
                className="rounded-full border border-border/50 px-4 py-1.5 text-sm font-mono text-muted-foreground"
              >
                <TextDecode text={role} delay={500 + idx * 200} />
              </span>
            ))}
          </motion.div>

          <motion.div variants={heroItemVariants} className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {settings.homepage_description ? (
              <p className="whitespace-pre-wrap">
                {sanitizeRichTextToPlainText(settings.homepage_description)}
              </p>
            ) : (
              <p>
                Hi, I&apos;m <strong className="text-foreground font-medium">Khoa</strong>. I build things for
                the web and sometimes I break them too. Welcome to my personal terminal.
              </p>
            )}
          </motion.div>

          <motion.div variants={heroItemVariants} className="flex flex-wrap items-center justify-center gap-6 pt-4 relative z-10">
            <Link href="/resume">
              <Button className="rounded-full px-8 h-12 text-base">Resume</Button>
            </Link>
            <div className="flex gap-6">
              {settings.facebook || settings.instagram || settings.tiktok || settings.github || settings.linkedin ? (
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
          </motion.div>
        </motion.div>
      </section>

      <section className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full rounded-xl overflow-hidden border border-border/50 bg-black/95 shadow-2xl relative"
        >
          <div className="bg-muted/10 px-4 py-3 flex items-center justify-between border-b border-white/10 backdrop-blur-md">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors" />
              <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors" />
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono flex items-center gap-2 opacity-70">
              <span className="hidden md:inline">yunkhngn@macbook-pro: ~</span>
            </div>
            <div className="opacity-0 w-12" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col items-center lg:items-start text-center lg:text-left justify-center bg-gradient-to-b from-white/5 to-transparent">
              <div className="relative mb-8">
                <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl">
                  <Image
                    src={settings.avatar || 'https://github.com/yunkhngn.png'}
                    alt="Khoa Nguyễn"
                    fill
                    sizes="(max-width: 768px) 8rem, 12rem"
                    className="object-cover"
                  />
                </div>
                <StatusBadge />
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
                  <LiveActivityInline />
                </div>
              </div>

              <div className="mt-8 text-base leading-relaxed text-gray-400 font-light max-w-md">
                {settings.homepage_description ? (
                  <p className="whitespace-pre-wrap">
                    {sanitizeRichTextToPlainText(settings.homepage_description)}
                  </p>
                ) : (
                  <p>
                    Hi, I&apos;m <strong className="text-gray-200 font-medium">Khoa</strong>. I build things for
                    the web and sometimes I break them too. Welcome to my personal terminal.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-black/50 min-h-[400px] lg:min-h-[500px] relative">
              <Terminal embedded className="h-full border-none shadow-none bg-transparent !my-0 !rounded-none" />
            </div>
          </div>
        </motion.div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <section className="space-y-8">
        <div className="flex items-end justify-between">
          <RevealHeading index={1}>
            <h2 className="text-4xl md:text-5xl font-bold font-serif">Recent Blogs</h2>
          </RevealHeading>
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors mb-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <motion.div
          className="grid gap-8 md:grid-cols-3"
          variants={cardContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {recentBlogs.map((blog) => {
            const plainText = extractTextFromTipTap(blog.contentJSON);
            const readTime = calculateReadTime(blog.contentJSON);
            const firstTag = blog.tags ? blog.tags.split(',')[0].trim() : 'Blog';

            return (
              <motion.div key={blog.id} variants={cardItemVariants}>
                <TiltCard className="h-full">
                  <Link href={`/blog/${blog.slug || blog.id}`} className="group flex flex-col space-y-4 block h-full">
                    <div className="aspect-[4/3] relative rounded-2xl overflow-hidden bg-muted">
                      {blog.thumbnail && (
                        <Image
                          src={blog.thumbnail}
                          alt={blog.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute top-4 left-4">
                        <Badge
                          variant="secondary"
                          className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-md border-none rounded-full px-3 py-1 text-xs font-medium"
                        >
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

                      <h3 className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {blog.title}
                      </h3>

                      <p className="text-muted-foreground text-base leading-relaxed line-clamp-3 flex-1">{plainText}</p>
                    </div>
                  </Link>
                </TiltCard>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <section className="space-y-8">
        <div className="flex items-end justify-between">
          <RevealHeading index={2}>
            <h2 className="text-4xl md:text-5xl font-bold font-serif">Featured Projects</h2>
          </RevealHeading>
          <Link href="/project" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors mb-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]"
          variants={cardContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {featuredProjects.slice(0, 5).map((project, i) => (
            <motion.div
              key={project.id}
              className={i === 0 ? 'md:col-span-2 md:row-span-2' : 'md:col-span-1 md:row-span-1'}
              variants={cardItemVariants}
            >
              <Link
                href={`/project/${project.slug}`}
                className="group relative rounded-2xl overflow-hidden bg-muted block w-full h-full"
              >
                {project.cover && (
                  <Image
                    src={project.cover}
                    alt={project.title}
                    fill
                    sizes={i === 0 ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 25vw'}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full">
                  <h3
                    className={`font-bold text-white mb-1 md:mb-2 ${i === 0 ? 'text-xl md:text-2xl lg:text-3xl' : 'text-base md:text-lg'}`}
                  >
                    {project.title}
                  </h3>
                  {i === 0 && (
                    <p className="text-gray-200 text-sm md:text-base line-clamp-2 mb-2 md:mb-3 max-w-md">
                      {project.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(project.techStack) &&
                      project.techStack.slice(0, 2).map((tech, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm text-[10px] px-2 h-5"
                        >
                          {tech}
                        </Badge>
                      ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {featuredProjects.length > 5 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-[250px]"
            variants={cardContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {featuredProjects.slice(5, 11).map((project) => (
              <motion.div key={project.id} variants={cardItemVariants}>
                <Link
                  href={`/project/${project.slug}`}
                  className="group relative rounded-2xl overflow-hidden bg-muted block w-full h-full"
                >
                  {project.cover && (
                    <Image
                      src={project.cover}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full">
                    <h3 className="font-bold text-white text-xl md:text-2xl mb-1 md:mb-2">
                      {project.title}
                    </h3>
                    <p className="text-gray-200 text-sm md:text-base line-clamp-1 mb-2 md:mb-3 max-w-md">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(project.techStack) &&
                        project.techStack.slice(0, 3).map((tech, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm text-[10px] px-2 h-5"
                          >
                            {tech}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <section className="container mx-auto px-4 py-20">
        <div className="mb-12">
          <RevealHeading index={3}>
            <h2 className="text-4xl md:text-5xl font-bold flex items-center gap-3">
              <Github className="h-8 w-8" />
              Open Source
            </h2>
          </RevealHeading>
        </div>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={cardContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {featuredRepos.map((repo) => (
            <motion.div key={repo.id} variants={cardItemVariants} className="h-full">
              <TiltCard className="h-full">
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="group block h-full">
                  <Card className="h-full hover:border-primary/50 hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all duration-500">
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
              </TiltCard>
            </motion.div>
          ))}
          {featuredRepos.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-8">No featured repositories found.</div>
          )}
        </motion.div>
        <div className="text-center mt-10">
          <Link href="https://github.com/yunkhngn?tab=repositories" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg" className="gap-2">
              View All Repositories <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <section className="space-y-8">
        <div className="flex items-end justify-between">
          <RevealHeading index={4}>
            <h2 className="text-4xl md:text-5xl font-bold font-serif">Locket Gallery</h2>
          </RevealHeading>
          <Link href="/photo" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors mb-1">
            View gallery <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <HomeMasonryGallery photos={galleryPhotos} />
      </section>

      <section className="w-full">
        <a
          href="https://www.buymeacoffee.com/yunkhngn"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full"
        >
          <div className="transition-all duration-300 w-full rounded-2xl border border-[#ffdd00]/40 bg-gradient-to-r from-[#ffdd00]/15 via-[#ffdd00]/10 to-[#ffdd00]/15 hover:from-[#ffdd00]/25 hover:via-[#ffdd00]/15 hover:to-[#ffdd00]/25 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[#ffdd00] text-black flex items-center justify-center">
                <Coffee className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-base text-foreground">Ủng hộ nuôi website</p>
                <p className="text-sm text-muted-foreground">
                  Nếu thấy nội dung hữu ích, mời mình một ly cà phê để tiếp thêm động lực duy trì website nha.
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#ffdd00] hover:bg-[#facc15] text-black text-sm font-medium px-5 py-2.5 transition-colors">
                Buy me a coffee
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </a>
      </section>
    </div>
  );
}

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
