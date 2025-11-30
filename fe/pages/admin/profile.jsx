import AdminLayout from "@/components/template/Admin/Layout";
import UserManagement from "@/components/template/Admin/UserManagement";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { updatePassword } from 'firebase/auth';
import { Loader2, Upload, Save } from 'lucide-react';

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

  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setAvatarUrl(user.avatarUrl || user.photoURL || '');
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
      const sigRes = await fetch('http://localhost:3001/gallery/signature', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!sigRes.ok) throw new Error('Failed to get upload signature');
      const { signature, timestamp } = await sigRes.json();

      // 2. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', 'blog-portfolio/gallery');

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
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
      const res = await fetch('http://localhost:3001/user/me', {
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
          <UserManagement />
        </div>
      </div>
    </AdminLayout>
  );
}