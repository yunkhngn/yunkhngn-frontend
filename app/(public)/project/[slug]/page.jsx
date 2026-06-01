import { notFound } from 'next/navigation';
import { fetchProjectDetailData } from '@/lib/fetchProjectDetailData';
import ProjectDetailClient from './ProjectDetailClient';
import JsonLd from '@/lib/seo/JsonLd';
import { projectJsonLd, breadcrumbJsonLd } from '@/lib/seo/jsonLd';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = await fetchProjectDetailData(slug);
  if (!project) {
    return { title: 'Not found' };
  }
  const desc = project.seoDescription || project.description || '';
  const title = project.seoTitle || project.title;
  const ogParams = new URLSearchParams({
    title,
    type: 'project',
    description: desc,
    ...(project.cover ? { thumbnail: project.cover } : {}),
  });
  const ogImage = `https://yunkhngn.dev/api/og?${ogParams.toString()}`;

  return {
    title,
    description: desc,
    alternates: { canonical: `https://yunkhngn.dev/project/${slug}` },
    openGraph: {
      title,
      description: desc,
      url: `https://yunkhngn.dev/project/${slug}`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [ogImage],
    },
  };
}

export default async function ProjectDetailPage({ params }) {
  const { slug } = await params;
  const projectData = await fetchProjectDetailData(slug);
  if (!projectData) notFound();

  const jsonLd = [
    projectJsonLd({
      title: projectData.title,
      description: projectData.seoDescription || projectData.description || '',
      slug,
      image: projectData.cover,
    }),
    breadcrumbJsonLd([
      { name: 'Home', url: 'https://yunkhngn.dev' },
      { name: 'Projects', url: 'https://yunkhngn.dev/project' },
      { name: projectData.title, url: `https://yunkhngn.dev/project/${slug}` },
    ]),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <ProjectDetailClient projectData={projectData} />
    </>
  );
}
