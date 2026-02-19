import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";

import { X } from "lucide-react";

export function ImagePreviewModal({ isOpen, onClose, imageSrc, caption }) {
    if (!imageSrc) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="!max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 border-none bg-transparent shadow-none flex items-center justify-center overflow-hidden focus:outline-none"
                showCloseButton={false}
            >
                <DialogTitle className="sr-only">Image Preview</DialogTitle>
                <div className="relative w-full h-full flex flex-col items-center justify-center gap-4" onClick={onClose}>
                    {/* Image Container with Overlays */}
                    <div
                        className="relative flex items-center justify-center pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top Controls: Close */}
                        <div className="absolute top-2 right-2 md:top-4 md:right-4 z-50 flex items-center gap-2 md:gap-3">
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="p-1.5 md:p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                            >
                                <X className="h-5 w-5 md:h-6 md:w-6" />
                            </button>
                        </div>

                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imageSrc}
                            alt="Preview"
                            className="max-w-full max-h-[90vh] w-auto h-auto object-contain mx-auto rounded-md"
                        />

                        {/* Caption Overlay */}
                        {caption && (
                            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent rounded-b-2xl text-center z-40">
                                <p className="text-white text-sm md:text-lg font-medium leading-relaxed">{caption}</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
