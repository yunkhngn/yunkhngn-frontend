import PhotoClient from './PhotoClient';
import { createMetadata } from '@/lib/seo/createMetadata';

export const metadata = createMetadata({
  title: 'Photo',
  description: 'A collection of photography and visual moments captured by Khoa Nguyễn.',
  path: '/photo',
  ogType: 'page',
});

export default function PhotoPage() {
  return <PhotoClient />;
}
