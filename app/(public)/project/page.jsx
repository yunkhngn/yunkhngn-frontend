import ProjectListClient from './ProjectListClient';
import { fetchProjectListData } from '@/lib/fetchProjectListData';

export const revalidate = 120;

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

export default async function ProjectListPage() {
  const { projects, repos } = await fetchProjectListData();
  return <ProjectListClient projects={projects} repos={repos} />;
}
