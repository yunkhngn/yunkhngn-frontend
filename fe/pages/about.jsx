import Image from "next/image";
import { Github, Facebook, Instagram, Linkedin, Mail, ArrowRight, Briefcase, GraduationCap, MapPin, Calendar, Globe } from "lucide-react";
import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from "framer-motion";

import Layout from '@/components/template/Default/Layout';
import Metadata from '@/components/template/Metadata';
import { Button } from "@/components/ui/Button";

const placeholder = "/image/placeholder.jpg";

export default function About() {
    const [settings, setSettings] = useState({});
    const [parsedExperience, setParsedExperience] = useState([]);
    const [parsedEducation, setParsedEducation] = useState([]);
    const [parsedSkills, setParsedSkills] = useState([]);
    const scrollRef = useRef(null);

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

                    try {
                        if (settingsObj.experience) setParsedExperience(JSON.parse(settingsObj.experience));
                        if (settingsObj.education) setParsedEducation(JSON.parse(settingsObj.education));
                        if (settingsObj.skills) setParsedSkills(JSON.parse(settingsObj.skills));
                    } catch (e) {
                        console.error("Error parsing JSON settings", e);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };
        fetchSettings();
    }, []);

    const navItems = [
        { id: "story", label: "my story" },
        { id: "journey", label: "experience" },
        { id: "skills", label: "skills" },
        { id: "contact", label: "contact" },
    ];

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
    }, [navItems]); // Added navItems dependency for correctness, though it's constant

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        const container = scrollRef.current;
        if (element && container) {
            container.scrollTo({
                top: element.offsetTop, // Snap directly to top
                behavior: 'smooth'
            });
        }
    };

    return (
        <Layout>
            <Metadata
                title="About me - Khoa Nguyễn"
                description="My Story - Khoa Nguyễn"
                url="https://yunkhngn.dev/about"
            />

            {/* Scroll Container */}
            <div
                ref={scrollRef}
                className="h-[calc(100vh-64px)] overflow-y-auto snap-y snap-mandatory scroll-smooth bg-[#FDFBF7] dark:bg-background text-foreground transition-colors duration-500 font-sans"
            >
                <div className="container mx-auto px-4 md:px-8 max-w-7xl relative">

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">

                        {/* Left Column: Image (Sticky) */}
                        {/* Adjusted Top to account for Navbar height if sticky, or just relative container */}
                        <div className="hidden lg:block lg:col-span-5 relative lg:sticky lg:top-8 h-[calc(100vh-4rem)] flex items-center py-8">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                                className="relative w-full h-[80%] rounded-2xl overflow-hidden shadow-2xl"
                            >
                                <Image
                                    src={settings.avatar || placeholder}
                                    alt="Khoa Nguyen"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute top-0 bottom-0 -right-8 w-px bg-foreground/10" />
                            </motion.div>
                        </div>

                        {/* Middle Column: Content */}
                        <div className="lg:col-span-6">

                            {/* My Story Section */}
                            <section id="story" className="min-h-[calc(100vh-64px)] flex flex-col justify-center snap-start py-20">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                >
                                    {/* Mobile Image (Visible only on small screens) */}
                                    <div className="lg:hidden w-full aspect-square relative rounded-2xl overflow-hidden shadow-xl mb-8">
                                        <Image
                                            src={settings.avatar || placeholder}
                                            alt="Khoa Nguyen"
                                            fill
                                            className="object-cover"
                                            priority
                                        />
                                    </div>

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
                            <section id="journey" className="min-h-[calc(100vh-64px)] flex flex-col justify-center snap-start py-20">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="space-y-16"
                                >
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
                                </motion.div>
                            </section>

                            {/* Skills Section */}
                            <section id="skills" className="min-h-[calc(100vh-64px)] flex flex-col justify-center snap-start py-20">
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
                                                    <div className="flex flex-wrap gap-x-6 gap-y-4 pl-16">
                                                        {group.items.map((skill, i) => (
                                                            <span key={i} className="text-xl text-muted-foreground hover:text-foreground transition-colors cursor-default">
                                                                {skill}
                                                            </span>
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
                            <section id="contact" className="min-h-[calc(100vh-64px)] flex flex-col justify-center snap-start py-20">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                >
                                    <h2 className="text-4xl font-serif font-bold mb-8">Contact<span className="text-primary">.</span></h2>
                                    <p className="text-xl text-muted-foreground max-w-xl leading-relaxed mb-12">
                                        I&apos;m always open to discussing new projects, creative ideas or opportunities to be part of your visions.
                                    </p>

                                    <div className="grid gap-6">
                                        <a href={`mailto:${settings.email || "contact@yunkhngn.dev"}`} className="group flex items-center gap-6 text-2xl font-medium hover:text-primary transition-colors">
                                            <div className="p-4 bg-secondary rounded-full group-hover:bg-primary/10 transition-colors">
                                                <Mail className="w-8 h-8" />
                                            </div>
                                            <span>{settings.email || "contact@yunkhngn.dev"}</span>
                                        </a>
                                        {settings.linkedin && (
                                            <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-6 text-2xl font-medium hover:text-primary transition-colors">
                                                <div className="p-4 bg-secondary rounded-full group-hover:bg-primary/10 transition-colors">
                                                    <Linkedin className="w-8 h-8" />
                                                </div>
                                                <span>LinkedIn</span>
                                            </a>
                                        )}
                                        {settings.github && (
                                            <a href={settings.github} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-6 text-2xl font-medium hover:text-primary transition-colors">
                                                <div className="p-4 bg-secondary rounded-full group-hover:bg-primary/10 transition-colors">
                                                    <Github className="w-8 h-8" />
                                                </div>
                                                <span>Github</span>
                                            </a>
                                        )}
                                        {settings.cv_url && (
                                            <div className="pt-8">
                                                <Button size="lg" className="rounded-full px-10 py-6 text-lg h-auto" asChild>
                                                    <a href={settings.cv_url} target="_blank" rel="noopener noreferrer">
                                                        Download CV <ArrowRight className="ml-2 w-5 h-5" />
                                                    </a>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </section>
                        </div>

                        {/* Right Column: Timeline Navigation (Sticky) */}
                        <div className="hidden lg:block lg:col-span-1 relative h-full">
                            <div className="fixed top-1/2 -translate-y-1/2 right-12 flex flex-col items-end gap-6 z-50">
                                {navItems.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => scrollToSection(item.id)}
                                        className="group flex items-center gap-4 cursor-pointer relative"
                                    >
                                        <span className={`text-xs font-bold tracking-widest uppercase transition-all duration-300 origin-right ${activeSection === item.id ? 'text-foreground opacity-100 translate-x-0' : 'text-muted-foreground opacity-0 group-hover:opacity-100 translate-x-4'}`}>
                                            {item.label}
                                        </span>
                                        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${activeSection === item.id ? 'bg-foreground scale-150' : 'bg-muted-foreground/30 group-hover:bg-foreground/50'}`} />
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </Layout>
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
