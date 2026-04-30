import ShowcaseClient from './ShowcaseClient';

export const metadata = {
  title: 'Under the Hood | Showcase',
  description: 'Technical showcase and architecture breakdown of yunkhngn.dev — built with Next.js 15, NestJS, and Gemini AI.',
  alternates: { canonical: 'https://yunkhngn.dev/showcase' },
  openGraph: {
    title: 'Under the Hood — Technical Showcase',
    description: 'A deep dive into the architecture and tech stack powering this high-performance portfolio.',
    url: 'https://yunkhngn.dev/showcase',
  },
};

export default function ShowcasePage() {
  return <ShowcaseClient />;
}
