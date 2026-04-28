import HomeContent from '@/components/home/HomeContent';
import { fetchHomePageData } from '@/lib/fetchHomePageData';

export const revalidate = 120;

export default async function HomePage() {
  const props = await fetchHomePageData();
  return <HomeContent {...props} />;
}
