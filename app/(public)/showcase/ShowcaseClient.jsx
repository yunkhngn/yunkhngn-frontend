'use client';

import { motion } from 'framer-motion';
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
  Bot,
  Activity,
  Search,
  Layers,
  Container,
  Workflow
} from 'lucide-react';
import {
  SiNextdotjs,
  SiReact,
  SiTailwindcss,
  SiNestjs,
  SiPrisma,
  SiDocker,
  SiCaddy,
  SiCloudflare,
  SiVercel,
  SiRedis,
  SiGithubactions,
  SiFramer
} from 'react-icons/si';
import { DiMsqlServer } from "react-icons/di";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Showcase() {
  const techStack = [
    {
      category: 'Frontend Core',
      icon: LayoutIcon,
      color: 'text-blue-500',
      description: 'Modern, high-performance UI with server-side excellence.',
      tools: [
        { name: 'Next.js 15', icon: SiNextdotjs },
        { name: 'React 19', icon: SiReact },
        { name: 'Framer Motion', icon: SiFramer },
        { name: 'Tailwind CSS', icon: SiTailwindcss },
        { name: 'Lucide Icons', icon: Code2 },
      ]
    },
    {
      category: 'Backend & AI',
      icon: Cpu,
      color: 'text-purple-500',
      description: 'Distributed architecture with integrated AI capabilities.',
      tools: [
        { name: 'NestJS 11', icon: SiNestjs },
        { name: 'Gemini Pro (RAG)', icon: Bot },
        { name: 'Prisma ORM', icon: SiPrisma },
        { name: 'Socket.io', icon: Zap },
        { name: 'TypeScript', icon: Terminal },
      ]
    },
    {
      category: 'Data & Intelligence',
      icon: Database,
      color: 'text-emerald-500',
      description: 'Robust storage and vector search for AI context.',
      tools: [
        { name: 'Mssql', icon: DiMsqlServer },
        { name: 'Redis', icon: SiRedis },
        { name: 'ChromaDB', icon: Database },
        { name: 'Cloudinary', icon: Cloud },
      ]
    },
    {
      category: 'DevOps & Infra',
      icon: Container,
      color: 'text-orange-500',
      description: 'Containerized deployment with automated workflows.',
      tools: [
        { name: 'Docker', icon: SiDocker },
        { name: 'Caddy Proxy', icon: SiCaddy },
        { name: 'GH Actions', icon: SiGithubactions },
        { name: 'Watchtower', icon: Activity },
      ]
    }
  ];

  const highlights = [
    {
      title: 'RAG Pipeline',
      description: 'A Retrieval-Augmented Generation system that allows the AI to chat based on my personal knowledge base and projects.',
      icon: Bot,
      tech: 'Gemini Pro + ChromaDB'
    },
    {
      title: 'Dynamic Edge SEO',
      description: 'Automated Open Graph image generation using Vercel Edge Runtime and JSON-LD for rich search results.',
      icon: Search,
      tech: 'Next.js ImageResponse'
    },
    {
      title: 'Real-time Analytics',
      description: 'In-depth performance monitoring and real-user metrics integrated directly into the Vercel ecosystem.',
      icon: Activity,
      tech: 'Vercel Speed Insights'
    }
  ];

  return (
    <div className="flex-1 bg-[#FDFBF7] dark:bg-background transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-32">

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mb-32"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-medium mb-8">
            <Terminal className="h-4 w-4" />
            <span className="tracking-widest uppercase">System Specifications v2.0</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-tight text-foreground mb-8 leading-tight">
            Under the <br />
            <span className="text-primary italic">hood.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-3xl">
            This platform isn&apos;t just a portfolio—it&apos;s a high-performance playground for
            modern engineering patterns, AI integration, and brutalist design aesthetics.
          </p>
        </motion.section>

        {/* Core Architecture Grid */}
        <section className="mb-40">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-serif font-bold mb-4">Core Tech Stack</h2>
              <p className="text-muted-foreground text-lg">The foundation of every pixel and request.</p>
            </div>
            <div className="h-[1px] flex-1 bg-foreground/10 mx-8 hidden md:block" />
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {techStack.map((stack, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="group p-8 bg-white dark:bg-secondary/20 border border-foreground/5 rounded-3xl hover:border-primary/20 transition-all duration-500"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className={`p-4 rounded-2xl bg-secondary dark:bg-background group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500`}>
                    <stack.icon className="h-8 w-8" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground/50 tracking-widest">0{idx + 1}</span>
                </div>
                <h3 className="text-2xl font-serif font-bold mb-3">{stack.category}</h3>
                <p className="text-muted-foreground mb-8 font-light">{stack.description}</p>
                <div className="flex flex-wrap gap-3">
                  {stack.tools.map((tool, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 dark:bg-background/50 rounded-lg border border-foreground/5 text-sm font-medium">
                      <tool.icon className="h-4 w-4" />
                      {tool.name}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Feature Highlights */}
        <section className="mb-40">
          <div className="p-8 md:p-16 bg-foreground text-background dark:bg-secondary dark:text-foreground rounded-[3rem] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[100px] rounded-full -mr-48 -mt-48" />

            <h2 className="text-4xl font-serif font-bold mb-16 relative z-10">Advanced Capabilities</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
              {highlights.map((item, i) => (
                <div key={i} className="space-y-6">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold">{item.title}</h3>
                  <p className="opacity-70 font-light leading-relaxed">
                    {item.description}
                  </p>
                  <div className="inline-block px-3 py-1 rounded-lg bg-white/10 text-xs font-mono tracking-wider">
                    {item.tech}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Infrastructure Visualization */}
        <section className="max-w-5xl mx-auto text-center">
          <div className="inline-block p-4 rounded-full bg-primary/10 text-primary mb-8">
            <Workflow className="h-8 w-8" />
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8">DevOps & Deployment</h2>
          <p className="text-xl text-muted-foreground font-light mb-16 max-w-2xl mx-auto">
            A fully automated CI/CD pipeline ensures that every commit is tested and deployed with zero downtime.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="p-8 border border-foreground/10 rounded-3xl space-y-4">
              <SiGithubactions className="h-12 w-12 mx-auto text-muted-foreground" />
              <h4 className="font-bold">Build & Test</h4>
              <p className="text-sm text-muted-foreground">GitHub Actions runs ESLint, TypeCheck, and Unit Tests on every push.</p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="w-px h-12 bg-gradient-to-b from-transparent to-primary hidden md:block" />
              <div className="p-6 bg-primary text-primary-foreground rounded-2xl shadow-xl shadow-primary/20 w-full">
                <SiDocker className="h-10 w-10 mx-auto mb-4" />
                <h4 className="font-bold">Docker Image</h4>
                <p className="text-xs opacity-80 mt-2">Containerized Production Artifact</p>
              </div>
              <div className="w-px h-12 bg-gradient-to-t from-transparent to-primary hidden md:block" />
            </div>

            <div className="p-8 border border-foreground/10 rounded-3xl space-y-4">
              <SiCaddy className="h-12 w-12 mx-auto text-muted-foreground" />
              <h4 className="font-bold">Auto Deployment</h4>
              <p className="text-sm text-muted-foreground">Watchtower detects new images and Caddy handles HTTPS/Traffic routing.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
