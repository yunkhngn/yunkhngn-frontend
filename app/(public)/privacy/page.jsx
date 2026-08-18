import PrivacyClient from './PrivacyClient';
import { createMetadata } from '@/lib/seo/createMetadata';

export const metadata = createMetadata({
  title: 'Privacy Policy',
  description: 'Privacy policy for yunkhngn.dev — how your data is handled.',
  path: '/privacy',
  ogType: 'page',
});

export default function PrivacyPage() {
  return <PrivacyClient />;
}
