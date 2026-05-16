import { apiFetch } from '@/lib/api/server';

function parseTechStack(p) {
  let techStack = p.techStack;
  if (typeof techStack === 'string') {
    try {
      techStack = JSON.parse(techStack);
    } catch {
      techStack = [];
    }
  }
  return { ...p, techStack };
}

export async function fetchHomePageData() {
  const opts = { next: { revalidate: 120 } };
  /** Shorter cache so GitHub settings (username/token) show up without waiting full homepage TTL */
  const githubOpts = { next: { revalidate: 30 } };
  const [blogsResult, projectsResult, galleryResult, settingsResult, reposResult] =
    await Promise.all([
      apiFetch('/blogs?limit=6&status=PUBLISHED', opts),
      apiFetch('/projects?limit=11', opts),
      apiFetch('/gallery', opts),
      apiFetch('/settings', opts),
      apiFetch('/admin/github/repos', githubOpts),
    ]);

  let recentBlogs = [];
  const blogs = blogsResult.data;
  if (Array.isArray(blogs)) {
    recentBlogs = blogs.filter((b) => b.status === 'PUBLISHED').slice(0, 6);
  }

  let featuredProjects = [];
  if (Array.isArray(projectsResult.data)) {
    featuredProjects = projectsResult.data.map(parseTechStack).slice(0, 11);
  }

  let galleryPhotos = [];
  const galleryRaw = galleryResult.data;
  const photos =
    galleryRaw && typeof galleryRaw === 'object' && !Array.isArray(galleryRaw) && 'data' in galleryRaw
      ? galleryRaw.data
      : Array.isArray(galleryRaw)
        ? galleryRaw
        : [];
  if (Array.isArray(photos)) {
    galleryPhotos = photos.slice(0, 12);
  }

  let settings = {};
  if (Array.isArray(settingsResult.data)) {
    settings = settingsResult.data.reduce((acc, curr) => {
      acc[curr.settingTitle] = curr.content;
      return acc;
    }, {});
  }

  let featuredRepos = [];
  if (Array.isArray(reposResult.data)) {
    featuredRepos = reposResult.data
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 9);
  }

  return {
    recentBlogs,
    featuredProjects,
    galleryPhotos,
    settings,
    featuredRepos,
  };
}
