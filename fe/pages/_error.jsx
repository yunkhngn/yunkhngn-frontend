import { DefaultFooter, DefaultNavbar, Metadata } from "@/components/template";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

function Error({ statusCode }) {
    return (
        <div className="flex flex-col min-h-screen font-sans">
            <Metadata
                title={statusCode ? `${statusCode} - Error` : "Error"}
                description="An error occurred."
            />
            <DefaultNavbar />
            <main className="flex-1 flex flex-col items-center justify-center p-8 sm:p-20 text-center">
                <h1 className="text-6xl font-bold text-destructive mb-4">{statusCode || "Error"}</h1>
                <h2 className="text-2xl font-semibold mb-6">
                    {statusCode
                        ? `An error ${statusCode} occurred on server`
                        : "An error occurred on client"}
                </h2>
                <Button asChild>
                    <Link href="/">Back to Home</Link>
                </Button>
            </main>
            <DefaultFooter />
        </div>
    );
}

Error.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};

export default Error;
