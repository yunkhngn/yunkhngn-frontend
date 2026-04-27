import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import TipTapEditor from '@/components/shared/TipTapEditor';
import api from '@/lib/api/client';
import { toast } from 'sonner';

export default function BlogForm({ blog, onSuccess }) {
  const [title, setTitle] = useState(blog?.title || '');
  const [slug, setSlug] = useState(blog?.slug || '');
  const [excerpt, setExcerpt] = useState(blog?.excerpt || '');
  const [thumbnail, setThumbnail] = useState(blog?.thumbnail || '');
  const [tags, setTags] = useState(blog?.tags ? JSON.parse(blog.tags).join(', ') : '');
  const [contentJSON, setContentJSON] = useState(blog?.contentJSON ? JSON.parse(blog.contentJSON) : {});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (blog) {
      setTitle(blog.title);
      setSlug(blog.slug);
      setExcerpt(blog.excerpt || '');
      setThumbnail(blog.thumbnail || '');
      setTags(blog.tags ? JSON.parse(blog.tags).join(', ') : '');
      setContentJSON(blog.contentJSON ? JSON.parse(blog.contentJSON) : {});
    }
  }, [blog]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    const data = {
      title,
      slug,
      excerpt,
      thumbnail,
      tags: JSON.stringify(tagsArray),
      contentJSON: JSON.stringify(contentJSON),
    };

    try {
      if (blog) {
        await api.patch(`/blogs/${blog.id}`, data);
        toast.success('Blog updated successfully');
      } else {
        await api.post('/blogs', data);
        toast.success('Blog created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error('Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="thumbnail">Thumbnail URL</Label>
        <Input id="thumbnail" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="React, Next.js, Tutorial" />
      </div>
      <div className="grid gap-2">
        <Label>Content</Label>
        <TipTapEditor content={contentJSON} onChange={setContentJSON} />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : (blog ? 'Update Post' : 'Create Post')}
      </Button>
    </form>
  );
}
