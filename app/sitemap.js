import { apiFetch } from '@/lib/api/server';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://yunkhngn.dev';

export default async function sitemap() {
  const staticPages = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/project`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/gallery`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/journal`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/photo`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/showcase`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/resume`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  let dynamicPages = [];

  try {
    const [blogsResult, projectsResult] = await Promise.all([
      apiFetch('/blogs', { next: { revalidate: 3600 } }),
      apiFetch('/projects', { next: { revalidate: 3600 } }),
    ]);

    const blogs = Array.isArray(blogsResult?.data) ? blogsResult.data : [];
    dynamicPages.push(
      ...blogs
        .filter((b) => b.status === 'PUBLISHED')
        .map((blog) => ({
          url: `${BASE_URL}/blog/${blog.slug}`,
          lastModified: new Date(blog.updatedAt || blog.createdAt),
          changeFrequency: 'weekly',
          priority: 0.8,
        })),
    );

    const projects = Array.isArray(projectsResult?.data) ? projectsResult.data : [];
    dynamicPages.push(
      ...projects.map((project) => ({
        url: `${BASE_URL}/project/${project.slug}`,
        lastModified: new Date(project.updatedAt || project.createdAt),
        changeFrequency: 'monthly',
        priority: 0.8,
      })),
    );
  } catch (error) {
    console.error('Failed to fetch dynamic sitemap data:', error);
  }

  return [...staticPages, ...dynamicPages];
}
