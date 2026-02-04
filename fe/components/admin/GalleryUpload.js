import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api/client';
import { toast } from 'sonner';

export default function GalleryUpload({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [altText, setAltText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);

    try {
      // 1. Get signature from backend
      const { data: { signature, timestamp, cloudName, apiKey } } = await api.post('/gallery/upload-signature');

      // 2. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      // Optional: Add folder or other params if configured in backend signature generation
      
      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const cloudinaryData = await cloudinaryRes.json();
      
      if (!cloudinaryRes.ok) {
        throw new Error(cloudinaryData.error?.message || 'Upload failed');
      }

      // 3. Save to backend
      await api.post('/gallery', {
        url: cloudinaryData.secure_url,
        publicId: cloudinaryData.public_id,
        altText,
      });

      toast.success('Image uploaded successfully');
      setFile(null);
      setAltText('');
      // Reset file input
      document.getElementById('file-upload').value = '';
      onSuccess();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-md">
      <h3 className="font-medium">Upload New Image</h3>
      <div className="grid gap-2">
        <Label htmlFor="file-upload">Image File</Label>
        <Input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="altText">Alt Text (Optional)</Label>
        <Input id="altText" value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Description of the image" />
      </div>
      <Button type="submit" disabled={loading || !file}>
        {loading ? 'Uploading...' : 'Upload'}
      </Button>
    </form>
  );
}
