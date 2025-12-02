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
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {/* Image */}
                    <div
                        className="relative w-auto h-auto max-w-[90vw] max-h-[80vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={imageSrc}
                            alt="Preview"
                            fill
                            className="object-contain rounded-lg shadow-2xl"
                        />
                    </div>

                    {/* Reaction Panel - Below Image */}
                    <div
                        className="z-50"
                        style={{ pointerEvents: 'auto' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 bg-white/95 dark:bg-black/90 backdrop-blur-md rounded-full px-4 py-3 shadow-2xl border-2 border-gray-300 dark:border-white/20">
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
                                        className={`p-2.5 rounded-full transition-all duration-200 hover:scale-125 ${isSelected
                                            ? 'bg-gray-200 dark:bg-white/20 scale-110'
                                            : 'hover:bg-gray-100 dark:hover:bg-white/10'
                                            }`}
                                        title={reaction.label}
                                    >
                                        <Icon
                                            className={`h-6 w-6 ${isSelected ? reaction.color : 'text-gray-700 dark:text-white'
                                                } transition-colors duration-200`}
                                            fill={isSelected ? 'currentColor' : 'none'}
                                            strokeWidth={2}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
}

