import { DefaultFooter, DefaultNavbar, Metadata } from "@/components/template";

export default function about() {
    return (
        <div className="flex flex-col min-h-screen font-sans">
            <Metadata
                title="About"
                description="About"
            />
            <DefaultNavbar />
            <main className="flex-1 flex flex-col items-center justify-center p-8 sm:p-20">

            </main>
            <DefaultFooter />
        </div>
    );
}
