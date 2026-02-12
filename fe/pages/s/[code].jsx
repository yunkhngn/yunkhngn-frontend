export async function getServerSideProps(context) {
    const { code } = context.params;

    try {
        const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/shortlinks/resolve/${code}`);

        if (!res.ok) {
            return { notFound: true };
        }

        const data = await res.json();

        if (data?.targetUrl) {
            return {
                redirect: {
                    destination: data.targetUrl,
                    permanent: false,
                },
            };
        }

        return { notFound: true };
    } catch (error) {
        console.error('Shortlink resolve error:', error);
        return { notFound: true };
    }
}

// This component should never render because getServerSideProps always redirects or 404s
export default function ShortlinkRedirect() {
    return null;
}
