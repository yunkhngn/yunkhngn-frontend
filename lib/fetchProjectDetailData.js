import { apiFetch } from '@/lib/api/server';
import { extractTextFromTipTap, stripHtml } from '@/lib/utils';

export async function fetchProjectDetailData(id) {
  const { data, error } = await apiFetch(`/projects/${id}`, {
    next: { revalidate: 60 },
  });
  if (error || !data) return null;

  const parsedProject = {
    ...data,
    techStack:
      typeof data.techStack === 'string' ? JSON.parse(data.techStack || '[]') : data.techStack,
  };

  let description = parsedProject.description;
  if (!description) {
    if (parsedProject.contentJSON) {
      description = extractTextFromTipTap(parsedProject.contentJSON);
    } else if (parsedProject.content) {
      description = stripHtml(parsedProject.content);
    }
    if (description && description.length > 160) {
      description = `${description.substring(0, 157)}...`;
    }
  }
  parsedProject.description = description || `View ${parsedProject.title} on Yunkhngn`;

  return parsedProject;
}
