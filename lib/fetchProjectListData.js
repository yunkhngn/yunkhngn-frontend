import { apiFetch } from '@/lib/api/server';

function parseProjects(data) {
  if (!Array.isArray(data)) return [];
  return data.map((p) => {
    let techStack = p.techStack;
    if (typeof techStack === 'string') {
      try {
        techStack = JSON.parse(techStack || '[]');
      } catch {
        techStack = [];
      }
    }
    return { ...p, techStack, type: 'project' };
  });
}

function parseRepos(data) {
  if (!Array.isArray(data)) return [];
  return data.map((r) => ({
    id: `repo-${r.id}`,
    title: r.name,
    description: r.description || 'No description available.',
    cover: null,
    tags: r.language ? `Open Source, ${r.language}` : 'Open Source',
    techStack: [r.language].filter(Boolean),
    repoLink: r.html_url,
    demoLink: r.homepage,
    createdAt: r.created_at,
    type: 'repo',
    stars: r.stargazers_count,
    forks: r.forks_count,
  }));
}

export async function fetchProjectListData() {
  const [projectsRes, reposRes] = await Promise.all([
    apiFetch('/projects'),
    apiFetch('/admin/github/repos'),
  ]);

  if (projectsRes.error) {
    throw new Error(`Failed to fetch project list: ${projectsRes.error}`);
  }
  if (reposRes.error) {
    throw new Error(`Failed to fetch GitHub repos: ${reposRes.error}`);
  }

  return {
    projects: parseProjects(projectsRes.data),
    repos: parseRepos(reposRes.data),
  };
}
