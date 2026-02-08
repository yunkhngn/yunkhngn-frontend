import AdminLayout from "@/components/template/Admin/Layout";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Loader2, Edit, X, UploadCloud, ChevronDown, ChevronRight } from 'lucide-react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/Dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/Tabs";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/Collapsible";

const SETTINGS_GROUPS = [
    {
        title: "General",
        keys: ['bio', 'quote', 'email', 'homepage_description', 'footer_description', 'about_content', 'comment_forbidden_keywords']
    },
    {
        title: "Social Media",
        keys: ['facebook', 'github', 'instagram', 'tiktok', 'linkedin']
    },
    {
        title: "Resume / CV",
        keys: ['education', 'experience', 'skills', 'projects', 'cv_url']
    },
    {
        title: "Cloudinary",
        keys: ['cloudinary_cloud_name', 'cloudinary_api_key', 'cloudinary_api_secret']
    },
    {
        title: "Email / Resend",
        keys: ['resend_api_key', 'resend_domain', 'admin_email']
    },
    {
        title: "Cloudflare",
        keys: ['cloudflare_zone_id', 'cloudflare_account_id', 'cloudflare_api_token']
    },
    {
        title: "GitHub",
        keys: ['github_api_key', 'github_username', 'github_repo_name']
    },
    {
        title: "AI / System",
        keys: ['gemini_api_key', 'ai_persona', 'chat_api_key']
    }
];

const formatSettingTitle = (title) => {
    return title
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export default function Settings() {
    const { user } = useAuth();
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentSetting, setCurrentSetting] = useState({ settingTitle: '', content: '' });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [openSections, setOpenSections] = useState(SETTINGS_GROUPS.map(g => g.title)); // Default all open
    const fileInputRef = useRef(null);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!user) return;

        // JSON Validation for structured fields
        const jsonFields = ['education', 'experience', 'skills', 'projects'];
        if (jsonFields.includes(currentSetting.settingTitle)) {
            try {
                const parsed = JSON.parse(currentSetting.content);
                // Optional: Check if it's an array if required
                if (!Array.isArray(parsed) && ['education', 'experience', 'projects', 'skills'].includes(currentSetting.settingTitle)) {
                    toast.error(`Invalid JSON structure: ${currentSetting.settingTitle} must be an array ([...])`);
                    return;
                }
            } catch (error) {
                toast.error(`Invalid JSON syntax. Please check your format.`);
                return;
            }
        }

        setSaving(true);

        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(currentSetting)
            });

            if (res.ok) {
                await fetchSettings();
                setIsDialogOpen(false);
                setCurrentSetting({ settingTitle: '', content: '' });
                toast.success('Setting updated');
            } else {
                console.error("Failed to save setting");
                toast.error('Failed to update setting');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error updating setting');
        } finally {
            setSaving(false);
        }
    };

    const handleUploadCV = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // 1. Get signature
            const token = await user.getIdToken();
            const signParams = { folder: 'cv' };
            if (file.type === 'application/pdf') {
                signParams.format = 'pdf';
            }

            const signRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/media/signature`, {
                headers: { Authorization: `Bearer ${token}` },
                params: signParams
            });
            const { signature, timestamp, cloudName, apiKey } = signRes.data;

            // 2. Upload to Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', apiKey);
            formData.append('timestamp', timestamp);
            formData.append('signature', signature);
            formData.append('folder', 'cv');

            // Force PDF format if it's a PDF file (fixes Illustrator PDF saving as .ai sometimes)
            if (file.type === 'application/pdf') {
                formData.append('format', 'pdf');
            } else {
                formData.append('resource_type', 'auto');
            }

            const uploadRes = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, // Use auto/upload for mixed types
                formData
            );

            setCurrentSetting(prev => ({ ...prev, content: uploadRes.data.secure_url }));
            toast.success('CV uploaded successfully');
        } catch (error) {
            console.error(error);
            if (error.response?.data?.error?.message) {
                toast.error(`Upload failed: ${error.response.data.error.message}`);
            } else {
                toast.error('Failed to upload CV');
            }
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const openEdit = (setting) => {
        setCurrentSetting({ settingTitle: setting.settingTitle, content: setting.content || '' });
        setIsDialogOpen(true);
    };

    const toggleSection = (title) => {
        setOpenSections(prev =>
            prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
        );
    };

    if (loading) {
        return (
            <AdminLayout title="Site Settings">
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }

    // Helper to get settings for a group
    const getGroupSettings = (keys) => {
        return settings.filter(s => keys.includes(s.settingTitle));
    };

    // Helper to get orphan settings (not in any group)
    const getOrphanSettings = () => {
        const allKeyGroup = SETTINGS_GROUPS.flatMap(g => {
            // For grouped sections with subsections
            if (g.isGroup && g.subsections) {
                return g.subsections.flatMap(sub => sub.keys);
            }
            // For regular sections
            return g.keys || [];
        });
        return settings.filter(s => !allKeyGroup.includes(s.settingTitle));
    };

    const orphanSettings = getOrphanSettings();

    return (
        <AdminLayout title="Site Settings">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Configuration</h1>
                </div>

                <div className="space-y-4">
                    {SETTINGS_GROUPS.map((group) => {
                        // For grouped sections (like SEO)
                        if (group.isGroup && group.subsections) {
                            return (
                                <Collapsible
                                    key={group.title}
                                    open={openSections.includes(group.title)}
                                    onOpenChange={() => toggleSection(group.title)}
                                    className="bg-card rounded-md border"
                                >
                                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 font-medium hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-2">
                                            {openSections.includes(group.title) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                            {group.title}
                                        </div>
                                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                            {group.subsections.reduce((acc, sub) => acc + getGroupSettings(sub.keys).length, 0)}
                                        </span>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <div className="border-t p-4 space-y-4">
                                            {group.subsections.map((subsection) => {
                                                const subsectionSettings = getGroupSettings(subsection.keys);
                                                if (subsectionSettings.length === 0) return null;

                                                return (
                                                    <div key={subsection.title} className="border rounded-md">
                                                        <div className="bg-muted/30 px-4 py-2 font-medium text-sm">
                                                            {subsection.title}
                                                        </div>
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead className="w-[100px] md:w-[200px]">Key</TableHead>
                                                                    <TableHead>Content</TableHead>
                                                                    <TableHead className="w-[70px] md:w-[100px]">Actions</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {subsectionSettings.map((setting) => (
                                                                    <TableRow key={setting.id}>
                                                                        <TableCell className="font-medium align-top py-4 break-all">
                                                                            {formatSettingTitle(setting.settingTitle)}
                                                                            <div className="text-xs text-muted-foreground font-mono mt-1">{setting.settingTitle}</div>
                                                                        </TableCell>
                                                                        <TableCell className="align-top py-4">
                                                                            {setting.settingTitle === 'chat_api_key' ? (
                                                                                <div className="flex flex-col gap-2">
                                                                                    <div className="max-w-[120px] md:max-w-md line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground break-all font-mono bg-muted p-2 rounded">
                                                                                        {setting.content}
                                                                                    </div>
                                                                                    <div className="flex gap-2">
                                                                                        <button
                                                                                            onClick={async () => {
                                                                                                if (!user) {
                                                                                                    toast.error("User not authenticated.");
                                                                                                    return;
                                                                                                }
                                                                                                const key = 'sk-yunkhngn-' + Array.from(crypto.getRandomValues(new Uint8Array(16)))
                                                                                                    .map(b => b.toString(16).padStart(2, '0')).join('');

                                                                                                try {
                                                                                                    const token = await user.getIdToken();
                                                                                                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/chat_api_key`, {
                                                                                                        method: 'PATCH',
                                                                                                        headers: {
                                                                                                            'Content-Type': 'application/json',
                                                                                                            Authorization: `Bearer ${token}`
                                                                                                        },
                                                                                                        body: JSON.stringify({ content: key, settingTitle: 'chat_api_key' })
                                                                                                    });

                                                                                                    if (res.ok) {
                                                                                                        await fetchSettings();
                                                                                                        toast.success("New API Key generated and saved!");
                                                                                                        navigator.clipboard.writeText(key);
                                                                                                        toast.info("Key copied to clipboard");
                                                                                                    } else {
                                                                                                        console.error("Failed to generate and save key");
                                                                                                        toast.error("Failed to generate key");
                                                                                                    }
                                                                                                } catch (e) {
                                                                                                    console.error(e);
                                                                                                    toast.error("Failed to generate key");
                                                                                                }
                                                                                            }}
                                                                                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition-colors"
                                                                                        >
                                                                                            Generate New Key
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                navigator.clipboard.writeText(setting.content);
                                                                                                toast.success("Copied!");
                                                                                            }}
                                                                                            className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded hover:bg-muted/80"
                                                                                        >
                                                                                            Copy
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="max-w-[120px] md:max-w-md line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground break-all">
                                                                                    {setting.content}
                                                                                </div>
                                                                            )}
                                                                        </TableCell>
                                                                        <TableCell className="align-top py-4">
                                                                            <div className="flex items-center gap-1 md:gap-2">
                                                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(setting)}>
                                                                                    <Edit className="h-4 w-4" />
                                                                                </Button>
                                                                            </div>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            );
                        }

                        // Regular sections
                        const groupSettings = getGroupSettings(group.keys);
                        if (groupSettings.length === 0) return null;

                        return (
                            <Collapsible
                                key={group.title}
                                open={openSections.includes(group.title)}
                                onOpenChange={() => toggleSection(group.title)}
                                className="bg-card rounded-md border"
                            >
                                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 font-medium hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        {openSections.includes(group.title) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        {group.title}
                                    </div>
                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                        {groupSettings.length}
                                    </span>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="border-t">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[100px] md:w-[200px]">Key</TableHead>
                                                    <TableHead>Content</TableHead>
                                                    <TableHead className="w-[70px] md:w-[100px]">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {groupSettings.map((setting) => (
                                                    <TableRow key={setting.id}>
                                                        <TableCell className="font-medium align-top py-4 break-all">
                                                            {formatSettingTitle(setting.settingTitle)}
                                                            <div className="text-xs text-muted-foreground font-mono mt-1">{setting.settingTitle}</div>
                                                        </TableCell>
                                                        <TableCell className="align-top py-4">
                                                            <div className="max-w-[120px] md:max-w-md line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground break-all">
                                                                {setting.content}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="align-top py-4">
                                                            <div className="flex items-center gap-1 md:gap-2">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(setting)}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        );
                    })}

                    {/* Orphan Settings - Hidden */}
                    {/* {orphanSettings.length > 0 && (
                        <div className="bg-card rounded-md border mt-8">
                            <div className="p-4 font-medium border-b bg-muted/20">
                                Uncategorized
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px] md:w-[200px]">Key</TableHead>
                                        <TableHead>Content</TableHead>
                                        <TableHead className="w-[70px] md:w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orphanSettings.map((setting) => (
                                        <TableRow key={setting.id}>
                                            <TableCell className="font-medium align-top py-4 break-all">
                                                {formatSettingTitle(setting.settingTitle)}
                                                <div className="text-xs text-muted-foreground font-mono mt-1">{setting.settingTitle}</div>
                                            </TableCell>
                                            <TableCell className="align-top py-4">
                                                <div className="max-w-[120px] md:max-w-md line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground break-all">
                                                    {setting.content}
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-top py-4">
                                                <div className="flex items-center gap-1 md:gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(setting)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )} */}
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="w-[90vw] max-w-[90vw]">
                        <DialogHeader>
                            <DialogTitle>Edit Setting</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Setting Key (Title)</label>
                                <Input
                                    value={currentSetting.settingTitle}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>

                            {(currentSetting.settingTitle === 'cv_url' || currentSetting.settingTitle.endsWith('_image')) ? (
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <Input
                                                value={currentSetting.content}
                                                onChange={(e) => setCurrentSetting({ ...currentSetting, content: e.target.value })}
                                                placeholder="https://..."
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploading}
                                                className="whitespace-nowrap shrink-0"
                                            >
                                                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                                {currentSetting.settingTitle === 'cv_url' ? 'Upload CV' : 'Upload Image'}
                                            </Button>
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept={currentSetting.settingTitle === 'cv_url' ? '.pdf,.png,.jpg,.jpeg,.svg' : '.png,.jpg,.jpeg,.webp'}
                                            onChange={handleUploadCV}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {currentSetting.settingTitle === 'cv_url'
                                            ? 'Supported formats: PDF, PNG, JPG, SVG.'
                                            : 'Supported formats: PNG, JPG, JPEG, WebP. Recommended size: 1200x630px for SEO.'}
                                    </p>
                                    {currentSetting.content && (
                                        <div className="mt-2 text-sm break-all">
                                            <span className="text-muted-foreground">Current: </span>
                                            <a href={currentSetting.content} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline">
                                                {currentSetting.content}
                                            </a>
                                            {currentSetting.settingTitle === 'cv_url' && currentSetting.content.endsWith('.ai') && (
                                                <p className="text-yellow-500 text-xs mt-1">
                                                    Warning: .ai format detected. This may not display correctly in browsers. Please upload a PDF or Image.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (currentSetting.settingTitle.includes('api_key') || currentSetting.settingTitle.includes('api_secret') || currentSetting.settingTitle.includes('token') || currentSetting.settingTitle.includes('password')) ? (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        {formatSettingTitle(currentSetting.settingTitle)}
                                    </label>
                                    <Input
                                        type="password"
                                        value={currentSetting.content}
                                        onChange={(e) => setCurrentSetting({ ...currentSetting, content: e.target.value })}
                                        placeholder="Enter Secret Key"
                                        className="font-mono"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Value is encrypted in the database. Enter a new key to update.
                                    </p>
                                </div>
                            ) : ['cloudinary_cloud_name', 'resend_domain', 'admin_email', 'cloudflare_zone_id', 'cloudflare_account_id', 'github_username', 'github_repo_name'].includes(currentSetting.settingTitle) ? (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Value</label>
                                    <Input
                                        value={currentSetting.content}
                                        onChange={(e) => setCurrentSetting({ ...currentSetting, content: e.target.value })}
                                        placeholder="Enter value"
                                        className="font-mono"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Content</label>
                                    <Tabs defaultValue="code" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 mb-4">
                                            <TabsTrigger value="code">Code Editor (JSON)</TabsTrigger>
                                            <TabsTrigger value="text">Plain Text</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="code" className="mt-0">
                                            <div className="border rounded-md overflow-hidden">
                                                <Editor
                                                    height="600px"
                                                    defaultLanguage="json"
                                                    theme="vs-dark"
                                                    value={currentSetting.content}
                                                    onChange={(value) => setCurrentSetting({ ...currentSetting, content: value })}
                                                    options={{
                                                        minimap: { enabled: false },
                                                        fontSize: 14,
                                                        lineNumbers: 'on',
                                                        scrollBeyondLastLine: false,
                                                        automaticLayout: true,
                                                        tabSize: 2,
                                                        wordWrap: 'on'
                                                    }}
                                                />
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="text" className="mt-0">
                                            <Textarea
                                                value={currentSetting.content}
                                                onChange={(e) => setCurrentSetting({ ...currentSetting, content: e.target.value })}
                                                placeholder="Enter plain text content..."
                                                className="min-h-[600px] font-mono"
                                            />
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            )}

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout >
    );
}
