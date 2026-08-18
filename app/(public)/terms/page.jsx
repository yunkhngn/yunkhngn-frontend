import TermsClient from './TermsClient';
import { createMetadata } from '@/lib/seo/createMetadata';

export const metadata = createMetadata({
  title: 'Terms of Service',
  description: 'Terms of service for yunkhngn.dev.',
  path: '/terms',
  ogType: 'page',
});

export default function TermsPage() {
  return <TermsClient />;
}
