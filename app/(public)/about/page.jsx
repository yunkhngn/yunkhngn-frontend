import AboutClient from './AboutClient';
import { createMetadata } from '@/lib/seo/createMetadata';

export const metadata = createMetadata({
  title: 'About me',
  description:
    'The story behind yun.khngn — a software engineer, graphic designer, and guitarist from Vietnam building meaningful digital experiences.',
  path: '/about',
  ogType: 'page',
  type: 'profile',
});

export default function AboutPage() {
  return <AboutClient />;
}
