import AdminLayout from "@/components/template/Admin/Layout";
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Loader2, Plus, Trash2, Edit, X } from 'lucide-react';
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

export default function Settings() {
    const { user } = useAuth();
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentSetting, setCurrentSetting] = useState({ settingTitle: '', content: '' });
    const [saving, setSaving] = useState(false);

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
            } else {
                console.error("Failed to save setting");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this setting?")) return;
        if (!user) return;

        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.ok) {
                setSettings(settings.filter(s => s.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete setting", error);
        }
    };

    const openEdit = (setting) => {
        setCurrentSetting({ settingTitle: setting.settingTitle, content: setting.content || '' });
        setIsDialogOpen(true);
    };

    const openNew = () => {
        setCurrentSetting({ settingTitle: '', content: '' });
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
                    <Button onClick={openNew}>
                        <Plus className="mr-2 h-4 w-4" /> Add Setting
                    </Button>
                </div>

                <div className="bg-card rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Key (Title)</TableHead>
                                <TableHead>Content</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
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
                                        <TableCell className="font-medium">{setting.settingTitle}</TableCell>
                                        <TableCell className="max-w-md truncate" title={setting.content}>
                                            {setting.content}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(setting)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(setting.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>{currentSetting.id ? 'Edit Setting' : 'Add New Setting'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Setting Key (Title)</label>
                                <Input
                                    value={currentSetting.settingTitle}
                                    onChange={(e) => setCurrentSetting({ ...currentSetting, settingTitle: e.target.value })}
                                    placeholder="e.g., site_title, contact_email"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Content</label>
                                <Textarea
                                    value={currentSetting.content}
                                    onChange={(e) => setCurrentSetting({ ...currentSetting, content: e.target.value })}
                                    placeholder="Value..."
                                    rows={10}
                                />
                            </div>
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
