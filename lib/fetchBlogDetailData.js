import { apiFetch } from '@/lib/api/server';
import { extractTextFromTipTap, stripHtml } from '@/lib/utils';

export async function fetchBlogDetailData(slug) {
  const { data: foundBlog, error } = await apiFetch(`/blogs/${slug}`, {
    next: { revalidate: 60 },
  });
  if (error || !foundBlog) return null;

  let cleanContent = '';
  if (foundBlog.contentJSON) {
    cleanContent = extractTextFromTipTap(foundBlog.contentJSON);
  } else if (foundBlog.content) {
    cleanContent = stripHtml(foundBlog.content);
  }

  let description = foundBlog.description;
  let excerpt = foundBlog.description;

  if (!description && cleanContent) {
    excerpt = cleanContent.length > 300 ? `${cleanContent.substring(0, 297)}...` : cleanContent;
    description = cleanContent.length > 160 ? `${cleanContent.substring(0, 157)}...` : cleanContent;
  }

  const wordCount = cleanContent.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return {
    ...foundBlog,
    description: excerpt || `Read ${foundBlog.title} on Yunkhngn`,
    seoDescription: foundBlog.seoDescription || description,
    readingTime,
  };
}
