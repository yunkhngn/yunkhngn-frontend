import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { X, ThumbsUp, Heart, Cat, Flame, Laugh, Download, Share2, ChevronLeft, ChevronRight, Play, Pause, Camera, Grid, LayoutGrid, List, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from "@/components/ui/Skeleton";
import Layout from '@/components/template/Default/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PHOTOS_PER_PAGE = 12;

const REACTIONS = [
    { id: 'like', icon: ThumbsUp, label: 'Like', color: 'text-blue-500' },
    { id: 'heart', icon: Heart, label: 'Heart', color: 'text-red-500' },
    { id: 'cat', icon: Cat, label: 'Cat', color: 'text-purple-500' },
    { id: 'fire', icon: Flame, label: 'Fire', color: 'text-orange-500' },
    { id: 'laugh', icon: Laugh, label: 'Laugh', color: 'text-yellow-500' },
];

const LAYOUTS = [
    { id: 'masonry', icon: LayoutGrid, label: 'Masonry' },
    { id: 'grid', icon: Grid, label: 'Grid' },
    { id: 'list', icon: List, label: 'List' },
];

export default function Photo() {
    const [photos, setPhotos] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [selectedTag, setSelectedTag] = useState(null);
    const [layout, setLayout] = useState('masonry');

    const [viewingIndex, setViewingIndex] = useState(null);
    const [selectedReaction, setSelectedReaction] = useState(null);
    const [reactionCounts, setReactionCounts] = useState({ like: 0, heart: 0, cat: 0, fire: 0, laugh: 0 });
    const [loadingReaction, setLoadingReaction] = useState(false);
    const [slideshow, setSlideshow] = useState(false);
    const [showExif, setShowExif] = useState(false);
    const { user, signInAnonymously } = useAuth();
    const observerRef = useRef(null);
    const slideshowTimerRef = useRef(null);

    const viewingPhoto = viewingIndex !== null ? photos[viewingIndex] : null;

    // Fetch albums and tags on mount
    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const [albumsRes, tagsRes] = await Promise.all([
                    fetch(`${API_URL}/albums`),
                    fetch(`${API_URL}/gallery/tags`),
                ]);
                if (albumsRes.ok) setAlbums(await albumsRes.json());
                if (tagsRes.ok) setTags(await tagsRes.json());
            } catch (e) {
                console.error(e);
            }
        };
        fetchMeta();
    }, []);

    // Fetch photos with filters
    const fetchPhotos = useCallback(async (pageNum = 1, append = false) => {
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            const params = new URLSearchParams({ page: String(pageNum), limit: String(PHOTOS_PER_PAGE), sort: 'createdAt', order: 'desc' });
            if (selectedAlbum) params.set('albumId', selectedAlbum);
            if (selectedTag) params.set('tag', selectedTag);

            const res = await fetch(`${API_URL}/gallery?${params}`);
            if (res.ok) {
                const result = await res.json();
                setPhotos(prev => append ? [...prev, ...result.data] : result.data);
                setTotalPages(result.totalPages);
                setPage(pageNum);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [selectedAlbum, selectedTag]);

    useEffect(() => {
        fetchPhotos(1, false);
    }, [fetchPhotos]);

    // Infinite scroll observer
    const lastPhotoRef = useCallback((node) => {
        if (loadingMore) return;
        if (observerRef.current) observerRef.current.disconnect();
        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && page < totalPages) {
                fetchPhotos(page + 1, true);
            }
        });
        if (node) observerRef.current.observe(node);
    }, [loadingMore, page, totalPages, fetchPhotos]);

    // Reset filters
    const handleAlbumChange = (albumId) => {
        setSelectedAlbum(albumId === selectedAlbum ? null : albumId);
        setSelectedTag(null);
    };

    const handleTagChange = (tag) => {
        setSelectedTag(tag === selectedTag ? null : tag);
    };

    // View photo
    const openPhoto = (index) => {
        setViewingIndex(index);
        // Track view
        fetch(`${API_URL}/gallery/views/${photos[index].id}`, { method: 'POST' }).catch(() => { });
    };

    const closePhoto = useCallback(() => {
        setViewingIndex(null);
        setShowExif(false);
        setSlideshow(false);
    }, []);

    const goToPrev = useCallback(() => {
        setViewingIndex(currentIndex => {
            if (currentIndex > 0) {
                fetch(`${API_URL}/gallery/views/${photos[currentIndex - 1].id}`, { method: 'POST' }).catch(() => { });
                return currentIndex - 1;
            }
            return currentIndex;
        });
    }, [photos]);

    const goToNext = useCallback(() => {
        setViewingIndex(currentIndex => {
            if (currentIndex < photos.length - 1) {
                fetch(`${API_URL}/gallery/views/${photos[currentIndex + 1].id}`, { method: 'POST' }).catch(() => { });
                return currentIndex + 1;
            }
            return currentIndex;
        });
    }, [photos]);

    // Keyboard navigation
    useEffect(() => {
        if (viewingIndex === null) return;
        const handleKey = (e) => {
            if (e.key === 'ArrowLeft') goToPrev();
            else if (e.key === 'ArrowRight') goToNext();
            else if (e.key === 'Escape') closePhoto();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [viewingIndex, goToNext, goToPrev, closePhoto]);

    // Slideshow
    useEffect(() => {
        if (slideshow && viewingIndex !== null) {
            slideshowTimerRef.current = setInterval(() => {
                setViewingIndex(prev => {
                    if (prev >= photos.length - 1) {
                        setSlideshow(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 4000);
        }
        return () => clearInterval(slideshowTimerRef.current);
    }, [slideshow, viewingIndex, photos.length]);

    // Swipe gestures
    const touchStartX = useRef(0);
    const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const handleTouchEnd = (e) => {
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) goToNext();
            else goToPrev();
        }
    };

    // Reactions
    useEffect(() => {
        if (viewingPhoto) {
            // Only fetch if ID changed
            fetchReactions(viewingPhoto.id);
        } else {
            setSelectedReaction(null);
            setReactionCounts({ like: 0, heart: 0, cat: 0, fire: 0, laugh: 0 });
        }
    }, [viewingPhoto]);

    const fetchReactions = async (photoId) => {
        try {
            const res = await fetch(`${API_URL}/photo-reactions/${photoId}`);
            if (!res.ok) return;
            const data = await res.json();
            setReactionCounts(data.stats.counts);
            setSelectedReaction(data.userReaction);
        } catch (e) {
            console.error(e);
        }
    };

    const handleReactionClick = async (reactionId) => {
        if (!viewingPhoto) return;
        setLoadingReaction(true);
        try {
            let currentUser = user;
            if (!currentUser) {
                try {
                    const result = await signInAnonymously();
                    currentUser = result.user;
                } catch {
                    toast.error('Failed to authenticate');
                    setLoadingReaction(false);
                    return;
                }
            }
            const token = await currentUser.getIdToken();
            if (selectedReaction === reactionId) {
                const res = await fetch(`${API_URL}/photo-reactions/${viewingPhoto.id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setReactionCounts(data.stats.counts);
                    setSelectedReaction(null);
                }
            } else {
                const res = await fetch(`${API_URL}/photo-reactions/${viewingPhoto.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ reactionType: reactionId }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setReactionCounts(data.stats.counts);
                    setSelectedReaction(reactionId);
                }
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to save reaction');
        } finally {
            setLoadingReaction(false);
        }
    };

    // Download
    const handleDownload = async () => {
        if (!viewingPhoto) return;
        try {
            const res = await fetch(viewingPhoto.imageUrl);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `photo-${viewingPhoto.id}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch {
            toast.error('Failed to download');
        }
    };

    // Share (shortlink)
    const handleShare = async () => {
        if (!viewingPhoto) return;
        try {
            // Try native share first
            if (navigator.share) {
                await navigator.share({
                    title: viewingPhoto.caption || 'Photo',
                    url: viewingPhoto.imageUrl,
                });
            } else {
                await navigator.clipboard.writeText(viewingPhoto.imageUrl);
                toast.success('Link copied to clipboard!');
            }
        } catch {
            // Fallback
            await navigator.clipboard.writeText(viewingPhoto.imageUrl);
            toast.success('Link copied to clipboard!');
        }
    };

    // Parse EXIF
    const exifParsed = viewingPhoto?.exifData ? (() => {
        try { return JSON.parse(viewingPhoto.exifData); } catch { return null; }
    })() : null;

    // Generate blur placeholder URL from Cloudinary
    const getBlurUrl = (url) => {
        if (!url || !url.includes('cloudinary.com')) return undefined;
        return url.replace('/upload/', '/upload/w_20,q_auto:low,f_auto,e_blur:1000/');
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-8">
            {/* Header */}
            <div className="mb-12 text-center pt-8">
                <div className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase mb-4">
                    Gallery
                </div>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground" style={{ fontFamily: 'var(--font-playfair)' }}>
                    Locket Library
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    A collection of memories, places, and little things that inspire me.
                </p>
            </div>

            {/* Filter Bar */}
            <div className="mb-8 space-y-4">
                {/* Albums */}
                {albums.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => handleAlbumChange(null)}
                            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${!selectedAlbum
                                ? 'bg-foreground text-background shadow-md'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            All
                        </button>
                        {albums.map((album) => (
                            <button
                                key={album.id}
                                onClick={() => handleAlbumChange(album.id)}
                                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedAlbum === album.id
                                    ? 'bg-foreground text-background shadow-md'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                {album.name}
                                {album.photoCount > 0 && (
                                    <span className="ml-1.5 text-xs opacity-60">{album.photoCount}</span>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Tags + Layout toggle */}
                <div className="flex items-center justify-between gap-4">
                    {tags.length > 0 && (
                        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1">
                            {tags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => handleTagChange(tag)}
                                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all border ${selectedTag === tag
                                        ? 'border-foreground bg-foreground text-background'
                                        : 'border-border text-muted-foreground hover:border-foreground/30'
                                        }`}
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Layout & Sort */}
                    <div className="flex items-center gap-2">
                        {/* Sort Toggle */}


                        <div className="w-px h-6 bg-border mx-1" />

                        {/* Layout toggle */}
                        <div className="flex items-center gap-1 bg-muted rounded-lg p-1 shrink-0">
                            {LAYOUTS.map((l) => {
                                const Icon = l.icon;
                                return (
                                    <button
                                        key={l.id}
                                        onClick={() => setLayout(l.id)}
                                        className={`p-1.5 rounded-md transition-all ${layout === l.id
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        title={l.label}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Photo Grid */}
            {
                loading ? (
                    <div className={layout === 'masonry' ? 'columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4' : layout === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3' : 'space-y-4 max-w-3xl mx-auto'}>
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className={layout === 'masonry' ? 'break-inside-avoid' : ''}>
                                <Skeleton className={`w-full rounded-xl ${layout === 'list' ? 'h-48' : i % 3 === 0 ? 'aspect-[3/4]' : i % 2 === 0 ? 'aspect-video' : 'aspect-square'}`} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Masonry */}
                        {layout === 'masonry' && (
                            <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
                                {photos.map((photo, i) => (
                                    <div
                                        key={photo.id}
                                        ref={i === photos.length - 1 ? lastPhotoRef : null}
                                        className="break-inside-avoid relative group cursor-pointer rounded-xl overflow-hidden bg-muted"
                                        onClick={() => openPhoto(i)}
                                    >
                                        <Image
                                            src={photo.imageUrl}
                                            alt={photo.caption || 'Gallery Photo'}
                                            width={0}
                                            height={0}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                            placeholder={getBlurUrl(photo.imageUrl) ? 'blur' : 'empty'}
                                            blurDataURL={getBlurUrl(photo.imageUrl)}
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                        {photo.caption && (
                                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <p className="text-white text-sm font-medium line-clamp-2">{photo.caption}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Grid */}
                        {layout === 'grid' && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {photos.map((photo, i) => (
                                    <div
                                        key={photo.id}
                                        ref={i === photos.length - 1 ? lastPhotoRef : null}
                                        className="aspect-square relative group cursor-pointer rounded-xl overflow-hidden bg-muted"
                                        onClick={() => openPhoto(i)}
                                    >
                                        <Image
                                            src={photo.imageUrl}
                                            alt={photo.caption || 'Gallery Photo'}
                                            fill
                                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* List */}
                        {layout === 'list' && (
                            <div className="space-y-6 max-w-3xl mx-auto">
                                {photos.map((photo, i) => (
                                    <div
                                        key={photo.id}
                                        ref={i === photos.length - 1 ? lastPhotoRef : null}
                                        className="group cursor-pointer rounded-xl overflow-hidden bg-muted"
                                        onClick={() => openPhoto(i)}
                                    >
                                        <div className="relative">
                                            <Image
                                                src={photo.imageUrl}
                                                alt={photo.caption || 'Gallery Photo'}
                                                width={0}
                                                height={0}
                                                sizes="(max-width: 768px) 100vw, 768px"
                                                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                                unoptimized
                                            />
                                        </div>
                                        {photo.caption && (
                                            <div className="p-4 bg-card">
                                                <p className="text-sm text-foreground">{photo.caption}</p>
                                                {photo.tags && (
                                                    <div className="flex gap-1.5 mt-2 flex-wrap">
                                                        {photo.tags.split(',').map(t => (
                                                            <span key={t.trim()} className="text-xs text-muted-foreground">#{t.trim()}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Loading more indicator */}
                        {loadingMore && (
                            <div className="flex justify-center py-8">
                                <div className="h-8 w-8 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
                            </div>
                        )}
                    </>
                )
            }

            {
                !loading && photos.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">No photos yet.</div>
                )
            }

            {/* Lightbox Modal */}
            <Dialog open={viewingIndex !== null} onOpenChange={(open) => !open && closePhoto()}>
                <DialogContent
                    showCloseButton={false}
                    className="max-w-[95vw] md:max-w-5xl p-0 overflow-hidden border-none bg-transparent shadow-none sm:bg-transparent rounded"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {viewingPhoto && (
                        <div className="relative w-fit h-fit mx-auto pointer-events-auto">
                            {/* Top Controls */}
                            <div className="absolute top-2 right-2 md:top-4 md:right-4 z-50 flex items-center gap-2 md:gap-3">
                                {/* Reactions */}
                                <div className="flex items-center gap-1 md:gap-1.5 bg-black/60 backdrop-blur-md rounded-full px-2 py-1 md:px-2.5 md:py-1.5 shadow-xl border border-white/10">
                                    {REACTIONS.map((reaction) => {
                                        const Icon = reaction.icon;
                                        const isSelected = selectedReaction === reaction.id;
                                        const count = reactionCounts[reaction.id] || 0;
                                        return (
                                            <button
                                                key={reaction.id}
                                                onClick={(e) => { e.stopPropagation(); handleReactionClick(reaction.id); }}
                                                disabled={loadingReaction}
                                                className={`flex items-center gap-1 px-1.5 py-1 md:px-2 md:py-1 rounded-full transition-all duration-200 hover:scale-110 ${isSelected ? 'bg-white/20 scale-105' : 'hover:bg-white/10'} ${loadingReaction ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                title={reaction.label}
                                            >
                                                <Icon className={`h-3.5 w-3.5 md:h-4 md:w-4 ${isSelected ? reaction.color : 'text-white'} transition-colors duration-200`} fill={isSelected ? 'currentColor' : 'none'} strokeWidth={2} />
                                                {count > 0 && (
                                                    <span className={`text-[10px] md:text-xs font-medium ${isSelected ? reaction.color : 'text-white'}`}>{count}</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Close */}
                                <Button variant="secondary" size="icon" className="rounded-full opacity-80 hover:opacity-100 bg-black/50 hover:bg-black/70 text-white border-none h-8 w-8 md:h-9 md:w-9" onClick={closePhoto}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Bottom Controls */}
                            <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 z-50 flex items-center gap-2">
                                {/* EXIF toggle */}
                                {exifParsed && (
                                    <button onClick={() => setShowExif(!showExif)} className={`p-2 rounded-full transition-all ${showExif ? 'bg-white/30' : 'bg-black/50 hover:bg-black/70'} text-white`} title="Photo info">
                                        <Camera className="h-4 w-4" />
                                    </button>
                                )}
                                {/* Slideshow */}
                                <button onClick={() => setSlideshow(!slideshow)} className={`p-2 rounded-full transition-all ${slideshow ? 'bg-white/30' : 'bg-black/50 hover:bg-black/70'} text-white`} title={slideshow ? 'Pause' : 'Slideshow'}>
                                    {slideshow ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                </button>
                                {/* Download */}
                                <button onClick={handleDownload} className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all" title="Download">
                                    <Download className="h-4 w-4" />
                                </button>
                                {/* Share */}
                                <button onClick={handleShare} className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all" title="Share">
                                    <Share2 className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Prev/Next Arrows */}
                            {viewingIndex > 0 && (
                                <button onClick={(e) => { e.stopPropagation(); goToPrev(); }} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-40 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100" style={{ opacity: 0.7 }}>
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                            )}
                            {viewingIndex < photos.length - 1 && (
                                <button onClick={(e) => { e.stopPropagation(); goToNext(); }} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-40 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100" style={{ opacity: 0.7 }}>
                                    <ChevronRight className="h-6 w-6" />
                                </button>
                            )}

                            {/* Photo */}
                            <Image
                                src={viewingPhoto.imageUrl}
                                alt={viewingPhoto.caption || 'Photo'}
                                width={0}
                                height={0}
                                sizes="100vw"
                                className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-2xl shadow-2xl"
                                unoptimized
                            />

                            {/* Caption Overlay */}
                            {viewingPhoto.caption && (
                                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent rounded-b-2xl text-left z-30">
                                    <p className="text-white text-sm md:text-lg font-medium leading-relaxed">{viewingPhoto.caption}</p>
                                    {viewingPhoto.tags && (
                                        <div className="flex gap-2 mt-2 flex-wrap">
                                            {viewingPhoto.tags.split(',').map(t => (
                                                <span key={t.trim()} className="text-white/60 text-xs">#{t.trim()}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 mt-2 text-white/50 text-xs">
                                        {viewingPhoto.views > 0 && <span>{viewingPhoto.views} views</span>}
                                        {viewingPhoto.album && <span>{viewingPhoto.album.name}</span>}
                                        <span className="opacity-50">·</span>
                                        <span>{viewingIndex + 1} / {photos.length}</span>
                                    </div>
                                </div>
                            )}

                            {/* EXIF Panel */}
                            {showExif && exifParsed && (
                                <div className="absolute top-14 left-2 md:left-4 z-50 bg-black/80 backdrop-blur-xl rounded-xl p-4 text-white text-sm space-y-2 min-w-[200px] border border-white/10 animate-in slide-in-from-left-2">
                                    <div className="flex items-center gap-2 mb-3 text-white/80">
                                        <Camera className="h-4 w-4" />
                                        <span className="font-semibold">Photo Info</span>
                                    </div>
                                    {exifParsed.camera && <div className="flex justify-between gap-4"><span className="text-white/50 shrink-0">Camera</span><span className="text-right">{exifParsed.camera}</span></div>}
                                    {exifParsed.lens && <div className="flex justify-between gap-4"><span className="text-white/50 shrink-0">Lens</span><span className="text-right">{exifParsed.lens}</span></div>}
                                    {exifParsed.focalLength && <div className="flex justify-between gap-4"><span className="text-white/50 shrink-0">Focal</span><span className="text-right">{exifParsed.focalLength}</span></div>}
                                    {exifParsed.aperture && <div className="flex justify-between gap-4"><span className="text-white/50 shrink-0">Aperture</span><span className="text-right">{exifParsed.aperture}</span></div>}
                                    {exifParsed.shutter && <div className="flex justify-between gap-4"><span className="text-white/50 shrink-0">Shutter</span><span className="text-right">{exifParsed.shutter}</span></div>}
                                    {exifParsed.iso && <div className="flex justify-between gap-4"><span className="text-white/50 shrink-0">ISO</span><span className="text-right">{exifParsed.iso}</span></div>}
                                </div>
                            )}

                            {/* Photo counter */}

                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div >
    );
}

Photo.getLayout = function getLayout(page) {
    return (
        <Layout
            title="Photo Gallery - Khoa Nguyễn"
            description="A collection of moments."
        >
            {page}
        </Layout>
    );
};
