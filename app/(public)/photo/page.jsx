import PhotoClient from './PhotoClient';

export const metadata = {
  title: 'Photo',
  description: 'A collection of photography and visual moments captured by Khoa Nguyễn.',
  alternates: { canonical: 'https://yunkhngn.dev/photo' },
  openGraph: {
    title: 'Photo — Khoa Nguyễn',
    description: 'A collection of photography and visual moments captured by Khoa Nguyễn.',
    url: 'https://yunkhngn.dev/photo',
  },
};

export default function PhotoPage() {
  return <PhotoClient />;
}
