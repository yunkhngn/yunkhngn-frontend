import ContactClient from './ContactClient';
import { createMetadata } from '@/lib/seo/createMetadata';

export const metadata = createMetadata({
  title: 'Contact',
  description: 'Reach out to Khoa Nguyễn for collaboration, freelance work, or just to say hello.',
  path: '/contact',
  ogType: 'page',
});

export default function ContactPage() {
  return <ContactClient />;
}
