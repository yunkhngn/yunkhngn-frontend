import AboutClient from './AboutClient';

export const metadata = {
  title: 'About me',
  description: 'The story behind yun.khngn — a software engineer, graphic designer, and guitarist from Vietnam building meaningful digital experiences.',
  alternates: { canonical: 'https://yunkhngn.dev/about' },
  openGraph: {
    title: 'About me — Khoa Nguyễn',
    description: 'The story behind yun.khngn — a software engineer, graphic designer, and guitarist from Vietnam.',
    url: 'https://yunkhngn.dev/about',
    type: 'profile',
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
