'use client';

import Image from "next/image";
import { readNestJson } from '@/lib/api/readJson';
import { Github, Linkedin, Mail, ArrowRight, Briefcase, GraduationCap, Code, Server, Database, Layers, Workflow, Send, Code2, Flame, Image as ImageIcon, ShieldCheck, Palette, Video, Box, Bot } from "lucide-react";
import {
    SiReact, SiNextdotjs, SiNodedotjs, SiTypescript, SiJavascript, SiTailwindcss,
    SiMysql, SiPostgresql, SiMongodb, SiDocker, SiFigma, SiPython,
    SiSpringboot, SiNestjs, SiGit, SiGithub, SiAmazon, SiHtml5, SiCss3
} from "react-icons/si";
import { FaJava } from "react-icons/fa6";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/Button";
import { readCachedSettings, writeCachedSettings } from '@/lib/settingsCache';

const placeholder = "/image/placeholder.jpg";

const navItems = [
    { id: "story", label: "my story" },
    { id: "journey", label: "education & experience" },
    { id: "skills", label: "skills" },
    { id: "contact", label: "contact" },
];

export default function About() {
    const [settings, setSettings] = useState({});
    const [parsedExperience, setParsedExperience] = useState([]);
    const [parsedEducation, setParsedEducation] = useState([]);
    const [parsedSkills, setParsedSkills] = useState([]);
    const scrollRef = useRef(null);

    useEffect(() => {
        const applySettings = (settingsObj) => {
            setSettings(settingsObj || {});

            if (settingsObj?.experience) {
                try {
                    setParsedExperience(JSON.parse(settingsObj.experience));
                } catch (e) {
                    console.error("Error parsing experience JSON setting", e);
                    setParsedExperience([]);
                }
            } else {
                setParsedExperience([]);
            }

            if (settingsObj?.education) {
                try {
                    setParsedEducation(JSON.parse(settingsObj.education));
                } catch (e) {
                    console.error("Error parsing education JSON setting", e);
                    setParsedEducation([]);
                }
            } else {
                setParsedEducation([]);
            }

            if (settingsObj?.skills) {
                try {
                    setParsedSkills(JSON.parse(settingsObj.skills));
                } catch (e) {
                    console.error("Error parsing skills JSON setting", e);
                    setParsedSkills([]);
                }
            } else {
                setParsedSkills([]);
            }
        };

        const cachedSettings = readCachedSettings();
        if (cachedSettings) {
            applySettings(cachedSettings);
        }

        const fetchSettings = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
                if (res.ok) {
                    const data = await readNestJson(res);
                    const settingsObj = data.reduce((acc, curr) => {
                        acc[curr.settingTitle] = curr.content;
                        return acc;
                    }, {});
                    applySettings(settingsObj);
                    writeCachedSettings(settingsObj);
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };
        fetchSettings();
    }, []);

    const [activeSection, setActiveSection] = useState("story");

    // Handle scroll to update active section - using container ref
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const handleScroll = () => {
            const sections = navItems.map(item => document.getElementById(item.id));
            // Adjust scroll position check relative to the container
            const scrollPosition = container.scrollTop + container.clientHeight / 3;

            for (const section of sections) {
                // Check offset relative to container
                if (section && section.offsetTop <= scrollPosition && (section.offsetTop + section.offsetHeight) > scrollPosition) {
                    setActiveSection(section.id);
                }
            }
        };

        container.addEventListener('scroll', handleScroll);
        // Initial check
        handleScroll();

        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        const container = scrollRef.current;
        if (element && container) {
            container.scrollTo({
                top: element.offsetTop,
                behavior: 'smooth'
            });
        }
    };

    const getSectionImage = () => {
        switch (activeSection) {
            case "story": return settings.about_image_story || settings.avatar || placeholder;
            case "journey": return settings.about_image_journey || settings.avatar || placeholder;
            case "skills": return settings.about_image_skills || settings.avatar || placeholder;
            case "contact": return settings.about_image_contact || settings.avatar || placeholder;
            default: return settings.avatar || placeholder;
        }
    };

    return (
        <div
            ref={scrollRef}
            className="h-[calc(100vh-64px)] overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth bg-[#FDFBF7] dark:bg-background text-foreground transition-colors duration-500 font-sans"
        >
            <div className="relative w-full">
                <div className="grid grid-cols-1 lg:grid-cols-10 items-start">

                    {/* Left Column: Image (Sticky) - 4/10 ratio, Edge-to-Edge */}
                    <div className="hidden lg:block lg:col-span-4 sticky top-0 h-[calc(100vh-64px)] z-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8 }}
                                className="relative w-full h-full overflow-hidden"
                            >
                                <Image
                                    src={getSectionImage()}
                                    alt="Khoa Nguyen"
                                    fill
                                    sizes="(max-width: 1023px) 1px, 40vw"
                                    className="object-cover"
                                    priority
                                />
                                {/* Subtle overlap shadow for depth */}
                                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Right Column: Content - 6/10 ratio */}
                    <div className="lg:col-span-6 px-6 md:px-12 lg:px-20 xl:px-32">

                        {/* My Story Section */}
                        <section id="story" className="min-h-[calc(100vh-64px)] flex flex-col lg:justify-center snap-start pt-0 pb-24 lg:py-20">
                            {/* Mobile Image (Visible only on small screens) - Edge-to-Edge */}
                            <div className="lg:hidden -mx-6 md:-mx-12 w-[calc(100%+3rem)] md:w-[calc(100%+6rem)] aspect-[4/3] relative overflow-hidden mb-12">
                                <Image
                                    src={settings.about_image_story || settings.avatar || placeholder}
                                    alt="Khoa Nguyen"
                                    fill
                                    sizes="(max-width: 1023px) 95vw, 1px"
                                    className="object-cover"
                                    priority
                                />
                            </div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-8">
                                    My story<span className="text-primary">.</span>
                                </h1>

                                <div className="prose dark:prose-invert text-lg md:text-xl leading-relaxed text-muted-foreground font-light space-y-6">
                                    {settings.bio ? (
                                        <div dangerouslySetInnerHTML={{ __html: settings.bio }} />
                                    ) : (
                                        <>
                                            <p>Since I can remember I have always liked to create. That passion evolved and when I was 15 I started to create some simple digital graphics.</p>
                                            <p>As a Fullstack Developer based in Vietnam, I specialize in building exceptional digital experiences.</p>
                                        </>
                                    )}
                                    {settings.quote && (
                                        <blockquote className="border-l-4 border-primary pl-6 py-2 italic text-xl text-foreground font-serif my-8">
                                            &quot;{settings.quote}&quot;
                                        </blockquote>
                                    )}
                                    {settings.about_content && (
                                        <div dangerouslySetInnerHTML={{ __html: settings.about_content }} className="mt-8 space-y-6" />
                                    )}
                                </div>
                            </motion.div>
                        </section>

                        {/* Journey Section (Experience & Education) */}
                        <section id="journey" className="min-h-[calc(100vh-64px)] flex flex-col lg:justify-center snap-start pt-0 pb-24 lg:py-20">
                            {/* Mobile Image for Journey */}
                            <div className="lg:hidden -mx-6 md:-mx-12 w-[calc(100%+3rem)] md:w-[calc(100%+6rem)] aspect-[4/3] relative overflow-hidden mb-12">
                                <Image
                                    src={settings.about_image_journey || settings.avatar || placeholder}
                                    alt="Journey"
                                    fill
                                    sizes="(max-width: 1023px) 95vw, 1px"
                                    className="object-cover"
                                />
                            </div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="space-y-16"
                            >
                                <div>
                                    <h2 className="text-4xl font-serif font-bold mb-12">Education<span className="text-primary">.</span></h2>
                                    <div className="space-y-12 border-l border-foreground/10 ml-3 pl-8 md:pl-12">
                                        {parsedEducation.length > 0 ? (
                                            parsedEducation.map((edu, i) => (
                                                <TimelineItem
                                                    key={i}
                                                    date={edu.date}
                                                    title={edu.school}
                                                    subtitle={edu.degree}
                                                    description={edu.description}
                                                    icon={<GraduationCap className="w-4 h-4" />}
                                                />
                                            ))
                                        ) : (
                                            <TimelineItem
                                                date="2020 - 2024"
                                                title="FPT University"
                                                subtitle="Software Engineering"
                                                icon={<GraduationCap className="w-4 h-4" />}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-4xl font-serif font-bold mb-12">Experience<span className="text-primary">.</span></h2>
                                    <div className="space-y-12 border-l border-foreground/10 ml-3 pl-8 md:pl-12">
                                        {parsedExperience.length > 0 ? (
                                            parsedExperience.map((exp, i) => (
                                                <TimelineItem
                                                    key={i}
                                                    date={exp.date}
                                                    title={exp.company}
                                                    subtitle={exp.role}
                                                    description={exp.description}
                                                    icon={<Briefcase className="w-4 h-4" />}
                                                />
                                            ))
                                        ) : (
                                            <TimelineItem
                                                date="2023 - Present"
                                                title="Freelance"
                                                subtitle="Fullstack Developer"
                                                description="Building modern web applications for clients."
                                                icon={<Briefcase className="w-4 h-4" />}
                                            />
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </section>

                        {/* Skills Section */}
                        <section id="skills" className="min-h-[calc(100vh-64px)] flex flex-col lg:justify-center snap-start pt-0 pb-24 lg:py-20">
                            {/* Mobile Image for Skills */}
                            <div className="lg:hidden -mx-6 md:-mx-12 w-[calc(100%+3rem)] md:w-[calc(100%+6rem)] aspect-[4/3] relative overflow-hidden mb-12">
                                <Image
                                    src={settings.about_image_skills || settings.avatar || placeholder}
                                    alt="Skills"
                                    fill
                                    sizes="(max-width: 1023px) 95vw, 1px"
                                    className="object-cover"
                                />
                            </div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-4xl font-serif font-bold mb-12">Skills<span className="text-primary">.</span></h2>
                                <div className="grid gap-12">
                                    {parsedSkills.length > 0 ? (
                                        parsedSkills.map((group, idx) => (
                                            <div key={idx} className="space-y-6">
                                                <h3 className="text-2xl font-serif text-foreground flex items-center gap-4">
                                                    <span className="w-12 h-[1px] bg-primary block"></span>
                                                    {group.category}
                                                </h3>
                                                <div className="flex flex-wrap gap-4 pl-0 md:pl-16">
                                                    {group.items.map((skill, i) => (
                                                        <div key={i} className="flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-full border border-transparent hover:border-primary/20 transition-all cursor-default group">
                                                            <span className="text-lg text-primary group-hover:scale-110 transition-transform">
                                                                {getSkillIcon(skill)}
                                                            </span>
                                                            <span className="text-lg text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                                                                {skill}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">Loading skills...</p>
                                    )}
                                </div>
                            </motion.div>
                        </section>

                        {/* Contact Section */}
                        <section id="contact" className="min-h-[calc(100vh-64px)] flex flex-col lg:justify-center snap-start pt-0 pb-32 lg:py-20">
                            {/* Mobile Image for Contact */}
                            <div className="lg:hidden -mx-6 md:-mx-12 w-[calc(100%+3rem)] md:w-[calc(100%+6rem)] aspect-[4/3] relative overflow-hidden mb-12">
                                <Image
                                    src={settings.about_image_contact || settings.avatar || placeholder}
                                    alt="Contact"
                                    fill
                                    sizes="(max-width: 1023px) 95vw, 1px"
                                    className="object-cover"
                                />
                            </div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-4xl font-serif font-bold mb-8">Contact<span className="text-primary">.</span></h2>
                                <p className="text-xl text-muted-foreground max-w-xl leading-relaxed mb-12">
                                    I&apos;m always open to discussing new projects, creative ideas or opportunities to be part of your visions.
                                </p>

                                <div className="grid gap-4">
                                    <a href={`mailto:${settings.email || "contact@yunkhngn.dev"}`} className="group flex items-center gap-4 p-3 -ml-3 rounded-xl hover:bg-secondary/30 transition-all">
                                        <div className="p-3 bg-secondary rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</p>
                                            <p className="text-xl md:text-2xl font-serif font-medium">{settings.email || "contact@yunkhngn.dev"}</p>
                                        </div>
                                    </a>

                                    {settings.linkedin && (
                                        <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 p-3 -ml-3 rounded-xl hover:bg-secondary/30 transition-all">
                                            <div className="p-3 bg-secondary rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm">
                                                <Linkedin className="w-5 h-5" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">LinkedIn</p>
                                                <p className="text-xl md:text-2xl font-serif font-medium">Connect on LinkedIn</p>
                                            </div>
                                        </a>
                                    )}

                                    {settings.github && (
                                        <a href={settings.github} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 p-3 -ml-3 rounded-xl hover:bg-secondary/30 transition-all">
                                            <div className="p-3 bg-secondary rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm">
                                                <Github className="w-5 h-5" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Github</p>
                                                <p className="text-xl md:text-2xl font-serif font-medium">Follow on Github</p>
                                            </div>
                                        </a>
                                    )}

                                    {settings.cv_url && (
                                        <div className="pt-4">
                                            <Button size="lg" className="rounded-2xl px-10 py-4 text-base w-full md:w-auto h-auto shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" asChild>
                                                <a href={settings.cv_url} download="CV - Nguyen Dang Khoa - Fresher Fullstack" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                                                    Download Resume <ArrowRight className="w-5 h-5" />
                                                </a>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </section>
                    </div>

                    {/* Timeline Navigation (Fixed on right) */}
                    <div className="fixed top-1/2 -translate-y-1/2 right-4 md:right-12 flex flex-col items-end gap-6 z-50">
                        {navItems.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className="group flex items-center gap-4 cursor-pointer relative"
                            >
                                <span className={`text-xs font-bold tracking-widest uppercase transition-all duration-300 origin-right hidden md:block ${activeSection === item.id ? 'text-foreground opacity-100 translate-x-0' : 'text-muted-foreground opacity-0 group-hover:opacity-100 translate-x-4'}`}>
                                    {item.label}
                                </span>
                                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${activeSection === item.id ? 'bg-foreground scale-150' : 'bg-muted-foreground/30 group-hover:bg-foreground/50'}`} />
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}

function TimelineItem({ date, title, subtitle, description, icon }) {
    return (
        <div className="relative group">
            <div className="absolute -left-[45px] md:-left-[61px] top-1 bg-background border border-foreground/20 p-1.5 rounded-full text-muted-foreground group-hover:border-primary group-hover:text-primary transition-colors">
                {icon}
            </div>
            <div className="space-y-2">
                <span className="text-sm font-mono text-muted-foreground">{date}</span>
                <h3 className="text-xl font-bold ">{title}</h3>
                <p className="text-primary font-medium">{subtitle}</p>
                {description && (
                    <p className="text-muted-foreground leading-relaxed pt-1 max-w-prose">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

function getSkillIcon(skillName) {
    const normalize = (s) => s.toLowerCase().replace(/[\s\.]/g, '');
    const key = normalize(skillName);

    let IconComp = null;

    switch (key) {
        case 'react': IconComp = SiReact; break;
        case 'reactjs': IconComp = SiReact; break;
        case 'nextjs': IconComp = SiNextdotjs; break;
        case 'nodejs': IconComp = SiNodedotjs; break;
        case 'typescript': IconComp = SiTypescript; break;
        case 'javascript': IconComp = SiJavascript; break;
        case 'js': IconComp = SiJavascript; break;
        case 'ts': IconComp = SiTypescript; break;
        case 'tailwindcss': IconComp = SiTailwindcss; break;
        case 'mysql': IconComp = SiMysql; break;
        case 'sql': IconComp = SiMysql; break;
        case 'postgresql': IconComp = SiPostgresql; break;
        case 'mongodb': IconComp = SiMongodb; break;
        case 'docker': IconComp = SiDocker; break;
        case 'figma': IconComp = SiFigma; break;
        case 'python': IconComp = SiPython; break;
        case 'java': IconComp = FaJava; break;
        case 'springboot': IconComp = SiSpringboot; break;
        case 'nestjs': IconComp = SiNestjs; break;
        case 'git': IconComp = SiGit; break;
        case 'github': IconComp = SiGithub; break;
        case 'aws': IconComp = SiAmazon; break;
        case 'html': IconComp = SiHtml5; break;
        case 'html5': IconComp = SiHtml5; break;
        case 'css': IconComp = SiCss3; break;
        case 'css3': IconComp = SiCss3; break;
        case 'express': IconComp = Server; break;
        case 'prisma': IconComp = Database; break;
        case 'typeorm': IconComp = Database; break;
        case 'shadcnui': IconComp = Layers; break;
        case 'githubactions': IconComp = Workflow; break;
        case 'githubactionspipelines': IconComp = Workflow; break;
        case 'postman': IconComp = Send; break;
        case 'vscode': IconComp = Code2; break;
        case 'firebase': IconComp = Flame; break;
        case 'cloudinary': IconComp = ImageIcon; break;
        case 'caddy': IconComp = ShieldCheck; break;
        case 'reverseproxycaddy': IconComp = ShieldCheck; break;
        case 'mssql': IconComp = Database; break;
        case 'microsoftsqlserver': IconComp = Database; break;
        case 'adobephotoshop': IconComp = Palette; break;
        case 'adobeillustrator': IconComp = Palette; break;
        case 'adobepremierepro': IconComp = Video; break;
        case 'adobeaftereffects': IconComp = Video; break;
        case 'adobelightroom': IconComp = Palette; break;
        case 'blender': IconComp = Box; break;
        case 'geminiai': IconComp = Bot; break;
        default: IconComp = Code; break;
    }

    if (!IconComp) {
        IconComp = Code;
    }

    return <IconComp className="w-4 h-4" />;
}
