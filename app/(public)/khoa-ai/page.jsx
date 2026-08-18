import KhoaAIClient from './KhoaAIClient';
import { createMetadata } from '@/lib/seo/createMetadata';

export const metadata = createMetadata({
  title: 'Chat with Khoa AI | yun.khngn',
  description: "Chat with Khoa Nguyễn's AI persona — powered by Gemini, trained on personal knowledge.",
  path: '/khoa-ai',
  ogType: 'page',
});

export default function KhoaAIPage() {
  return <KhoaAIClient />;
}
