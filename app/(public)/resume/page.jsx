import ResumeClient from './ResumeClient';
import { createMetadata } from '@/lib/seo/createMetadata';

export const metadata = createMetadata({
  title: 'Resume',
  description: 'Software Engineer résumé — skills, experience, and education of Khoa Nguyễn.',
  path: '/resume',
  ogType: 'page',
});

export default function ResumePage() {
  return <ResumeClient />;
}
