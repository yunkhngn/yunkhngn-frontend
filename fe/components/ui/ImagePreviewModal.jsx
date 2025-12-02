import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import Image from "next/image";
import { X, ThumbsUp, Heart, Cat, Flame, Laugh } from "lucide-react";
import { useState } from "react";

const REACTIONS = [
    { id: 'like', icon: ThumbsUp, label: 'Like', color: 'text-blue-500' },
    { id: 'heart', icon: Heart, label: 'Heart', color: 'text-red-500' },
    { id: 'cat', icon: Cat, label: 'Cat', color: 'text-purple-500' },
    { id: 'fire', icon: Flame, label: 'Fire', color: 'text-orange-500' },
    { id: 'laugh', icon: Laugh, label: 'Laugh', color: 'text-yellow-500' },
];

export function ImagePreviewModal({ isOpen, onClose, imageSrc }) {
    const [selectedReaction, setSelectedReaction] = useState(null);

    if (!imageSrc) return null;

    const handleReactionClick = (reactionId) => {
        setSelectedReaction(selectedReaction === reactionId ? null : reactionId);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 border-none bg-transparent shadow-none flex items-center justify-center overflow-hidden focus:outline-none"
                showCloseButton={false}
            >
                <DialogTitle className="sr-only">Image Preview</DialogTitle>
                <div className="relative w-full h-full flex flex-col items-center justify-center gap-4" onClick={onClose}>
                    {/* Image Container with Overlays */}
                    <div
                        className="relative flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top Controls: Reactions + Close */}
                        <div className="absolute top-2 right-2 md:top-4 md:right-4 z-50 flex items-center gap-2 md:gap-3">
                            {/* Reaction Panel */}
                            <div className="flex items-center gap-1.5 md:gap-2 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-full px-2 py-1 md:px-3 md:py-1.5 shadow-lg border border-gray-200 dark:border-white/10">
                                {REACTIONS.map((reaction) => {
                                    const Icon = reaction.icon;
                                    const isSelected = selectedReaction === reaction.id;

                                    return (
                                        <button
                                            key={reaction.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleReactionClick(reaction.id);
                                            }}
                                            className={`p-1 md:p-1.5 rounded-full transition-all duration-200 hover:scale-125 ${isSelected
                                                ? 'bg-gray-200 dark:bg-white/20 scale-110'
                                                : 'hover:bg-gray-100 dark:hover:bg-white/10'
                                                }`}
                                            title={reaction.label}
                                        >
                                            <Icon
                                                className={`h-4 w-4 md:h-5 md:w-5 ${isSelected ? reaction.color : 'text-gray-700 dark:text-white'
                                                    } transition-colors duration-200`}
                                                fill={isSelected ? 'currentColor' : 'none'}
                                                strokeWidth={2}
                                            />
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="p-1.5 md:p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                            >
                                <X className="h-5 w-5 md:h-6 md:w-6" />
                            </button>
                        </div>

                        <img
                            src={imageSrc}
                            alt="Preview"
                            className="max-w-[90vw] max-h-[80vh] w-auto h-auto object-contain rounded-2xl shadow-2xl"
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
}

