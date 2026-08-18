import ProjectListClient from './ProjectListClient';
import { fetchProjectListData } from '@/lib/fetchProjectListData';
import { createMetadata } from '@/lib/seo/createMetadata';

export const revalidate = 120;

export const metadata = createMetadata({
  title: 'Projects',
  description:
    'A curated collection of software projects, from full-stack web apps to creative tools — by Khoa Nguyễn.',
  path: '/project',
  ogType: 'project',
});

export default async function ProjectListPage() {
  const { projects, repos } = await fetchProjectListData();
  return <ProjectListClient projects={projects} repos={repos} />;
}
