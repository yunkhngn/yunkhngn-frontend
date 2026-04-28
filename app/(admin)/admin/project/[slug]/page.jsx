import { notFound } from 'next/navigation';
import { fetchProjectDetailData } from '@/lib/fetchProjectDetailData';
import AdminProjectDetailClient from './AdminProjectDetailClient';

export default async function AdminProjectDetailPage({ params }) {
  const { slug } = await params;
  const projectData = await fetchProjectDetailData(slug);
  if (!projectData) notFound();
  return <AdminProjectDetailClient projectData={projectData} />;
}
