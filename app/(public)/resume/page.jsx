import ResumeClient from './ResumeClient';

export const metadata = {
  title: 'Resume',
  description: 'Software Engineer résumé — skills, experience, and education of Khoa Nguyễn.',
  alternates: { canonical: 'https://yunkhngn.dev/resume' },
  openGraph: {
    title: 'Resume — Khoa Nguyễn',
    description: 'Software Engineer résumé — skills, experience, and education of Khoa Nguyễn.',
    url: 'https://yunkhngn.dev/resume',
  },
};

export default function ResumePage() {
  return <ResumeClient />;
}
