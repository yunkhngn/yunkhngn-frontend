import Link from "next/link";
import { Button } from "@/components/ui/Button";
import Layout from "@/components/template/Default/Layout";
import dynamic from "next/dynamic";
import { Home, Blocks } from "lucide-react";

const FlappyGame = dynamic(() => import("@/components/home/FlappyGame"), {
    ssr: false,
    loading: () => (
        <div className="w-[400px] h-[500px] max-w-full rounded-xl border border-border/50 bg-black/95 flex items-center justify-center">
            <span className="text-muted-foreground font-mono text-sm animate-pulse">Loading game...</span>
        </div>
    ),
});

export default function Custom404() {
    return (
        <div className="flex flex-col items-center justify-center p-4 sm:p-8 text-center min-h-[80vh] gap-8">
            {/* Header */}
            <div className="space-y-3">
                <h1 className="text-7xl sm:text-8xl font-bold text-primary font-mono tracking-tighter">
                    404
                </h1>
                <p className="text-muted-foreground text-lg flex items-center justify-center gap-2">
                    <Blocks className="h-5 w-5" />
                    Page not found. But here&apos;s a game!
                </p>
            </div>

            {/* Game */}
            <FlappyGame />

            {/* Back to Home */}
            <Button asChild variant="outline" size="lg" className="gap-2">
                <Link href="/">
                    <Home className="h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
        </div>
    );
}

Custom404.getLayout = function getLayout(page) {
    return (
        <Layout
            title="404 - Page Not Found"
            description="The page you are looking for does not exist. Play a game while you're here!"
        >
            {page}
        </Layout>
    );
};
