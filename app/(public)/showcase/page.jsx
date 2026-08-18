import ShowcaseClient from './ShowcaseClient';
import { createMetadata } from '@/lib/seo/createMetadata';

export const metadata = createMetadata({
  title: 'Under the Hood | Showcase',
  description:
    'Technical showcase and architecture breakdown of yunkhngn.dev — built with Next.js 15, NestJS, and Gemini AI.',
  path: '/showcase',
  ogType: 'page',
  ogTitle: 'Under the Hood — Technical Showcase',
});

export default function ShowcasePage() {
  return <ShowcaseClient />;
}
