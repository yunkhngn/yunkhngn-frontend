import { notFound } from 'next/navigation';
import { resolveShortlinkPageProps } from '@/lib/resolveShortlinkPageProps';
import ShortlinkClient from './ShortlinkClient';

export async function generateMetadata({ params }) {
  const { code } = await params;
  const props = await resolveShortlinkPageProps(code);
  if (!props?.meta) {
    return { title: 'Not found' };
  }
  return {
    title: props.meta.title,
    description: props.meta.description,
    openGraph: {
      title: props.meta.title,
      description: props.meta.description,
      url: props.meta.url,
      images: props.meta.image ? [props.meta.image] : undefined,
    },
  };
}

export default async function ShortlinkPage({ params }) {
  const { code } = await params;
  const props = await resolveShortlinkPageProps(code);
  if (!props) notFound();
  return <ShortlinkClient targetUrl={props.targetUrl} code={code} meta={props.meta} />;
}
