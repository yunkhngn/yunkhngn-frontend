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
  const [galleryPhotos, setGalleryPhotos] = useState([]);
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
        const [blogsRes, projectsRes, galleryRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery`)
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
          setGalleryPhotos(photos.slice(0, 6));
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


      <main className="flex-1 container mx-auto px-4 py-12 md:py-24 max-w-7xl space-y-32 relative z-10">
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

          <blockquote className="border-l-4 border-primary pl-6 py-2 italic text-xl text-foreground font-serif">
            "Tương lai thuộc về những người tin vào vẻ đẹp trong chính những giấc mơ, hoài bão to lớn của mình..."
          </blockquote>

          <div className="space-y-6">
            <p>
              Giới thiệu nhiều hơn một chút về bản thân, tớ sống và làm việc tại Hà Nội.
              Tớ thích tìm hiểu về những thứ mới mẻ, thử thách bản thân và không ngừng học hỏi nhiều điều hơn.
              Tớ có kĩ năng khá tốt với nghệ thuật và cả kĩ thuật/công nghệ, không phải là năng khiếu thiên bẩm,
              nhưng tớ cảm nhận được tớ đã tự đạt được bằng những nỗ lực của bản thân.
            </p>
            <p>
              Tớ đã chơi đàn được hơn 5 năm rồi, và cũng từng được đi diễn tại một số show.
              Ngoài ra, tớ cũng siêu thích quay phim và chụp ảnh, kiểu như, tớ đang muốn truyền tải với thế giới này những gì tớ thấy qua góc kính máy ảnh nhiệm màu.
            </p>
            <p>
              Tuy rằng hơi bận rộn với việc học và làm, nhưng tớ vẫn luôn có một khoảng dành cho những sở thích của riêng mình,
              tập đàn 2 tiếng mỗi ngày, hay là ngồi code cả tối. Hihi, chắc là hết rồi, tạm gác ở đây nha!
            </p>
          </div>

          <div className="pt-8 space-y-2">
            <p className="italic">Vài dòng thư tay viết vội.</p>
            <p className="font-serif text-xl text-foreground font-bold pt-4">Khoa Nguyễn</p>
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
                href={`/project/${project.id}`}
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

        {/* Gallery - Masonry */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold font-serif">Captured Moments</h2>
            <Link href="/photo" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
              View gallery <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {galleryPhotos.map((photo) => (
              <div key={photo.id} className="break-inside-avoid relative group rounded-xl overflow-hidden">
                <Image
                  src={photo.imageUrl}
                  alt={photo.caption || 'Gallery Photo'}
                  width={500}
                  height={500}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
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
