import ProjectListClient from './ProjectListClient';

export const metadata = {
  title: 'Projects',
  description: 'A curated collection of software projects, from full-stack web apps to creative tools — by Khoa Nguyễn.',
  alternates: { canonical: 'https://yunkhngn.dev/project' },
  openGraph: {
    title: 'Projects — Khoa Nguyễn',
    description: 'A curated collection of software projects, from full-stack web apps to creative tools — by Khoa Nguyễn.',
    url: 'https://yunkhngn.dev/project',
  },
};

export default function ProjectListPage() {
  return <ProjectListClient />;
}
