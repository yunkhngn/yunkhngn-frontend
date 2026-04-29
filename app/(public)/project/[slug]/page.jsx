import { notFound } from 'next/navigation';
import { fetchProjectDetailData } from '@/lib/fetchProjectDetailData';
import ProjectDetailClient from './ProjectDetailClient';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = await fetchProjectDetailData(slug);
  if (!project) {
    return { title: 'Not found' };
  }
  const desc = project.seoDescription || project.description || '';
  return {
    title: project.seoTitle || project.title,
    description: desc,
    openGraph: {
      title: project.seoTitle || project.title,
      description: desc,
      images: project.cover ? [project.cover] : undefined,
    },
  };
}

export default async function ProjectDetailPage({ params }) {
  const { slug } = await params;
  const projectData = await fetchProjectDetailData(slug);
  if (!projectData) notFound();
  return <ProjectDetailClient projectData={projectData} />;
}
