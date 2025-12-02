import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ").trim();
}

export function extractTextFromTipTap(contentJSON) {
    try {
        if (!contentJSON) return '';
        const json = typeof contentJSON === 'string' ? JSON.parse(contentJSON) : contentJSON;
        
        let text = '';
        const traverse = (node) => {
            if (node.type === 'text') {
                text += node.text + ' ';
            }
            if (node.content) {
                node.content.forEach(traverse);
            }
        };
        
        traverse(json);
        return text.trim();
    } catch (e) {
        return '';
    }
}
