import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api/client';
import { toast } from 'sonner';

export default function ProjectForm({ project, onSuccess }) {
  const [title, setTitle] = useState(project?.title || '');
  const [description, setDescription] = useState(project?.description || '');
  const [link, setLink] = useState(project?.link || '');
  const [techStack, setTechStack] = useState(project?.techStack ? JSON.parse(project.techStack).join(', ') : '');
  const [images, setImages] = useState(project?.images ? JSON.parse(project.images).join(', ') : '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description || '');
      setLink(project.link || '');
      setTechStack(project.techStack ? JSON.parse(project.techStack).join(', ') : '');
      setImages(project.images ? JSON.parse(project.images).join(', ') : '');
    }
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const techStackArray = techStack.split(',').map(t => t.trim()).filter(t => t !== '');
    const imagesArray = images.split(',').map(i => i.trim()).filter(i => i !== '');

    const data = {
      title,
      description,
      link,
      techStack: JSON.stringify(techStackArray),
      images: JSON.stringify(imagesArray),
    };

    try {
      if (project) {
        await api.patch(`/projects/${project.id}`, data);
        toast.success('Project updated successfully');
      } else {
        await api.post('/projects', data);
        toast.success('Project created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
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
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="link">Project Link</Label>
        <Input id="link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="techStack">Tech Stack (comma separated)</Label>
        <Input id="techStack" value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="React, Node.js, MongoDB" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="images">Image URLs (comma separated)</Label>
        <Textarea id="images" value={images} onChange={(e) => setImages(e.target.value)} placeholder="https://..., https://..." />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
      </Button>
    </form>
  );
}
