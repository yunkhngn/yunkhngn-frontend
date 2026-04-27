import { readNestJson } from '@/lib/api/readJson';
const EXTERNAL_DATA_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://yunkhngn.dev';

function generateSiteMap(blogs, projects) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!--Static Pages-->
     <url>
       <loc>${BASE_URL}</loc>
       <changefreq>daily</changefreq>
       <priority>1.0</priority>
     </url>
     <url>
       <loc>${BASE_URL}/about</loc>
       <changefreq>monthly</changefreq>
       <priority>0.8</priority>
     </url>
     <url>
       <loc>${BASE_URL}/blog</loc>
       <changefreq>daily</changefreq>
       <priority>0.9</priority>
     </url>
     <url>
       <loc>${BASE_URL}/project</loc>
       <changefreq>weekly</changefreq>
       <priority>0.9</priority>
     </url>
     <url>
       <loc>${BASE_URL}/gallery</loc>
       <changefreq>weekly</changefreq>
       <priority>0.8</priority>
     </url>
     <url>
       <loc>${BASE_URL}/contact</loc>
       <changefreq>monthly</changefreq>
       <priority>0.7</priority>
     </url>
     <url>
       <loc>${BASE_URL}/journal</loc>
       <changefreq>weekly</changefreq>
       <priority>0.9</priority>
     </url>
     <url>
       <loc>${BASE_URL}/photo</loc>
       <changefreq>weekly</changefreq>
       <priority>0.8</priority>
     </url>
     <url>
       <loc>${BASE_URL}/showcase</loc>
       <changefreq>monthly</changefreq>
       <priority>0.8</priority>
     </url>
     <url>
       <loc>${BASE_URL}/resume</loc>
       <changefreq>monthly</changefreq>
       <priority>0.8</priority>
     </url>

     <!--Dynamic Blogs-->
     ${blogs
      .filter(blog => blog.status === 'PUBLISHED')
      .map(({ slug, updatedAt, createdAt }) => {
        return `
       <url>
           <loc>${BASE_URL}/blog/${slug}</loc>
           <lastmod>${new Date(updatedAt || createdAt).toISOString()}</lastmod>
           <changefreq>weekly</changefreq>
           <priority>0.8</priority>
       </url>
     `;
      })
      .join('')}

     <!--Dynamic Projects-->
     ${projects
      .map(({ slug, updatedAt, createdAt }) => {
        return `
       <url>
           <loc>${BASE_URL}/project/${slug}</loc>
           <lastmod>${new Date(updatedAt || createdAt).toISOString()}</lastmod>
           <changefreq>monthly</changefreq>
           <priority>0.8</priority>
       </url>
     `;
      })
      .join('')}
   </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({ res }) {
  // We make an API call to gather the URLs for our site
  try {
    const [blogsRes, projectsRes] = await Promise.all([
      fetch(`${EXTERNAL_DATA_URL}/blogs`),
      fetch(`${EXTERNAL_DATA_URL}/projects`)
    ]);

    const blogs = await readNestJson(blogsRes);
    const projects = await readNestJson(projectsRes);

    // We generate the XML sitemap with the posts data
    const sitemap = generateSiteMap(blogs, projects);

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=86400'
    );
    // we send the XML to the browser
    res.write(sitemap);
    res.end();
  } catch (error) {
    console.error('Failed to generate sitemap:', error);
    res.statusCode = 500;
    res.end();
  }

  return {
    props: {},
  };
}

export default SiteMap;
