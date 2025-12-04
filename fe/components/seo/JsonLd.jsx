import Head from 'next/head';

export default function JsonLd({ data }) {
    return (
        <Head>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
            />
        </Head>
    );
}
