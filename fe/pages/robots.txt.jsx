const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://yunkhngn.dev';

function Robots() {
    // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({ res }) {
    const robots = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${BASE_URL}/sitemap.xml
`;

    res.setHeader('Content-Type', 'text/plain');
    res.write(robots);
    res.end();

    return {
        props: {},
    };
}

export default Robots;
