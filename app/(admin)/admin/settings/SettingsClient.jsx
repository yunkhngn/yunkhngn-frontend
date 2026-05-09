'use client';

import { readNestJson } from '@/lib/api/readJson';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Loader2,
    Edit,
    X,
    UploadCloud,
    ChevronDown,
    ChevronRight,
    Plus,
    Trash2,
    Settings2,
    Search,
    ShieldCheck,
    GripVertical,
    Type,
    Code,
    FileText,
    Braces
} from 'lucide-react';
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
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { Checkbox } from "@/components/ui/Checkbox";

import { cn } from "@/lib/utils";

const isJsonString = (str) => {
    if (!str) return false;
    try {
        const parsed = JSON.parse(str);
        return (typeof parsed === 'object' && parsed !== null);
    } catch (e) {
        return false;
    }
};

const formatSettingTitle = (title) => {
    return title
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const SortableSettingRow = ({ setting, children }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: setting.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <TableRow ref={setNodeRef} style={style} className={cn(isDragging && "bg-muted/50")}>
            <TableCell className="w-[40px] pl-4">
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted transition-colors">
                    <GripVertical className="h-4 w-4 text-muted-foreground/30" />
                </div>
            </TableCell>
            {children}
        </TableRow>
    );
};

const SortableGroupItem = ({ id, children }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    };

    return (
        <div ref={setNodeRef} style={style} className={cn("relative group/item", isDragging && "z-50")}>
            <div {...attributes} {...listeners} className="absolute left-[-28px] top-4 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted opacity-0 group-hover/item:opacity-100 transition-opacity">
                <GripVertical className="h-4 w-4 text-muted-foreground/30" />
            </div>
            {children}
        </div>
    );
};

export default function Settings() {
    const { user } = useAuth();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [currentSetting, setCurrentSetting] = useState({ id: null, settingTitle: '', content: '', group: '' });
    const [newSetting, setNewSetting] = useState({ settingTitle: '', content: '', group: 'General' });
    const [saving, setSaving] = useState(false);
    const [isRenameGroupDialogOpen, setIsRenameGroupDialogOpen] = useState(false);
    const [renameGroupData, setRenameGroupData] = useState({ oldName: '', newName: '' });
    const [uploading, setUploading] = useState(false);
    const [closedSections, setClosedSections] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteId, setDeleteId] = useState(null);
    const [isJsonMode, setIsJsonMode] = useState(false);
    const fileInputRef = useRef(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const onDragEndSettings = async (event, groupName) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const groupIndex = groups.findIndex(g => g.group === groupName);
        const group = groups[groupIndex];
        const oldIndex = group.settings.findIndex(s => s.id === active.id);
        const newIndex = group.settings.findIndex(s => s.id === over.id);

        const newSettings = arrayMove(group.settings, oldIndex, newIndex);
        const newGroups = [...groups];
        newGroups[groupIndex] = { ...group, settings: newSettings };
        setGroups(newGroups);

        try {
            const token = await user.getIdToken();
            const groupBaseOrder = groupIndex * 1000;
            await Promise.all(newSettings.map((s, i) =>
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ id: s.id, settingTitle: s.settingTitle, sortOrder: groupBaseOrder + i })
                })
            ));
            toast.success('Setting order updated');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update order');
            fetchSettings();
        }
    };

    const onDragEndGroups = async (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = groups.findIndex(g => g.group === active.id);
        const newIndex = groups.findIndex(g => g.group === over.id);

        const newGroups = arrayMove(groups, oldIndex, newIndex);
        setGroups(newGroups);

        try {
            const token = await user.getIdToken();
            await Promise.all(newGroups.flatMap((g, gIdx) =>
                g.settings.map((s, sIdx) =>
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ id: s.id, settingTitle: s.settingTitle, sortOrder: gIdx * 1000 + sIdx })
                    })
                )
            ));
            toast.success('Group order updated');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update group order');
            fetchSettings();
        }
    };

    const fetchSettings = useCallback(async () => {
        try {
            const token = await user?.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/admin/grouped`, {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            });
            if (res.ok) {
                const data = await readNestJson(res);
                setGroups(data);
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchSettings();
        }
    }, [user, fetchSettings]);

    // Load/Save state from local storage
    useEffect(() => {
        const saved = localStorage.getItem('settings_closed_sections');
        if (saved) {
            try {
                setClosedSections(JSON.parse(saved));
            } catch (e) { }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('settings_closed_sections', JSON.stringify(closedSections));
        }
    }, [closedSections, isLoaded]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!user) return;

        // JSON Validation
        const jsonFields = ['education', 'experience', 'skills', 'projects'];
        if (jsonFields.includes(currentSetting.settingTitle)) {
            try {
                JSON.parse(currentSetting.content);
            } catch (error) {
                toast.error(`Invalid JSON syntax.`);
                return;
            }
        }

        setSaving(true);
        try {
            const token = await user.getIdToken();
            const payload = {
                id: currentSetting.id,
                settingTitle: currentSetting.settingTitle,
                content: currentSetting.content,
                group: currentSetting.group,
                isSensitive: currentSetting.isSensitive ?? false,
            };
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await fetchSettings();
                setIsDialogOpen(false);
                toast.success('Setting updated');
            } else {
                toast.error('Failed to update setting');
            }
        } catch (error) {
            toast.error('Error updating setting');
        } finally {
            setSaving(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newSetting)
            });

            if (res.ok) {
                await fetchSettings();
                setIsCreateDialogOpen(false);
                setNewSetting({ settingTitle: '', content: '', group: 'General', isSensitive: false });
                toast.success('New setting created');
            } else {
                const errorData = await res.json();
                toast.error(errorData.message || 'Failed to create setting');
            }
        } catch (error) {
            toast.error('Error creating setting');
        } finally {
            setSaving(false);
        }
    };

    const handleRenameGroup = async () => {
        const { oldName, newName } = renameGroupData;
        if (!user || !newName || oldName === newName) {
            setIsRenameGroupDialogOpen(false);
            return;
        }
        
        const groupObj = groups.find(g => g.group === oldName);
        if (!groupObj) return;
        
        setSaving(true);
        try {
            const token = await user.getIdToken();
            await Promise.all(groupObj.settings.map(s => 
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ id: s.id, settingTitle: s.settingTitle, group: newName })
                })
            ));
            await fetchSettings();
            toast.success('Group renamed');
            setIsRenameGroupDialogOpen(false);
        } catch (error) {
            toast.error('Error renaming group');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId || !user) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/${deleteId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                await fetchSettings();
                toast.success('Setting deleted');
            } else {
                toast.error('Failed to delete setting');
            }
        } catch (error) {
            toast.error('Error deleting setting');
        } finally {
            setDeleteId(null);
        }
    };

    const handleUploadCV = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const token = await user.getIdToken();
            const isCV = currentSetting.settingTitle === 'cv_url';
            const folder = isCV ? 'cv' : 'appearance';

            const signRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/media/signature`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { folder }
            });
            const { signature, timestamp, cloudName, apiKey } = signRes.data;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', apiKey);
            formData.append('timestamp', timestamp);
            formData.append('signature', signature);
            formData.append('folder', folder);

            const uploadRes = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
                formData
            );

            setCurrentSetting(prev => ({ ...prev, content: uploadRes.data.secure_url }));
            toast.success('Upload successful');
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const toggleSection = (title) => {
        setClosedSections(prev =>
            prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
        );
    };

    const filteredGroups = groups.map(g => ({
        ...g,
        settings: g.settings.filter(s =>
            s.settingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.content && s.content.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    })).filter(g => g.settings.length > 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="System Configuration"
                description="Manage global site settings and API integrations"
                icon={Settings2}
            >
                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <Input
                            placeholder="Search settings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-[200px] md:w-[300px] bg-card/50 border-none shadow-sm"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                    </div>
                    <Button onClick={() => {
                        setIsJsonMode(false);
                        setIsCreateDialogOpen(true);
                    }} className="gap-2">
                        <Plus className="h-4 w-4" />
                        <span className="hidden md:inline">New Setting</span>
                    </Button>
                </div>
            </AdminPageHeader>

            <div className="space-y-4">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={onDragEndGroups}
                >
                    <SortableContext
                        items={filteredGroups.map(g => g.group)}
                        strategy={verticalListSortingStrategy}
                    >
                        {filteredGroups.map(({ group, settings: groupSettings }) => (
                            <SortableGroupItem key={group} id={group}>
                                <Collapsible
                                    open={!closedSections.includes(group)}
                                    onOpenChange={() => toggleSection(group)}
                                    className="bg-card/50 backdrop-blur-sm rounded-xl border-none shadow-sm overflow-hidden group"
                                >
                                    <CollapsibleTrigger asChild>
                                        <div className="flex items-center justify-between w-full p-4 font-semibold hover:bg-primary/5 transition-colors group cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="p-1 rounded-md bg-primary/10 text-primary transition-transform duration-200 group-data-[state=open]:rotate-90">
                                                    <ChevronRight className="h-4 w-4" />
                                                </div>
                                                <span className="tracking-tight">{group}</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                                                    {groupSettings.length} keys
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-md hover:bg-primary/10"
                                                    onClick={() => {
                                                        setRenameGroupData({ oldName: group, newName: group });
                                                        setIsRenameGroupDialogOpen(true);
                                                    }}
                                                    title="Rename Group"
                                                >
                                                    <Type className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <div className="border-t border-border/50">
                                            <DndContext
                                                sensors={sensors}
                                                collisionDetection={closestCenter}
                                                onDragEnd={(event) => onDragEndSettings(event, group)}
                                            >
                                                <Table>
                                                    <TableHeader className="bg-muted/30">
                                                        <TableRow>
                                                            <TableHead className="w-[40px]"></TableHead>
                                                            <TableHead className="w-[100px] md:w-[200px] text-[10px] font-black uppercase tracking-widest pl-2">Key</TableHead>
                                                            <TableHead className="text-[10px] font-black uppercase tracking-widest">Content</TableHead>
                                                            <TableHead className="w-[100px] text-right pr-6 text-[10px] font-black uppercase tracking-widest">Actions</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        <SortableContext
                                                            items={groupSettings.map(s => s.id)}
                                                            strategy={verticalListSortingStrategy}
                                                        >
                                                            {groupSettings.map((setting) => (
                                                                <SortableSettingRow key={setting.id} setting={setting}>
                                                                    <TableCell className="font-medium align-top py-4 pl-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="text-sm font-bold tracking-tight">
                                                                                {formatSettingTitle(setting.settingTitle)}
                                                                            </div>
                                                                            {setting.isSensitive && (
                                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-widest">
                                                                                    <ShieldCheck className="h-3 w-3" />
                                                                                    Secret
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-[10px] font-mono text-muted-foreground mt-1 opacity-60">
                                                                            {setting.settingTitle}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="align-top py-4">
                                                                        <div className="max-w-[120px] md:max-w-md line-clamp-2 text-sm text-muted-foreground/80 break-all font-medium leading-relaxed">
                                                                            {setting.content}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="align-top py-4 pr-6">
                                                                        <div className="flex items-center justify-end gap-1">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                                                                                onClick={() => {
                                                                                    setCurrentSetting(setting);
                                                                                    setIsJsonMode(isJsonString(setting.content));
                                                                                    setIsDialogOpen(true);
                                                                                }}
                                                                            >
                                                                                <Edit className="h-4 w-4" />
                                                                            </Button>
                                                                            {!setting.isSystem && (
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-8 w-8 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                                                                                    onClick={() => setDeleteId(setting.id)}
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    </TableCell>
                                                                </SortableSettingRow>
                                                            ))}
                                                        </SortableContext>
                                                    </TableBody>
                                                </Table>
                                            </DndContext>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            </SortableGroupItem>
                        ))}
                    </SortableContext>
                </DndContext>

                {filteredGroups.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-card/30 rounded-2xl border-2 border-dashed border-border/50">
                        <div className="p-4 rounded-full bg-muted/50 mb-4">
                            <Search className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-bold tracking-tight">No settings found</h3>
                        <p className="text-sm text-muted-foreground mt-1">Try adjusting your search query</p>
                    </div>
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl bg-card border-none shadow-2xl p-0 overflow-hidden rounded-2xl">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-2xl font-bold tracking-tight">Edit Setting</DialogTitle>
                    </DialogHeader>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Title</label>
                                <Input
                                    value={currentSetting.settingTitle}
                                    onChange={(e) => setCurrentSetting({ ...currentSetting, settingTitle: e.target.value })}
                                    className="font-bold"
                                    disabled={currentSetting.isSystem}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Group</label>
                                <Input
                                    value={currentSetting.group}
                                    onChange={(e) => setCurrentSetting({ ...currentSetting, group: e.target.value })}
                                    className="font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Content</label>
                                <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-lg border border-border/50">
                                    <Button
                                        variant={!isJsonMode ? "secondary" : "ghost"}
                                        size="sm"
                                        className="h-6 px-2 text-[10px] font-bold gap-1.5"
                                        onClick={() => setIsJsonMode(false)}
                                    >
                                        <FileText className="h-3 w-3" />
                                        Text
                                    </Button>
                                    <Button
                                        variant={isJsonMode ? "secondary" : "ghost"}
                                        size="sm"
                                        className="h-6 px-2 text-[10px] font-bold gap-1.5"
                                        onClick={() => setIsJsonMode(true)}
                                    >
                                        <Braces className="h-3 w-3" />
                                        JSON
                                    </Button>
                                </div>
                            </div>
                            
                            {isJsonMode ? (
                                <div className="border border-border/50 rounded-xl overflow-hidden shadow-inner bg-[#1e1e1e]">
                                    <Editor
                                        height="300px"
                                        defaultLanguage="json"
                                        theme="vs-dark"
                                        value={currentSetting.content}
                                        onChange={(v) => setCurrentSetting({ ...currentSetting, content: v })}
                                        options={{ 
                                            minimap: { enabled: false }, 
                                            fontSize: 13, 
                                            padding: { top: 16 },
                                            scrollBeyondLastLine: false,
                                            lineNumbers: 'on',
                                            roundedSelection: true,
                                            contextmenu: false
                                        }}
                                    />
                                </div>
                            ) : (
                                <Textarea
                                    value={currentSetting.content}
                                    onChange={(e) => setCurrentSetting({ ...currentSetting, content: e.target.value })}
                                    className="min-h-[200px] bg-muted/30 border-none font-medium leading-relaxed resize-none focus-visible:ring-1 focus-visible:ring-primary/30"
                                />
                            )}
                        </div>

                        <div className="flex items-center gap-3 px-1">
                            <Checkbox
                                id="edit-sensitive"
                                checked={currentSetting.isSensitive ?? false}
                                onCheckedChange={(checked) => setCurrentSetting({ ...currentSetting, isSensitive: !!checked })}
                            />
                            <label htmlFor="edit-sensitive" className="text-sm font-medium leading-none cursor-pointer select-none flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-amber-500" />
                                Sensitive (encrypt &amp; mask value)
                            </label>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="font-bold">Cancel</Button>
                            <Button onClick={handleSave} disabled={saving} className="font-bold px-8">
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Setting
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-md bg-card border-none shadow-2xl p-6 rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold tracking-tight">New Setting</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-5 mt-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Setting Key</label>
                            <Input
                                placeholder="e.g., site_banner_text"
                                value={newSetting.settingTitle}
                                onChange={(e) => setNewSetting({ ...newSetting, settingTitle: e.target.value })}
                                className="font-bold"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Group</label>
                            <div className="flex gap-2">
                                <Select
                                    value={newSetting.group}
                                    onValueChange={(v) => setNewSetting({ ...newSetting, group: v })}
                                >
                                    <SelectTrigger className="w-full font-bold">
                                        <SelectValue placeholder="Select group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {groups.map(g => <SelectItem key={g.group} value={g.group}>{g.group}</SelectItem>)}
                                        <SelectItem value="NEW_GROUP_HIDDEN">New Group...</SelectItem>
                                    </SelectContent>
                                </Select>
                                {newSetting.group === 'NEW_GROUP_HIDDEN' && (
                                    <Input
                                        placeholder="Group name"
                                        onChange={(e) => setNewSetting({ ...newSetting, group: e.target.value })}
                                        className="font-bold"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Initial Content</label>
                                <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-lg border border-border/50">
                                    <Button
                                        type="button"
                                        variant={!isJsonMode ? "secondary" : "ghost"}
                                        size="sm"
                                        className="h-6 px-2 text-[10px] font-bold gap-1.5"
                                        onClick={() => setIsJsonMode(false)}
                                    >
                                        <FileText className="h-3 w-3" />
                                        Text
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={isJsonMode ? "secondary" : "ghost"}
                                        size="sm"
                                        className="h-6 px-2 text-[10px] font-bold gap-1.5"
                                        onClick={() => setIsJsonMode(true)}
                                    >
                                        <Braces className="h-3 w-3" />
                                        JSON
                                    </Button>
                                </div>
                            </div>
                            
                            {isJsonMode ? (
                                <div className="border border-border/50 rounded-xl overflow-hidden shadow-inner bg-[#1e1e1e]">
                                    <Editor
                                        height="200px"
                                        defaultLanguage="json"
                                        theme="vs-dark"
                                        value={newSetting.content}
                                        onChange={(v) => setNewSetting({ ...newSetting, content: v })}
                                        options={{ 
                                            minimap: { enabled: false }, 
                                            fontSize: 13, 
                                            padding: { top: 16 },
                                            scrollBeyondLastLine: false,
                                            lineNumbers: 'off'
                                        }}
                                    />
                                </div>
                            ) : (
                                <Textarea
                                    value={newSetting.content}
                                    onChange={(e) => setNewSetting({ ...newSetting, content: e.target.value })}
                                    className="min-h-[100px] bg-muted/30 border-none font-medium leading-relaxed resize-none focus-visible:ring-1 focus-visible:ring-primary/30"
                                />
                            )}
                        </div>
                        <div className="flex items-center gap-3 px-1">
                            <Checkbox
                                id="create-sensitive"
                                checked={newSetting.isSensitive ?? false}
                                onCheckedChange={(checked) => setNewSetting({ ...newSetting, isSensitive: !!checked })}
                            />
                            <label htmlFor="create-sensitive" className="text-sm font-medium leading-none cursor-pointer select-none flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-amber-500" />
                                Sensitive (encrypt & mask value)
                            </label>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setIsCreateDialogOpen(false)} className="font-bold">Cancel</Button>
                            <Button type="submit" disabled={saving} className="font-bold px-8">
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Setting?"
                description="This will permanently remove this configuration entry. This may break parts of the site that rely on this key."
            />

            {/* Rename Group Dialog */}
            <Dialog open={isRenameGroupDialogOpen} onOpenChange={setIsRenameGroupDialogOpen}>
                <DialogContent className="max-w-md bg-card border-none shadow-2xl p-6 rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold tracking-tight">Rename Group</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">New Group Name</label>
                            <Input
                                value={renameGroupData.newName}
                                onChange={(e) => setRenameGroupData({ ...renameGroupData, newName: e.target.value })}
                                className="font-bold"
                                placeholder="Enter new group name..."
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="ghost" onClick={() => setIsRenameGroupDialogOpen(false)} className="font-bold">Cancel</Button>
                            <Button onClick={handleRenameGroup} disabled={saving} className="font-bold px-6">
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Rename All
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Missing Select components in original file, adding them here if not imported
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select";
