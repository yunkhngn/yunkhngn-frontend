import KhoaAIClient from './KhoaAIClient';

export const metadata = {
  title: 'Chat with Khoa AI | yun.khngn',
  description: 'Chat with Khoa Nguyễn's AI persona — powered by Gemini, trained on personal knowledge.',
  alternates: { canonical: 'https://yunkhngn.dev/khoa-ai' },
  openGraph: {
    title: 'Chat with Khoa AI | yun.khngn — Khoa Nguyễn',
    description: 'Chat with Khoa Nguyễn's AI persona — powered by Gemini, trained on personal knowledge.',
    url: 'https://yunkhngn.dev/khoa-ai',
  },
};

export default function KhoaAIPage() {
    return <KhoaAIClient />;
}
