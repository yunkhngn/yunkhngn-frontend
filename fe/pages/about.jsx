import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { Github, Facebook, Instagram, Linkedin, Mail, Database, Code2, Terminal, Layout as LayoutIcon } from "lucide-react";
import {
    SiJavascript, SiTypescript, SiJava, SiCsharp,
    SiReact, SiNextdotjs, SiNestjs, SiNodedotjs, SiTailwindcss,
    SiGit, SiDocker, SiFigma, SiVisualstudiocode, SiPostgresql, SiMongodb,
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
                console.error(error);
            }
        };
        fetchSettings();
    }, []);

    return (
        <div className="container mx-auto px-4 py-12 md:py-24 max-w-3xl">
            <div className="flex flex-col items-center text-center space-y-8 mb-16">
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-background shadow-xl">
                    <Image
                        src="https://github.com/yunkhngn.png"
                        alt="Khoa Nguyễn"
                        fill
                        className="object-cover"
                    />
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-bold font-serif">Khoa Nguyễn</h1>
                    <p className="text-muted-foreground text-lg">Software Developer • Graphic Designer • Guitarist</p>
                </div>

                <div className="flex flex-wrap gap-4 justify-center">
                    <Link href="/resume">
                        <Button className="rounded-full px-6">Resume</Button>
                    </Link>
                    <div className="flex gap-4 items-center">
                        {(settings.facebook || settings.instagram || settings.github || settings.linkedin || settings.email) ? (
                            <>
                                {settings.github && <SocialLink href={settings.github} icon={<Github size={20} />} />}
                                {settings.facebook && <SocialLink href={settings.facebook} icon={<Facebook size={20} />} />}
                                {settings.instagram && <SocialLink href={settings.instagram} icon={<Instagram size={20} />} />}
                                {settings.linkedin && <SocialLink href={settings.linkedin} icon={<Linkedin size={20} />} />}
                                {settings.email && <SocialLink href={`mailto:${settings.email}`} icon={<Mail size={20} />} />}
                            </>
                        ) : (
                            <>
                                <SocialLink href="https://github.com/yunkhngn" icon={<Github size={20} />} />
                                <SocialLink href="https://facebook.com/yunkhngn" icon={<Facebook size={20} />} />
                                <SocialLink href="https://instagram.com/yunkhngn" icon={<Instagram size={20} />} />
                                <SocialLink href="https://linkedin.com/in/yunkhngn" icon={<Linkedin size={20} />} />
                                <SocialLink href="mailto:contact@yunkhngn.dev" icon={<Mail size={20} />} />
                            </>
                        )}
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

                {
                    settings.about_content && (
                        <div dangerouslySetInnerHTML={{ __html: settings.about_content }} className="whitespace-pre-wrap pt-2" />
                    )
                }

                <div className="pt-8 space-y-2 text-center">
                    <p className="italic">Author of this website.</p>
                    <p className="font-serif text-xl text-foreground font-bold pt-4">Khoa Nguyễn</p>
                </div>

                {/* Education & Experience Timeline */}
                <div className="grid md:grid-cols-2 gap-12 pt-12">
                    {/* Education */}
                    <div className="space-y-8">
                        <h3 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                            Education
                        </h3>
                        <div className="space-y-8 border-l-2 border-border pl-8 relative">
                            {settings.education ? (
                                JSON.parse(settings.education).map((edu, index) => (
                                    <div key={index} className="relative">
                                        <span className="absolute -left-[39px] top-1 h-5 w-5 rounded-full border-4 border-background bg-primary" />
                                        <span className="text-sm text-muted-foreground font-mono">{edu.date}</span>
                                        <h4 className="text-lg font-bold text-foreground mt-1">{edu.school}</h4>
                                        <p className="text-primary font-medium">{edu.degree}</p>
                                        {edu.description && <p className="text-sm mt-2">{edu.description}</p>}
                                    </div>
                                ))
                            ) : (
                                <div className="relative">
                                    <span className="absolute -left-[39px] top-1 h-5 w-5 rounded-full border-4 border-background bg-primary" />
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
                            Experience
                        </h3>
                        <div className="space-y-8 border-l-2 border-border pl-8 relative">
                            {settings.experience ? (
                                JSON.parse(settings.experience).map((exp, index) => (
                                    <div key={index} className="relative">
                                        <span className="absolute -left-[39px] top-1 h-5 w-5 rounded-full border-4 border-background bg-primary" />
                                        <span className="text-sm text-muted-foreground font-mono">{exp.date}</span>
                                        <h4 className="text-lg font-bold text-foreground mt-1">{exp.company}</h4>
                                        <p className="text-primary font-medium">{exp.role}</p>
                                        {exp.description && <p className="text-sm mt-2">{exp.description}</p>}
                                    </div>
                                ))
                            ) : (
                                <div className="relative">
                                    <span className="absolute -left-[39px] top-1 h-5 w-5 rounded-full border-4 border-background bg-primary" />
                                    <span className="text-sm text-muted-foreground font-mono">2021 - Present</span>
                                    <h4 className="text-lg font-bold text-foreground mt-1">Freelancer</h4>
                                    <p className="text-primary font-medium">Graphic Designer & Web Developer</p>
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
                            <>
                                <div className="bg-card border rounded-xl p-6">
                                    <h4 className="text-lg font-bold mb-4 text-foreground">Languages</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {['JavaScript', 'TypeScript', 'Java', 'C#', 'SQL'].map((item, i) => {
                                            const Icon = getSkillIcon(item);
                                            return (
                                                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium">
                                                    <Icon className="h-4 w-4" />
                                                    <span>{item}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="bg-card border rounded-xl p-6">
                                    <h4 className="text-lg font-bold mb-4 text-foreground">Frameworks & Libraries</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {['React', 'Next.js', 'NestJS', 'Node.js', 'Tailwind CSS'].map((item, i) => {
                                            const Icon = getSkillIcon(item);
                                            return (
                                                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium">
                                                    <Icon className="h-4 w-4" />
                                                    <span>{item}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

About.getLayout = function getLayout(page) {
    return (
        <Layout
            title="About - Khoa Nguyễn"
            description="About Khoa Nguyễn (yun.khngn)"
        >
            {page}
        </Layout>
    );
};

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
    const normalized = skillName.toLowerCase().replace(/\s+/g, '');

    const icons = {
        'javascript': SiJavascript,
        'js': SiJavascript,
        'typescript': SiTypescript,
        'ts': SiTypescript,
        'java': SiJava,
        'c#': SiCsharp,
        'csharp': SiCsharp,
        'sql': Database,
        'postgresql': SiPostgresql,
        'mysql': Database,
        'mongodb': SiMongodb,
        'react': SiReact,
        'reactjs': SiReact,
        'next.js': SiNextdotjs,
        'nextjs': SiNextdotjs,
        'nestjs': SiNestjs,
        'node.js': SiNodedotjs,
        'nodejs': SiNodedotjs,
        'tailwindcss': SiTailwindcss,
        'tailwind': SiTailwindcss,
        'git': SiGit,
        'docker': SiDocker,
        'figma': SiFigma,
        'vscode': SiVisualstudiocode,
        'visualstudiocode': SiVisualstudiocode,
        'vercel': SiVercel,
        'railway': SiRailway,
        'html': Code2,
        'css': LayoutIcon,
        'terminal': Terminal
    };

    return icons[normalized] || Code2; // Default to Code2 icon
}
