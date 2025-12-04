import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { Github, Facebook, Instagram, Linkedin, Mail, Database, Code2, Terminal, Layout as LayoutIcon, Server, Settings, Video, Palette, Layers } from "lucide-react";
import {
    SiJavascript, SiTypescript, SiJava, SiCsharp, SiPython, SiCplusplus, SiHtml5, SiCss3,
    SiReact, SiNextdotjs, SiNestjs, SiNodedotjs, SiExpress, SiPrisma, SiTypeorm, SiTailwindcss, SiShadcnui,
    SiGit, SiGithubactions, SiDocker, SiCaddy, SiPostman, SiFigma, SiVisualstudiocode, SiFirebase, SiCloudinary,
    SiMicrosoftsqlserver, SiMysql, SiPostgresql, SiMongodb,
    SiAdobephotoshop, SiAdobeillustrator, SiAdobepremierepro, SiAdobeaftereffects, SiAdobelightroom, SiBlender,
    SiVercel, SiRailway
} from "react-icons/si";
import { useState, useEffect } from 'react';
import Layout from '@/components/template/Default/Layout';

export default function About() {
    const [settings, setSettings] = useState({});

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
                if (res.ok) {
                    const data = await res.json();
                    const settingsObj = data.reduce((acc, curr) => {
                        acc[curr.settingTitle] = curr.content;
                        return acc;
                    }, {});
                    setSettings(settingsObj);
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };
        fetchSettings();
    }, []);

    return (
        <Layout>
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
                    <div className="relative w-48 h-48 shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-600 rounded-full blur-2xl opacity-20 animate-pulse" />
                        <Image
                            src={settings.avatar || "/images/avatar-placeholder.jpg"}
                            alt="Profile"
                            fill
                            className="object-cover rounded-full border-4 border-background shadow-xl"
                            priority
                        />
                    </div>
                    <div className="text-center md:text-left space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                            {settings.name || "Khoa Nguyễn"}
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            {settings.title || "Fullstack Developer & UI/UX Designer"}
                        </p>
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <SocialLink href={settings.github || "https://github.com/yunkhngn"} icon={<Github className="w-5 h-5" />} />
                            <SocialLink href={settings.facebook || "https://facebook.com/yunkhngn"} icon={<Facebook className="w-5 h-5" />} />
                            <SocialLink href={settings.instagram || "https://instagram.com/yunkhngn"} icon={<Instagram className="w-5 h-5" />} />
                            <SocialLink href={settings.linkedin || "https://linkedin.com/in/yunkhngn"} icon={<Linkedin className="w-5 h-5" />} />
                            <SocialLink href={`mailto:${settings.email || "contact@yunkhngn.dev"}`} icon={<Mail className="w-5 h-5" />} />
                        </div>
                    </div>
                </div>

                <div className="space-y-12 text-lg leading-relaxed text-gray-600 dark:text-gray-300 font-medium">
                    {settings.bio ? (
                        <div dangerouslySetInnerHTML={{ __html: settings.bio }} className="whitespace-pre-wrap" />
                    ) : (
                        <p className="whitespace-pre-wrap">
                            Xin chào, tớ là <strong className="text-foreground">Khoa Nguyễn (yun.khngn)</strong>, sinh viên chuyên ngành Kỹ thuật phần mềm tại Đại học FPT.
                            Tớ đang là freelancer thiết kế đồ hoạ và là một guitarist.
                            Tớ đang hướng tới trở thành một <strong className="text-foreground">Fullstack Developer</strong> và thực hiện thêm nhiều ước mơ phía trước.
                        </p>
                    )}

                    <blockquote className="border-l-4 border-primary pl-6 py-2 italic text-xl text-foreground font-serif">
                        {settings.quote || '"Tương lai thuộc về những người tin vào vẻ đẹp trong chính những giấc mơ, hoài bão to lớn của mình..."'}
                    </blockquote>

                    {/* Education & Experience Timeline */}
                    <div className="grid md:grid-cols-2 gap-12 pt-12">
                        {/* Education */}
                        <div className="space-y-8">
                            <h3 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                                <span className="p-2 bg-primary/10 rounded-lg text-primary">🎓</span>
                                Education
                            </h3>
                            <div className="relative border-l-2 border-muted pl-8 space-y-10">
                                {settings.education ? (
                                    JSON.parse(settings.education).map((edu, index) => (
                                        <div key={index} className="relative">
                                            <div className="absolute -left-[39px] p-2 bg-background border-2 border-primary rounded-full">
                                                <div className="w-2 h-2 bg-primary rounded-full" />
                                            </div>
                                            <span className="text-sm text-muted-foreground font-mono">{edu.date}</span>
                                            <h4 className="text-lg font-bold text-foreground mt-1">{edu.school}</h4>
                                            <p className="text-primary font-medium">{edu.degree}</p>
                                            {edu.description && <p className="text-sm mt-2">{edu.description}</p>}
                                        </div>
                                    ))
                                ) : (
                                    <div className="relative">
                                        <div className="absolute -left-[39px] p-2 bg-background border-2 border-primary rounded-full">
                                            <div className="w-2 h-2 bg-primary rounded-full" />
                                        </div>
                                        <span className="text-sm text-muted-foreground font-mono">2020 - 2024</span>
                                        <h4 className="text-lg font-bold text-foreground mt-1">FPT University</h4>
                                        <p className="text-primary font-medium">Software Engineering</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="space-y-8">
                            <h3 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                                <span className="p-2 bg-primary/10 rounded-lg text-primary">💼</span>
                                Experience
                            </h3>
                            <div className="relative border-l-2 border-muted pl-8 space-y-10">
                                {settings.experience ? (
                                    JSON.parse(settings.experience).map((exp, index) => (
                                        <div key={index} className="relative">
                                            <div className="absolute -left-[39px] p-2 bg-background border-2 border-primary rounded-full">
                                                <div className="w-2 h-2 bg-primary rounded-full" />
                                            </div>
                                            <span className="text-sm text-muted-foreground font-mono">{exp.date}</span>
                                            <h4 className="text-lg font-bold text-foreground mt-1">{exp.company}</h4>
                                            <p className="text-primary font-medium">{exp.role}</p>
                                            {exp.description && <p className="text-sm mt-2">{exp.description}</p>}
                                        </div>
                                    ))
                                ) : (
                                    <div className="relative">
                                        <div className="absolute -left-[39px] p-2 bg-background border-2 border-primary rounded-full">
                                            <div className="w-2 h-2 bg-primary rounded-full" />
                                        </div>
                                        <span className="text-sm text-muted-foreground font-mono">2023 - Present</span>
                                        <h4 className="text-lg font-bold text-foreground mt-1">Freelance</h4>
                                        <p className="text-primary font-medium">Fullstack Developer</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tech Stack & Skills */}
                    <div className="pt-16 space-y-8">
                        <h3 className="text-3xl font-bold text-center text-foreground">Tech Stack & Skills</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {settings.skills ? (
                                JSON.parse(settings.skills).map((skillGroup, index) => (
                                    <div key={index} className="bg-card border rounded-xl p-6 hover:border-primary transition-colors">
                                        <h4 className="text-lg font-bold mb-4 text-foreground">{skillGroup.category}</h4>
                                        <div className="flex flex-wrap gap-3">
                                            {skillGroup.items.map((item, i) => {
                                                const Icon = getSkillIcon(item);
                                                return (
                                                    <div key={i} className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium transition-colors hover:bg-secondary/80">
                                                        <Icon className="h-4 w-4" />
                                                        <span>{item}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                [
                                    {
                                        category: "Languages",
                                        items: ["JavaScript", "C/C++", "Python", "Java", "SQL", "HTML", "CSS"]
                                    },
                                    {
                                        category: "Frameworks and Libraries",
                                        items: ["React", "Next.js", "NodeJS", "NestJS", "Express", "Prisma", "TypeORM", "Tailwind CSS", "HeroUI", "shadcn/ui"]
                                    },
                                    {
                                        category: "Tools",
                                        items: ["Git", "GitHub Actions", "Docker", "Docker Compose", "Caddy", "Postman", "Figma", "VS Code", "Firebase", "Cloudinary"]
                                    },
                                    {
                                        category: "Databases",
                                        items: ["MSSQL", "MySQL", "PostgreSQL", "MongoDB"]
                                    },
                                    {
                                        category: "DevOps & Deployment",
                                        items: ["CI/CD", "GitHub Actions Pipelines", "Dockerized Monorepos", "Reverse Proxy (Caddy)", "VPS Deployment", "Environment Configuration"]
                                    },
                                    {
                                        category: "Design & Video Editing",
                                        items: ["Adobe Photoshop", "Adobe Illustrator", "Adobe Premiere Pro", "Adobe After Effects", "Adobe Lightroom", "CapCut", "Blender"]
                                    }
                                ].map((skillGroup, index) => (
                                    <div key={index} className="bg-card border rounded-xl p-6 hover:border-primary transition-colors">
                                        <h4 className="text-lg font-bold mb-4 text-foreground">{skillGroup.category}</h4>
                                        <div className="flex flex-wrap gap-3">
                                            {skillGroup.items.map((item, i) => {
                                                const Icon = getSkillIcon(item);
                                                return (
                                                    <div key={i} className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium transition-colors hover:bg-secondary/80">
                                                        <Icon className="h-4 w-4" />
                                                        <span>{item}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {
                        settings.about_content && (
                            <div dangerouslySetInnerHTML={{ __html: settings.about_content }} className="whitespace-pre-wrap pt-12" />
                        )
                    }
                    <div className="pt-8 space-y-2 text-center">
                        <p className="italic">Author of this website.</p>
                        <p className="font-serif text-xl text-foreground font-bold pt-4">Khoa Nguyễn</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

function SocialLink({ href, icon }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
            {icon}
        </a>
    );
}

function getSkillIcon(skillName) {
    const normalized = skillName.toLowerCase().replace(/[^a-z0-9]/g, '');

    const icons = {
        // Languages
        'javascript': SiJavascript,
        'js': SiJavascript,
        'typescript': SiTypescript,
        'ts': SiTypescript,
        'java': SiJava,
        'c': SiCplusplus,
        'c++': SiCplusplus,
        'cpp': SiCplusplus,
        'cc++': SiCplusplus,
        'python': SiPython,
        'sql': Database,
        'html': SiHtml5,
        'css': SiCss3,
        'c#': SiCsharp,
        'csharp': SiCsharp,

        // Frameworks & Libs
        'react': SiReact,
        'nextjs': SiNextdotjs,
        'next.js': SiNextdotjs,
        'nodejs': SiNodedotjs,
        'node.js': SiNodedotjs,
        'nestjs': SiNestjs,
        'express': SiExpress,
        'prisma': SiPrisma,
        'typeorm': SiTypeorm,
        'tailwindcss': SiTailwindcss,
        'tailwind': SiTailwindcss,
        'heroui': Palette, // Generic for HeroUI
        'shadcnui': SiShadcnui,
        'shadcn/ui': SiShadcnui,

        // Tools
        'git': SiGit,
        'githubactions': SiGithubactions,
        'docker': SiDocker,
        'dockercompose': SiDocker,
        'caddy': SiCaddy,
        'postman': SiPostman,
        'figma': SiFigma,
        'vscode': SiVisualstudiocode,
        'firebase': SiFirebase,
        'cloudinary': SiCloudinary,

        // Databases
        'mssql': SiMicrosoftsqlserver,
        'mysql': SiMysql,
        'postgresql': SiPostgresql,
        'mongodb': SiMongodb,

        // DevOps
        'cicd': SiGithubactions,
        'githubactionspipelines': SiGithubactions,
        'dockerizedmonorepos': SiDocker,
        'reverseproxycaddy': SiCaddy,
        'vpsdeployment': Server,
        'environmentconfiguration': Settings,

        // Design & Video
        'adobephotoshop': SiAdobephotoshop,
        'adobeillustrator': SiAdobeillustrator,
        'adobepremierepro': SiAdobepremierepro,
        'adobeaftereffects': SiAdobeaftereffects,
        'adobelightroom': SiAdobelightroom,
        'capcut': Video, // Generic for CapCut
        'blender': SiBlender,

        // Others
        'vercel': SiVercel,
        'railway': SiRailway,
        'terminal': Terminal
    };

    return icons[normalized] || Code2; // Default to Code2 icon
}

