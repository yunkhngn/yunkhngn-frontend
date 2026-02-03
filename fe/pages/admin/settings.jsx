import AdminLayout from "@/components/template/Admin/Layout";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Loader2, Edit, X, UploadCloud } from 'lucide-react';
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
    DialogTrigger,
} from "@/components/ui/Dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/Tabs";

export default function Settings() {
    const { user } = useAuth();
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentSetting, setCurrentSetting] = useState({ settingTitle: '', content: '' });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
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
            const { signature, timestamp } = signRes.data;

            // 2. Upload to Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
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
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`, // Use auto/upload for mixed types
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

    if (loading) {
        return (
            <AdminLayout title="Site Settings">
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Site Settings">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Configuration</h1>
                </div>

                <div className="bg-card rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px] md:w-[200px]">Key (Title)</TableHead>
                                <TableHead>Content</TableHead>
                                <TableHead className="w-[70px] md:w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {settings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                        No settings found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                settings.map((setting) => (
                                    <TableRow key={setting.id}>
                                        <TableCell className="font-medium align-top py-4 break-all">{setting.settingTitle}</TableCell>
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
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="w-[95vw] max-w-3xl">
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

                            {currentSetting.settingTitle === 'cv_url' ? (
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
                                                Upload CV
                                            </Button>
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept=".pdf,.png,.jpg,.jpeg,.svg"
                                            onChange={handleUploadCV}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Supported formats: PDF, PNG, JPG, SVG.
                                    </p>
                                    {currentSetting.content && (
                                        <div className="mt-2 text-sm break-all">
                                            <span className="text-muted-foreground">Current: </span>
                                            <a href={currentSetting.content} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline">
                                                {currentSetting.content}
                                            </a>
                                            {currentSetting.content.endsWith('.ai') && (
                                                <p className="text-yellow-500 text-xs mt-1">
                                                    Warning: .ai format detected. This may not display correctly in browsers. Please upload a PDF or Image.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : currentSetting.settingTitle === 'gemini_api_key' ? (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">API Key</label>
                                    <Input
                                        type="password"
                                        value={currentSetting.content}
                                        onChange={(e) => setCurrentSetting({ ...currentSetting, content: e.target.value })}
                                        placeholder="Enter Gemini API Key"
                                        className="font-mono"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Value is encrypted in the database. Enter a new key to update.
                                    </p>
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
                                                    height="400px"
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
                                                className="min-h-[400px] font-mono"
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
        </AdminLayout>
    );
}
