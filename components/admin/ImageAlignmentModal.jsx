/* eslint-disable @next/next/no-img-element */
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Monitor, Smartphone, Globe } from 'lucide-react';

export default function ImageAlignmentModal({ isOpen, onClose, imageSrc, initialSettings, onSave }) {
    const [settings, setSettings] = useState({
        desktop: { x: 50, y: 50 },
        mobile: { x: 50, y: 50 },
        seo: { x: 50, y: 50 },
        ...initialSettings
    });
    const [activeTab, setActiveTab] = useState('desktop');

    // Reset settings when modal opens
    useEffect(() => {
        if (isOpen) {
            setSettings({
                desktop: { x: 50, y: 50 },
                mobile: { x: 50, y: 50 },
                seo: { x: 50, y: 50 },
                ...initialSettings
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const handleImageClick = (e, type) => {
        const rect = e.target.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setSettings(prev => ({
            ...prev,
            [type]: { x: Math.round(x), y: Math.round(y) }
        }));
    };

    const handleSave = () => {
        onSave(settings);
        onClose();
    };

    const getAspectRatioClass = (type) => {
        switch (type) {
            case 'desktop': return 'aspect-[21/9]';
            case 'mobile': return 'aspect-[1.91/1]';
            case 'seo': return 'aspect-[1.91/1]';
            default: return 'aspect-video';
        }
    };

    if (!imageSrc) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
                <DialogTitle>Adjust Image Alignment</DialogTitle>

                <div className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                        Click on the image to set the focal point (center of attention) for each device type.
                    </p>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-4">
                            <TabsTrigger value="desktop" className="flex gap-2">
                                <Monitor className="w-4 h-4" /> Desktop (21:9)
                            </TabsTrigger>
                            <TabsTrigger value="mobile" className="flex gap-2">
                                <Smartphone className="w-4 h-4" /> Mobile (1.91:1)
                            </TabsTrigger>
                            <TabsTrigger value="seo" className="flex gap-2">
                                <Globe className="w-4 h-4" /> SEO (1.91:1)
                            </TabsTrigger>
                        </TabsList>

                        {['desktop', 'mobile', 'seo'].map((type) => (
                            <TabsContent key={type} value={type} className="space-y-4">
                                <div
                                    className={`relative w-full ${getAspectRatioClass(type)} bg-muted rounded-lg overflow-hidden cursor-crosshair group`}
                                    onClick={(e) => handleImageClick(e, type)}
                                >
                                    <img
                                        src={imageSrc}
                                        alt={`Preview ${type}`}
                                        className="w-full h-full object-cover transition-all duration-300"
                                        style={{
                                            objectPosition: `${settings[type]?.x || 50}% ${settings[type]?.y || 50}%`
                                        }}
                                    />

                                    {/* Focal Point Indicator */}
                                    <div
                                        className="absolute w-6 h-6 border-2 border-white rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 bg-black/20"
                                        style={{
                                            left: `${settings[type]?.x || 50}%`,
                                            top: `${settings[type]?.y || 50}%`
                                        }}
                                    >
                                        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                                    </div>

                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                                </div>

                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Focal Point: {settings[type]?.x || 50}% {settings[type]?.y || 50}%</span>
                                    <span>Click image to adjust</span>
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSave}>Save Settings</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
