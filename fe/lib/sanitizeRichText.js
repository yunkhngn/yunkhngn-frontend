export function sanitizeRichTextToPlainText(value) {
  if (typeof value !== 'string') return '';

  if (typeof DOMParser !== 'undefined') {
    const parsed = new DOMParser().parseFromString(value, 'text/html');
    parsed.querySelectorAll('script,style').forEach((node) => node.remove());
    return (parsed.body.textContent || '').replace(/\s+/g, ' ').trim();
  }

  const withoutTags = value.replace(/<[^>]*>/g, ' ');
  return withoutTags.replace(/\s+/g, ' ').trim();
}
