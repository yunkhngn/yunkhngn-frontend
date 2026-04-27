import Layout from '@/components/template/Default/Layout';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
    Code2,
    Database,
    Server,
    Globe,
    Zap,
    Shield,
    Layout as LayoutIcon,
    Cpu,
    Cloud,
    Terminal,
    Smartphone,
    Search,
    Bot,
    Activity,
    FileText
} from 'lucide-react';

export default function Showcase() {
    const techStack = [
        {
            category: 'Frontend',
            icon: LayoutIcon,
            color: 'text-blue-500',
            items: ['Next.js 16', 'React 19', 'Tailwind CSS', 'Shadcn UI', 'TipTap (Rich Text)', 'Recharts']
        },
        {
            category: 'Backend',
            icon: Server,
            color: 'text-green-500',
            items: ['NestJS 11', 'TypeScript', 'Prisma ORM', 'Socket.io', 'Firebase Admin', 'Swagger']
        },
        {
            category: 'Database & Storage',
            icon: Database,
            color: 'text-yellow-500',
            items: ['SQL Server', 'Cloudinary (Media)', 'Redis (Caching)']
        },
        {
            category: 'Infrastructure',
            icon: Cloud,
            color: 'text-purple-500',
            items: ['Digital Ocean (Droplet)', 'Docker (Containerized)', 'GitHub Actions (CI/CD)', 'Cloudflare (DNS/CDN)', 'Resend (Email)']
        }
    ];
    const features = [
        {
            title: 'Real-time Interactions',
            description: 'Instant notifications and live updates using WebSockets (Socket.io).',
            icon: Zap
        },
        {
            title: 'Admin Dashboard',
            description: 'Comprehensive analytics, content management, and system monitoring.',
            icon: Activity
        },
        {
            title: 'AI Integration',
            description: 'Content summarization and generation powered by Google Gemini AI.',
            icon: Bot
        },
        {
            title: 'SEO Automation',
            description: 'Dynamic Sitemap and Robots.txt generation for optimal search indexing.',
            icon: Search
        },
        {
            title: 'Secure Authentication',
            description: 'Robust user management with Firebase Auth and Role-based Access Control (RBAC).',
            icon: Shield
        },
        {
            title: 'Rich Text Editor',
            description: 'Advanced content creation with TipTap, supporting code blocks, images, and formatting.',
            icon: FileText
        }
    ];

    return (
        <Layout
            title="Showcase - Khoa Nguyễn"
            description="Explore the technology and architecture behind yunkhngn.dev"
        >
            <div className="container mx-auto px-4 py-12 md:py-20 space-y-20">

                {/* Hero Section */}
                <section className="text-center max-w-4xl mx-auto space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        <Terminal className="h-4 w-4" />
                        <span>Built with Modern Web Technologies</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                        Under the Hood
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        A deep dive into the technical architecture, libraries, and design patterns that power this platform.
                        Built for performance, scalability, and developer experience.
                    </p>
                </section>

                {/* Tech Stack Grid */}
                <section>
                    <h2 className="text-3xl font-bold mb-10 text-center flex items-center justify-center gap-3">
                        <Cpu className="h-8 w-8 text-primary" />
                        Technology Stack
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {techStack.map((stack, index) => (
                            <Card key={index} className="border-t-4 border-t-primary/20 hover:border-t-primary transition-colors">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-lg">
                                        <stack.icon className={`h-6 w-6 ${stack.color}`} />
                                        {stack.category}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {stack.items.map((item, i) => (
                                            <Badge key={i} variant="secondary" className="font-normal">
                                                {item}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Features Grid */}
                <section className="bg-muted/30 rounded-3xl p-8 md:p-12">
                    <h2 className="text-3xl font-bold mb-12 text-center">Key Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="flex flex-col items-center text-center space-y-4 p-4 rounded-xl hover:bg-background transition-colors duration-300">
                                <div className="p-4 rounded-full bg-primary/10 text-primary">
                                    <feature.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-semibold">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Architecture Diagram (Simplified) */}
                <section className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold mb-10 text-center">System Architecture</h2>
                    <div className="relative bg-card border rounded-xl p-8 md:p-12 overflow-hidden">
                        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-black/10" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">

                            {/* Client */}
                            <div className="flex flex-col items-center gap-4 p-6 bg-background/80 backdrop-blur rounded-xl border shadow-sm w-full md:w-64">
                                <Smartphone className="h-10 w-10 text-blue-500" />
                                <div>
                                    <h3 className="font-bold text-lg">Client</h3>
                                    <p className="text-sm text-muted-foreground">Next.js (SSR/CSR)</p>
                                </div>
                            </div>

                            {/* Connection Line */}
                            <div className="hidden md:flex flex-1 h-px bg-border relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                                    REST / Socket.io
                                </div>
                            </div>
                            <div className="md:hidden h-12 w-px bg-border"></div>

                            {/* Server */}
                            <div className="flex flex-col items-center gap-4 p-6 bg-background/80 backdrop-blur rounded-xl border shadow-sm w-full md:w-64">
                                <Server className="h-10 w-10 text-green-500" />
                                <div>
                                    <h3 className="font-bold text-lg">API Server</h3>
                                    <p className="text-sm text-muted-foreground">NestJS</p>
                                </div>
                            </div>

                            {/* Connection Line */}
                            <div className="hidden md:flex flex-1 h-px bg-border relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                                    Prisma
                                </div>
                            </div>
                            <div className="md:hidden h-12 w-px bg-border"></div>

                            {/* Database */}
                            <div className="flex flex-col items-center gap-4 p-6 bg-background/80 backdrop-blur rounded-xl border shadow-sm w-full md:w-64">
                                <Database className="h-10 w-10 text-yellow-500" />
                                <div>
                                    <h3 className="font-bold text-lg">Database</h3>
                                    <p className="text-sm text-muted-foreground">SQL Server</p>
                                </div>
                            </div>

                        </div>

                        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="p-4 bg-background/50 rounded-lg border border-dashed">
                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Auth</p>
                                <p className="font-medium">Firebase</p>
                            </div>
                            <div className="p-4 bg-background/50 rounded-lg border border-dashed">
                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Storage</p>
                                <p className="font-medium">Cloudinary</p>
                            </div>
                            <div className="p-4 bg-background/50 rounded-lg border border-dashed">
                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">AI</p>
                                <p className="font-medium">Gemini</p>
                            </div>
                            <div className="p-4 bg-background/50 rounded-lg border border-dashed">
                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">CDN</p>
                                <p className="font-medium">Cloudflare</p>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </Layout>
    );
}
