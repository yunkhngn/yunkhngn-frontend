import ShowcaseClient from './ShowcaseClient';

export const metadata = {
  title: 'Showcase',
  description: 'Creative showcase — graphic design, video edits, and visual experiments by Khoa Nguyễn.',
  alternates: { canonical: 'https://yunkhngn.dev/showcase' },
  openGraph: {
    title: 'Showcase — Khoa Nguyễn',
    description: 'Creative showcase — graphic design, video edits, and visual experiments by Khoa Nguyễn.',
    url: 'https://yunkhngn.dev/showcase',
  },
};

export default function ShowcasePage() {
  return <ShowcaseClient />;
}
