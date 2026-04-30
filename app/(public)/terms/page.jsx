import TermsClient from './TermsClient';

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for yunkhngn.dev.',
  alternates: { canonical: 'https://yunkhngn.dev/terms' },
  openGraph: {
    title: 'Terms of Service — Khoa Nguyễn',
    description: 'Terms of service for yunkhngn.dev.',
    url: 'https://yunkhngn.dev/terms',
  },
};

export default function TermsPage() {
  return <TermsClient />;
}
