import AdminLayout from "@/components/template/Admin/Layout";
import { readNestJson } from '@/lib/api/readJson';
import AdminManagement from "@/components/template/Admin/UserManagement";
import ServiceStatus from "@/components/template/Admin/ServiceStatus";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { updatePassword } from 'firebase/auth';
import { Loader2, Upload, Save, Terminal, CheckCircle2, X } from 'lucide-react';
import { Badge } from "@/components/ui/Badge";
import { formatDistanceToNow } from "date-fns";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const isPasswordUser = user?.providerData?.some((p) => p.providerId === 'password');
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  const [deployments, setDeployments] = useState([]);

  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setAvatarUrl(user.avatarUrl || user.photoURL || '');

      const fetchDeployments = async () => {
        try {
          const token = await user.getIdToken();
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/github/deployments`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await readNestJson(res);
            setDeployments(data);
          }
        } catch (error) {
          console.error('Failed to fetch deployments', error);
        }
      };
      fetchDeployments();
    }
  }, [user]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // 1. Get signature
      const token = await user.getIdToken();
      const sigRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery/signature`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!sigRes.ok) throw new Error('Failed to get upload signature');
      const { signature, timestamp, cloudName, apiKey } = await readNestJson(sigRes);

      // 2. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', 'blog-portfolio/gallery');

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error?.message || 'Upload failed');
      }

      const data = await uploadRes.json();
      setAvatarUrl(data.secure_url);
      setMessage({ type: 'success', text: 'Image uploaded successfully. Click Save to apply changes.' });

    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to upload image: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = await user.getIdToken();

      // Update Profile (Name & Avatar)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, avatarUrl })
      });

      if (!res.ok) throw new Error('Failed to update profile');

      // Update Password if provided
      if (newPassword && isPasswordUser) {
        if (newPassword !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await updatePassword(user, newPassword);
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');

      // Force reload or update context? 
      // Context should update on next fetch or we can manually update user object if needed.
      // For now, let's just show success.

    } catch (error) {
      console.error(error);
      if (error.code === 'auth/requires-recent-login') {
        setMessage({ type: 'error', text: 'Please log out and log back in to change your password.' });
      } else {
        setMessage({ type: 'error', text: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <AdminLayout title="Profile"><div>Loading...</div></AdminLayout>;

  return (
    <AdminLayout title="Profile">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

        <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              {name && <h2 className="text-xl font-semibold">{name}</h2>}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Change Avatar
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Name Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
              />
            </div>

            {/* Password Section */}
            {isPasswordUser && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Change Password</h3>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">New Password</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Confirm Password</label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Message & Submit */}
            {message.text && (
              <div className={`p-3 rounded-md text-sm ${message.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                {message.text}
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-card text-card-foreground rounded-xl border shadow-sm p-6">
          <ServiceStatus />
        </div>

        {/* Deployment Status */}
        <div className="mt-8 bg-card text-card-foreground rounded-xl border shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Recent Deployments (GitHub Actions)</h2>
          </div>
          <div className="space-y-4">
            {deployments.map((run) => (
              <div key={run.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${run.conclusion === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {run.conclusion === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{run.display_title || run.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>#{run.run_number}</span>
                      <span>•</span>
                      <span>{run.actor?.login}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(run.updated_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={run.status === 'completed' ? 'outline' : 'secondary'}>
                    {run.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.floor(run.duration / 1000)}s
                  </p>
                </div>
              </div>
            ))}
            {deployments.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                No recent deployments found.
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-card text-card-foreground rounded-xl border shadow-sm p-6">
          <AdminManagement />
        </div>
      </div>
    </AdminLayout>
  );
}