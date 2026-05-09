import HomeContent from '@/components/home/HomeContent';
import { fetchHomePageData } from '@/lib/fetchHomePageData';
import JsonLd from '@/lib/seo/JsonLd.jsx';
import { personJsonLd, webSiteJsonLd } from '@/lib/seo/jsonLd';

export const revalidate = 120;

export default async function HomePage() {
  const props = await fetchHomePageData();
  return (
    <>
      <JsonLd data={[personJsonLd(), webSiteJsonLd()]} />
      <HomeContent {...props} />
    </>
  );
}
