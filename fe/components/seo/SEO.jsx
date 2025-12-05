import Head from 'next/head';
import { useRouter } from 'next/router';

const SEO = ({
    title = "YunKhngn - Blog & Portfolio",
    description = "Personal blog and portfolio of YunKhngn. Sharing thoughts on tech, life, and everything in between.",
    image = "https://res.cloudinary.com/dso98bbuw/image/upload/v1/blog-portfolio/og-default",
    type = "website"
}) => {
    const router = useRouter();
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yunkhngn.dev';
    const url = `${siteUrl}${router.asPath}`;

    return (
        <Head>
            {/* Primary Meta Tags */}
            <title>{title}</title>
            <meta name="title" content={title} />
            <meta name="description" content={description} />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />
        </Head>
    );
};

export default SEO;
