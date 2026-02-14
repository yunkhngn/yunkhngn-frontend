import { DefaultFooter, DefaultNavbar } from "@/components/template";
import InteractiveBackground from "@/components/ui/InteractiveBackground";
import { Metadata } from "@/components/template";
import LiveActivityContainer from "@/components/live/LiveActivityContainer";

import { useFocusMode } from "@/contexts/FocusModeContext";

export default function DefaultLayout({ children, title, description, image, url }) {
    const { isFocusMode } = useFocusMode();

    return (
        <div className="flex flex-col min-h-screen font-sans bg-background text-foreground relative">
            {title && <Metadata title={title} description={description} image={image} url={url} />}

            {!isFocusMode && (
                <div className="absolute top-0 left-0 w-full h-screen overflow-hidden z-0">
                    <InteractiveBackground />
                </div>
            )}

            {!isFocusMode && <DefaultNavbar />}

            <main className="flex-1 relative z-10">
                {children}
            </main>

            {!isFocusMode && <DefaultFooter />}

            {!isFocusMode && <LiveActivityContainer />}
        </div>
    );
}
