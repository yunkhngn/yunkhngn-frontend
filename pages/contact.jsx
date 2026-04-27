import { useState } from 'react';
import Layout from '@/components/template/Default/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { toast } from 'sonner';
import { Mail, User, MessageSquare, Phone, Building, Tag } from 'lucide-react';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        category: 'general',
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
                    Have a question or want to work together? I&apos;d love to hear from you.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                {/* Name */}
                <div className="space-y-2">
                    <label htmlFor="name" className="text-base font-semibold text-foreground">
                        Your name
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Your Name"
                            required
                            className="pl-10 bg-background/50"
                            aria-label="Your Name"
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

                {/* Phone */}
                <div className="space-y-2">
                    <label className="text-base font-semibold text-foreground">
                        Phone (Optional)
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                        <Input
                            type="tel"
                            placeholder="+84 123 456 789"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Company */}
                <div className="space-y-2">
                    <label className="text-base font-semibold text-foreground">
                        Company (Optional)
                    </label>
                    <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                        <Input
                            type="text"
                            placeholder="Your company name"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                    <label className="text-base font-semibold text-foreground">
                        Category
                    </label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                            <SelectTrigger className="pl-10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="general">General Inquiry</SelectItem>
                                <SelectItem value="business">Business Opportunity</SelectItem>
                                <SelectItem value="support">Technical Support</SelectItem>
                                <SelectItem value="feedback">Feedback</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                    <label className="text-base font-semibold text-foreground">
                        Subject
                    </label>
                    <div className="relative">
                        <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                        <Input
                            type="text"
                            placeholder="Subject"
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
                        Message
                    </label>
                    <Textarea
                        placeholder="Your message..."
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
