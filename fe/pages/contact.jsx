import { useState } from 'react';
import Layout from '@/components/template/Default/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from 'sonner';
import { Mail, User, MessageSquare } from 'lucide-react';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            toast.error('Please fill in all fields');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Failed to send message');

            toast.success('Message sent successfully! I\'ll get back to you soon.');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error(error);
            toast.error('Failed to send message. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-16">
            <div className="mb-12 text-center">
                <div className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase mb-4">
                    Get In Touch
                </div>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground" style={{ fontFamily: 'var(--font-playfair)' }}>
                    Contact Me
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Have a question or want to work together? I'd love to hear from you.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                {/* Name */}
                <div className="space-y-2">
                    <label className="text-base font-semibold text-foreground">
                        Họ và tên
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                        <Input
                            type="text"
                            placeholder="Họ và tên của bạn"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="pl-10"
                            required
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label className="text-base font-semibold text-foreground">
                        Email
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                        <Input
                            type="email"
                            placeholder="example@abc.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="pl-10"
                            required
                        />
                    </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                    <label className="text-base font-semibold text-foreground">
                        Tiêu đề
                    </label>
                    <div className="relative">
                        <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                        <Input
                            type="text"
                            placeholder="Tiêu đề"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="pl-10"
                            required
                        />
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                    <label className="text-base font-semibold text-foreground">
                        Nội dung
                    </label>
                    <Textarea
                        placeholder="Nội dung của bạn..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={8}
                        required
                    />
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full"
                    size="lg"
                >
                    {submitting ? 'Sending...' : 'Send Message'}
                </Button>
            </form>
        </div>
    );
}

Contact.getLayout = function getLayout(page) {
    return (
        <Layout
            title="Contact"
            description="Get in touch with me"
        >
            {page}
        </Layout>
    );
};
