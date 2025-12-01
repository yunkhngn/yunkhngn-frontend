import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import Image from "next/image";
import { X } from "lucide-react";

export function ImagePreviewModal({ isOpen, onClose, imageSrc }) {
    if (!imageSrc) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 border-none bg-transparent shadow-none flex items-center justify-center overflow-hidden focus:outline-none"
                showCloseButton={false}
            >
                <DialogTitle className="sr-only">Image Preview</DialogTitle>
                <div className="relative w-full h-full flex items-center justify-center" onClick={onClose}>
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {/* Image */}
                    <div className="relative w-auto h-auto max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={imageSrc}
                            alt="Preview"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
