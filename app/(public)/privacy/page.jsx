import PrivacyClient from './PrivacyClient';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for yunkhngn.dev — how your data is handled.',
  alternates: { canonical: 'https://yunkhngn.dev/privacy' },
  openGraph: {
    title: 'Privacy Policy — Khoa Nguyễn',
    description: 'Privacy policy for yunkhngn.dev — how your data is handled.',
    url: 'https://yunkhngn.dev/privacy',
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
