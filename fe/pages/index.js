import Layout from '@/components/shared/Layout';
import { BlogCard } from '@/components/shared/BlogCard';
import { ProjectCard } from '@/components/shared/ProjectCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import api from '@/lib/api/client';

export default function Home({ blogs, projects }) {
  return (
    <Layout>
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Hello, I'm yunkhngn.
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            I'm a Full Stack Developer building beautiful web experiences.
            Welcome to my digital garden where I share my thoughts and projects.
          </p>
          <div className="space-x-4">
            <Link href="/blog">
              <Button size="lg">Read Blog</Button>
            </Link>
            <Link href="/projects">
              <Button variant="outline" size="lg">View Projects</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container space-y-6 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl font-bold">
            Latest Posts
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Thoughts on development, design, and technology.
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
        <div className="flex justify-center">
          <Link href="/blog">
            <Button variant="ghost">View all posts →</Button>
          </Link>
        </div>
      </section>

      <section className="container space-y-6 py-8 md:py-12 lg:py-24 bg-muted/50 rounded-3xl">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl font-bold">
            Featured Projects
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Some of the things I've built.
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem]">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        <div className="flex justify-center">
          <Link href="/projects">
            <Button variant="ghost">View all projects →</Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    // Fetch latest blogs and projects
    // Note: In a real app, we might want to create specific endpoints for "featured" or "latest"
    // For now, we'll fetch all and slice.
    const [blogsRes, projectsRes] = await Promise.all([
      api.get('/blogs'),
      api.get('/projects')
    ]);

    const blogs = blogsRes.data.slice(0, 3); // Top 3
    const projects = projectsRes.data.slice(0, 2); // Top 2

    return {
      props: {
        blogs,
        projects,
      },
    };
  } catch (error) {
    console.error('Error fetching home data:', error);
    return {
      props: {
        blogs: [],
        projects: [],
      },
    };
  }
}
