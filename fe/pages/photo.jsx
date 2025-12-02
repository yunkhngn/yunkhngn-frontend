import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { X, ThumbsUp, Heart, Cat, Flame, Laugh } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from "@/components/ui/Skeleton";
import Layout from '@/components/template/Default/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const REACTIONS = [
    { id: 'like', icon: ThumbsUp, label: 'Like', color: 'text-blue-500' },
    { id: 'heart', icon: Heart, label: 'Heart', color: 'text-red-500' },
    { id: 'cat', icon: Cat, label: 'Cat', color: 'text-purple-500' },
    { id: 'fire', icon: Flame, label: 'Fire', color: 'text-orange-500' },
    { id: 'laugh', icon: Laugh, label: 'Laugh', color: 'text-yellow-500' },
];

export default function Photo() {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingPhoto, setViewingPhoto] = useState(null);
    const [selectedReaction, setSelectedReaction] = useState(null);
    const [reactionCounts, setReactionCounts] = useState({ like: 0, heart: 0, cat: 0, fire: 0, laugh: 0 });
    const [loadingReaction, setLoadingReaction] = useState(false);
    const { user, signInAnonymously } = useAuth();

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery`);
                if (!res.ok) throw new Error('Failed to fetch photos');
                const data = await res.json();
                setPhotos(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchPhotos();
    }, []);

    // Fetch reactions when viewing a photo
    useEffect(() => {
        if (viewingPhoto) {
            fetchReactions(viewingPhoto.id);
        } else {
            // Reset when closing
            setSelectedReaction(null);
            setReactionCounts({ like: 0, heart: 0, cat: 0, fire: 0, laugh: 0 });
        }
    }, [viewingPhoto]);

    const fetchReactions = async (photoId) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/photo-reactions/${photoId}`);
            if (!res.ok) return;
            const data = await res.json();
            setReactionCounts(data.stats.counts);
            setSelectedReaction(data.userReaction);
        } catch (error) {
            console.error('Failed to fetch reactions:', error);
        }
    };

    const handleReactionClick = async (reactionId) => {
        if (!viewingPhoto) return;

        setLoadingReaction(true);
        try {
            // Ensure user is authenticated (anonymous or logged in)
            let currentUser = user;
            if (!currentUser) {
                try {
                    const result = await signInAnonymously();
                    currentUser = result.user; // Get user from UserCredential
                    toast.success('Signed in anonymously');
                } catch (error) {
                    toast.error('Failed to authenticate');
                    setLoadingReaction(false);
                    return;
                }
            }

            const token = await currentUser.getIdToken();

            // If clicking the same reaction, remove it
            if (selectedReaction === reactionId) {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/photo-reactions/${viewingPhoto.id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setReactionCounts(data.stats.counts);
                    setSelectedReaction(null);
                }
            } else {
                // Add or update reaction
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/photo-reactions/${viewingPhoto.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ reactionType: reactionId }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setReactionCounts(data.stats.counts);
                    setSelectedReaction(reactionId);
                }
            }
        } catch (error) {
            console.error('Failed to react:', error);
            toast.error('Failed to save reaction');
        } finally {
            setLoadingReaction(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-8">
            <div className="mb-16 text-center pt-8">
                <div className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase mb-4">
                    Gallery
                </div>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground" style={{ fontFamily: 'var(--font-playfair)' }}>
                    Captured Moments
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    A collection of memories, places, and little things that inspire me.
                </p>
            </div>

            {loading ? (
                <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="break-inside-avoid">
                            <Skeleton className={`w-full rounded-xl ${i % 3 === 0 ? 'aspect-[3/4]' : i % 2 === 0 ? 'aspect-video' : 'aspect-square'}`} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
                    {photos.map((photo) => (
                        <div
                            key={photo.id}
                            className="break-inside-avoid relative group cursor-pointer rounded-xl overflow-hidden bg-muted"
                            onClick={() => setViewingPhoto(photo)}
                        >
                            <Image
                                src={photo.imageUrl}
                                alt={photo.caption || 'Gallery Photo'}
                                width={0}
                                height={0}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                unoptimized
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                            {/* Caption Overlay for Grid */}
                            {photo.caption && (
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <p className="text-white text-sm font-medium line-clamp-2">{photo.caption}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {!loading && photos.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">No photos yet.</div>
            )}

            {/* View Photo Modal */}
            <Dialog open={!!viewingPhoto} onOpenChange={(open) => !open && setViewingPhoto(null)}>
                <DialogContent showCloseButton={false} className="max-w-4xl p-0 overflow-hidden border-none bg-transparent shadow-none sm:bg-transparent rounded">
                    {viewingPhoto && (
                        <div className="relative flex flex-col items-center justify-center min-h-[50vh] max-h-[90vh] pointer-events-none">
                            {/* Wrapper to constrain caption to image width */}
                            <div className="relative w-full h-[80vh] pointer-events-auto ">
                                {/* Top Controls: Reactions + Close */}
                                <div className="absolute top-2 right-2 md:top-4 md:right-4 z-50 flex items-center gap-2 md:gap-3">
                                    {/* Reaction Panel */}
                                    <div className="flex items-center gap-1 md:gap-1.5 bg-black/60 backdrop-blur-md rounded-full px-2 py-1 md:px-2.5 md:py-1.5 shadow-xl border border-white/10">
                                        {REACTIONS.map((reaction) => {
                                            const Icon = reaction.icon;
                                            const isSelected = selectedReaction === reaction.id;
                                            const count = reactionCounts[reaction.id] || 0;

                                            return (
                                                <button
                                                    key={reaction.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleReactionClick(reaction.id);
                                                    }}
                                                    disabled={loadingReaction}
                                                    className={`flex items-center gap-1 px-1.5 py-1 md:px-2 md:py-1 rounded-full transition-all duration-200 hover:scale-110 ${isSelected
                                                        ? 'bg-white/20 scale-105'
                                                        : 'hover:bg-white/10'
                                                        } ${loadingReaction ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    title={reaction.label}
                                                >
                                                    <Icon
                                                        className={`h-3.5 w-3.5 md:h-4 md:w-4 ${isSelected ? reaction.color : 'text-white'
                                                            } transition-colors duration-200`}
                                                        fill={isSelected ? 'currentColor' : 'none'}
                                                        strokeWidth={2}
                                                    />
                                                    {count > 0 && (
                                                        <span className={`text-[10px] md:text-xs font-medium ${isSelected ? reaction.color : 'text-white'}`}>
                                                            {count}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Close button */}
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="rounded-full opacity-80 hover:opacity-100 bg-black/50 hover:bg-black/70 text-white border-none h-8 w-8 md:h-9 md:w-9"
                                        onClick={() => setViewingPhoto(null)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                <Image
                                    src={viewingPhoto.imageUrl}
                                    alt={viewingPhoto.caption}
                                    fill
                                    className="object-contain rounded-2xl shadow-2xl"
                                    priority
                                    unoptimized
                                />

                                {/* Caption Overlay for Modal */}
                                {viewingPhoto.caption && (
                                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent rounded-b-lg text-left z-40">
                                        <p className="text-white text-base sm:text-lg font-medium leading-relaxed">{viewingPhoto.caption}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

Photo.getLayout = function getLayout(page) {
    return (
        <Layout
            title="Photo Gallery"
            description="A collection of moments."
        >
            {page}
        </Layout>
    );
};
