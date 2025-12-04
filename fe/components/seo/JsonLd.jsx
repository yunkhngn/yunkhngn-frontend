import Head from 'next/head';

export default function JsonLd({ data }) {
    const safeJsonLd = JSON.stringify(data)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026')
        .replace(/'/g, '\\u0027');

    return (
        <Head>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: safeJsonLd }}
            />
        </Head>
    );
}
