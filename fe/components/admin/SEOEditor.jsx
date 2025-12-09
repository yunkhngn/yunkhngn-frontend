import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';

export default function SEOEditor({ data, onChange, onImageUpload }) {
    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const url = await onImageUpload(file);
            if (url) onChange({ ...data, seoImage: url });
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload SEO image');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Editor */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Search Engine Optimization</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Control how your content appears on Google and social media.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium flex justify-between">
                            SEO Title
                            <span className={`text-xs ${data.seoTitle?.length > 60 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                {data.seoTitle?.length || 0}/60
                            </span>
                        </label>
                        <Input
                            placeholder="Meta Title"
                            value={data.seoTitle || ''}
                            onChange={(e) => onChange({ ...data, seoTitle: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">Title tag displayed in search results.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium flex justify-between">
                            SEO Description
                            <span className={`text-xs ${data.seoDescription?.length > 160 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                {data.seoDescription?.length || 0}/160
                            </span>
                        </label>
                        <Textarea
                            placeholder="Meta Description"
                            value={data.seoDescription || ''}
                            onChange={(e) => onChange({ ...data, seoDescription: e.target.value })}
                            rows={4}
                        />
                        <p className="text-xs text-muted-foreground">Brief summary displayed below the title in search results.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">OG Image (Social Share Image)</label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors">
                            {data.seoImage ? (
                                <div className="relative aspect-video w-full max-w-[300px] mx-auto overflow-hidden rounded-md">
                                    <Image
                                        src={data.seoImage}
                                        alt="SEO Preview"
                                        fill
                                        className="object-cover"
                                    />
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="absolute top-2 right-2 h-6 w-6"
                                        onClick={() => onChange({ ...data, seoImage: '' })}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                                        <UploadCloud className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div className="text-sm">
                                        <label htmlFor="seo-image-upload" className="cursor-pointer text-primary hover:underline font-medium">
                                            Click to upload
                                        </label>
                                        {' '}or drag and drop
                                    </div>
                                    <p className="text-xs text-muted-foreground">Recommended size: 1200x630px</p>
                                    <input
                                        id="seo-image-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-2">Google Search Preview</h3>
                    <div className="bg-white dark:bg-[#1f1f1f] p-4 rounded-lg shadow-sm border font-sans select-none pointer-events-none">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                                Y
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-[#202124] dark:text-[#dadce0]">yunkhngn.dev</span>
                                <span className="text-xs text-[#5f6368] dark:text-[#bdc1c6]">https://yunkhngn.dev › blog</span>
                            </div>
                        </div>
                        <h3 className="text-xl text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer mb-1 line-clamp-1">
                            {data.seoTitle || data.title || 'Page Title'}
                        </h3>
                        <p className="text-sm text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2">
                            {data.seoDescription || data.description || 'This is how your page description will appear in search results. Make it catchy and relevant to attract more clicks from users.'}
                        </p>
                    </div>

                    <h3 className="text-lg font-semibold mb-2 mt-8">Facebook Share Preview</h3>
                    <div className="bg-[#f0f2f5] dark:bg-[#18191a] border rounded-lg overflow-hidden max-w-[400px]">
                        {data.seoImage && (
                            <div className="aspect-[1.91/1] relative bg-gray-200">
                                <Image
                                    src={data.seoImage}
                                    alt="OG Preview"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}
                        <div className="p-3 bg-white dark:bg-[#242526] border-t dark:border-[#242526]">
                            <p className="text-xs text-[#65676b] dark:text-[#b0b3b8] uppercase truncate">yunkhngn.dev</p>
                            <h4 className="font-semibold text-[#050505] dark:text-[#e4e6eb] truncate mt-0.5">
                                {data.seoTitle || data.title || 'Page Title'}
                            </h4>
                            <p className="text-sm text-[#65676b] dark:text-[#b0b3b8] line-clamp-1 mt-0.5">
                                {data.seoDescription || data.description || 'Description...'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
