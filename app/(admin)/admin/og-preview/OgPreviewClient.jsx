'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Copy, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function OgPreviewClient() {
    const [params, setParams] = useState({
        title: 'Khoa Nguyễn',
        type: 'page',
        description: 'Software Engineer · Designer · Guitarist',
        thumbnail: '',
    });
    const [ogUrl, setOgUrl] = useState('');
    const [imgKey, setImgKey] = useState(0);
    const debounceRef = useRef(null);

    const buildUrl = (p) => {
        const base = typeof window !== 'undefined' ? window.location.origin : 'https://yunkhngn.dev';
        const q = new URLSearchParams();
        if (p.title) q.set('title', p.title);
        if (p.type) q.set('type', p.type);
        if (p.description) q.set('description', p.description);
        if (p.thumbnail) q.set('thumbnail', p.thumbnail);
        return `${base}/api/og?${q.toString()}`;
    };

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setOgUrl(buildUrl(params));
            setImgKey(k => k + 1);
        }, 600);
        return () => clearTimeout(debounceRef.current);
    }, [params]);

    const copyUrl = () => {
        navigator.clipboard.writeText(ogUrl);
        toast.success('URL copied');
    };

    const refresh = () => setImgKey(k => k + 1);

    const set = (key) => (e) => setParams(p => ({ ...p, [key]: e.target?.value ?? e }));

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col gap-0">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">OG Image Preview</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Live preview of Open Graph images</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={copyUrl} className="gap-2">
                        <Copy className="h-3.5 w-3.5" /> Copy URL
                    </Button>
                    <Button variant="outline" size="sm" onClick={refresh} className="gap-2">
                        <RefreshCw className="h-3.5 w-3.5" /> Refresh
                    </Button>
                    <a href={ogUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-2">
                            <ExternalLink className="h-3.5 w-3.5" /> Open
                        </Button>
                    </a>
                </div>
            </div>

            <div className="flex flex-1 min-h-0">
                {/* Left: controls */}
                <div className="w-80 shrink-0 border-r border-border overflow-y-auto p-5 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Type</label>
                        <Select value={params.type} onValueChange={set('type')}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="page">Portfolio</SelectItem>
                                <SelectItem value="blog">Writing</SelectItem>
                                <SelectItem value="project">Project</SelectItem>
                                <SelectItem value="journal">Journal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Title</label>
                        <Textarea
                            value={params.title}
                            onChange={set('title')}
                            rows={3}
                            placeholder="Page title..."
                            className="resize-none text-sm"
                        />
                        <p className="text-xs text-muted-foreground text-right">{params.title.length}/70</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Description</label>
                        <Textarea
                            value={params.description}
                            onChange={set('description')}
                            rows={3}
                            placeholder="Short description..."
                            className="resize-none text-sm"
                        />
                        <p className="text-xs text-muted-foreground text-right">{params.description.length}/120</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Thumbnail URL</label>
                        <Input
                            value={params.thumbnail}
                            onChange={set('thumbnail')}
                            placeholder="https://... (optional)"
                            className="text-sm"
                        />
                        <p className="text-xs text-muted-foreground">Leave blank for text-only layout</p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-border">
                        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Raw URL</label>
                        <p className="text-xs text-muted-foreground break-all bg-muted/50 rounded-lg p-2 font-mono leading-relaxed">
                            {ogUrl}
                        </p>
                    </div>

                    {/* Quick presets */}
                    <div className="space-y-1.5 pt-2 border-t border-border">
                        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Presets</label>
                        <div className="flex flex-col gap-1.5">
                            {[
                                { label: 'Home', title: 'Khoa Nguyễn', type: 'page', description: 'Software Engineer · Designer · Guitarist', thumbnail: '' },
                                { label: 'Blog (no image)', title: 'How I built this website', type: 'blog', description: 'A deep dive into the tech stack and design decisions behind my portfolio.', thumbnail: '' },
                                { label: 'Blog (with image)', title: 'How I built this website', type: 'blog', description: 'A deep dive into the tech stack behind my portfolio.', thumbnail: 'https://res.cloudinary.com/dqfxdklwx/image/upload/v1/blog-portfolio/blogs/sample.jpg' },
                                { label: 'Project', title: 'yunkhngn.dev', type: 'project', description: 'Personal portfolio and blog built with Next.js and NestJS.', thumbnail: '' },
                            ].map(preset => (
                                <button
                                    key={preset.label}
                                    onClick={() => setParams({ title: preset.title, type: preset.type, description: preset.description, thumbnail: preset.thumbnail })}
                                    className="text-left text-xs px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: preview */}
                <div className="flex-1 flex flex-col items-center justify-center bg-muted/20 p-8 gap-6 overflow-auto">
                    {/* 1200x630 preview scaled to fit */}
                    <div className="w-full max-w-3xl">
                        <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-border" style={{ aspectRatio: '1200/630' }}>
                            {ogUrl ? (
                                <img
                                    key={imgKey}
                                    src={ogUrl}
                                    alt="OG preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                    Loading…
                                </div>
                            )}
                        </div>
                        <p className="text-center text-xs text-muted-foreground mt-3">1200 × 630 — actual render</p>
                    </div>

                    {/* Social card mock */}
                    <div className="w-full max-w-sm rounded-xl overflow-hidden border border-border bg-background shadow-sm">
                        {ogUrl && (
                            <img
                                key={`thumb-${imgKey}`}
                                src={ogUrl}
                                alt="Social card preview"
                                className="w-full aspect-[1200/630] object-cover"
                            />
                        )}
                        <div className="p-3 border-t border-border">
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">YUNKHNGN.DEV</p>
                            <p className="text-sm font-semibold text-foreground truncate">{params.title || 'Title'}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{params.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
