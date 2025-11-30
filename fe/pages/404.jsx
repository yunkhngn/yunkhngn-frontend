import { DefaultFooter, DefaultNavbar, Metadata } from "@/components/template";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Custom404() {
    return (
        <div className="flex flex-col min-h-screen font-sans">
            <Metadata
                title="404 - Page Not Found"
                description="The page you are looking for does not exist."
            />
            <DefaultNavbar />
            <main className="flex-1 flex flex-col items-center justify-center p-8 sm:p-20 text-center">
                <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
                <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
                <p className="text-muted-foreground mb-8 max-w-md">
                    Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <Button asChild>
                    <Link href="/">Back to Home</Link>
                </Button>
            </main>
            <DefaultFooter />
        </div>
    );
}
