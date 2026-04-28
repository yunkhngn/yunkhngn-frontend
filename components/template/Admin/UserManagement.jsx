import { useState, useEffect, useCallback } from 'react';
import { readNestJson } from '@/lib/api/readJson';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Loader2, Plus, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { toast } from 'sonner';

export default function AdminManagement() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ email: '', name: '', password: '', role: 'ADMIN' });
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await readNestJson(res);
            // Filter only admins
            setUsers(data.filter(u => u.role === 'ADMIN'));
        } catch (err) {
            console.error(err);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) fetchUsers();
    }, [user, fetchUsers]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setError('');

        try {
            const token = await user.getIdToken();
            const url = editingUser
                ? `${process.env.NEXT_PUBLIC_API_URL}/user/${editingUser.uid}`
                : `${process.env.NEXT_PUBLIC_API_URL}/user`;

            const method = editingUser ? 'PATCH' : 'POST';

            const body = { ...formData };
            if (!body.password) delete body.password; // Don't send empty password on edit

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const errData = await readNestJson(res);
                throw new Error(errData.message || 'Operation failed');
            }

            setDialogOpen(false);
            fetchUsers();
            resetForm();
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = (uid) => {
        setDeleteId(uid);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${deleteId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to delete user');

            fetchUsers();
            toast.success('User deleted');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete user: ' + err.message);
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteId(null);
        }
    };

    const openEdit = (user) => {
        setEditingUser(user);
        setFormData({
            email: user.email,
            name: user.name || '',
            password: '',
            role: user.role || 'ADMIN'
        });
        setDialogOpen(true);
    };

    const resetForm = () => {
        setEditingUser(null);
        setFormData({ email: '', name: '', password: '', role: 'ADMIN' });
        setError('');
    };

    if (loading) return <div>Loading users...</div>;

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-semibold">Admin Management</h2>
                <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Admin
                </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
                {/* Desktop Table */}
                <table className="hidden sm:table w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">Email</th>
                            <th className="px-4 py-3 font-medium">Role</th>
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {users.map((u) => (
                            <tr key={u.uid} className="hover:bg-muted/50 transition-colors">
                                <td className="px-4 py-3 font-medium">{u.name || 'N/A'}</td>
                                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon-sm">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openEdit(u)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => handleDelete(u.uid)}
                                                disabled={u.uid === user.uid}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                    No admins found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Mobile Card View */}
                <div className="sm:hidden divide-y">
                    {users.map((u) => (
                        <div key={u.uid} className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-medium">{u.name || 'N/A'}</div>
                                    <div className="text-sm text-muted-foreground break-all">{u.email}</div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon-sm" className="-mr-2">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => openEdit(u)}>
                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => handleDelete(u.uid)}
                                            disabled={u.uid === user.uid}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                    {u.role}
                                </span>
                            </div>
                        </div>
                    ))}
                    {users.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            No admins found.
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Edit Admin' : 'Add New Admin'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                disabled={!!editingUser} // Cannot change email for now as it's the ID in some sense, or at least complex in Firebase
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Display Name</label>
                            <Input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {editingUser ? 'New Password (leave blank to keep)' : 'Password'}
                            </label>
                            <Input
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required={!editingUser}
                                minLength={6}
                            />
                        </div>

                        {error && <p className="text-sm text-destructive">{error}</p>}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={actionLoading}>
                                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingUser ? 'Save Changes' : 'Create Admin'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Admin"
                description="Are you sure you want to delete this admin? This action cannot be undone."
            />
        </div>
    );
}
