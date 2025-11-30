import { DefaultFooter, DefaultNavbar, Metadata } from "@/components/template";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Custom500() {
    return (
        <div className="flex flex-col min-h-screen font-sans">
            <Metadata
                title="500 - Server Error"
                description="Internal Server Error."
            />
            <DefaultNavbar />
            <main className="flex-1 flex flex-col items-center justify-center p-8 sm:p-20 text-center">
                <h1 className="text-6xl font-bold text-destructive mb-4">500</h1>
                <h2 className="text-2xl font-semibold mb-6">Internal Server Error</h2>
                <p className="text-muted-foreground mb-8 max-w-md">
                    Something went wrong on our end. Please try again later.
                </p>
                <Button asChild>
                    <Link href="/">Back to Home</Link>
                </Button>
            </main>
            <DefaultFooter />
        </div>
    );
}
