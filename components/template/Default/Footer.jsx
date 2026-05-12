import Link from 'next/link';
import { readNestJson } from '@/lib/api/readJson';
import { Github, Facebook, Instagram, Linkedin, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import NewsletterForm from '../../shared/NewsletterForm';

export default function Footer() {
    const [settings, setSettings] = useState({});

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
                if (res.ok) {
                    const data = await readNestJson(res);
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
        <footer className="bg-background border-t border-border pt-16 pb-8 w-full relative z-10">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8 mb-12">
                    {/* Brand Column */}
                    <div className="lg:w-1/2 flex flex-col justify-between">
                        <div>
                            <Link href="/" className="font-mono text-2xl font-bold flex items-center gap-1 mb-4 hover:opacity-80 transition-opacity">
                                <span className="text-primary">&gt;</span>
                                <span className="text-foreground">yun.khngn</span>
                                <span className="text-primary animate-pulse">_</span>
                            </Link>
                            {settings.footer_description ? (
                                <div
                                    className="text-muted-foreground mb-6 max-w-sm whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{ __html: settings.footer_description }}
                                />
                            ) : (
                                <p className="text-muted-foreground mb-6 max-w-sm whitespace-pre-wrap">
                                    Full Stack Developer building beautiful web experiences.
                                    Sharing knowledge and journey through code.
                                </p>
                            )}
                        </div>
                        <div className="flex gap-4 mt-auto">
                            {(settings.facebook || settings.instagram || settings.github || settings.linkedin || settings.email) ? (
                                <>
                                    {settings.facebook && <SocialLink href={settings.facebook} icon={<Facebook size={20} />} label="Facebook" />}
                                    {settings.instagram && <SocialLink href={settings.instagram} icon={<Instagram size={20} />} label="Instagram" />}
                                    {settings.github && <SocialLink href={settings.github} icon={<Github size={20} />} label="Github" />}
                                    {settings.linkedin && <SocialLink href={settings.linkedin} icon={<Linkedin size={20} />} label="Linkedin" />}
                                    {settings.email && <SocialLink href={`mailto:${settings.email}`} icon={<Mail size={20} />} label="Email" />}
                                </>
                            ) : (
                                <>
                                    <SocialLink href="https://facebook.com/yunkhngn" icon={<Facebook size={20} />} label="Facebook" />
                                    <SocialLink href="https://instagram.com/yunkhngn" icon={<Instagram size={20} />} label="Instagram" />
                                    <SocialLink href="https://github.com/yunkhngn" icon={<Github size={20} />} label="Github" />
                                    <SocialLink href="https://linkedin.com/in/yunkhngn" icon={<Linkedin size={20} />} label="Linkedin" />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Vertical Divider (Desktop only) */}
                    <div className="hidden lg:block w-px bg-border mx-4 h-auto min-h-full"></div>

                    {/* Links Columns */}
                    <div className="lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Links Column 1 */}
                        <div>
                            <h3 className="font-semibold text-foreground mb-4">Explore</h3>
                            <ul className="space-y-3">
                                <FooterLink href="/project">Project</FooterLink>
                                <FooterLink href="/blog">Blog</FooterLink>
                                <FooterLink href="/journal">Journal</FooterLink>
                                <FooterLink href="/about">About Me</FooterLink>
                                <FooterLink href="/showcase">Showcase</FooterLink>
                            </ul>
                        </div>

                        {/* Links Column 2 */}
                        <div>
                            <h3 className="font-semibold text-foreground mb-4">Connect</h3>
                            <ul className="space-y-3 mb-8">
                                <FooterLink href="/contact">Contact</FooterLink>
                                <FooterLink href="/resume">Resume</FooterLink>
                                {settings.email ? (
                                    <FooterLink href={`mailto:${settings.email}`}>Email Me</FooterLink>
                                ) : (
                                    <FooterLink href="mailto:contact@yunkhngn.dev">Email Me</FooterLink>
                                )}
                            </ul>

                            <NewsletterForm />
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <p>© {new Date().getFullYear()} Khoa Nguyen. All rights reserved.</p>
                        <a href="https://www.digitalocean.com/?refcode=00c47b2667b2&utm_campaign=Referral_Invite&utm_medium=Referral_Program&utm_source=badge" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/do-badge.svg" alt="DigitalOcean Referral Badge" className="h-8" />
                        </a>
                    </div>
                    <div className="flex gap-6 items-center">
                        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ href, children }) {
    return (
        <li>
            <Link href={href} className="text-muted-foreground hover:text-primary transition-colors">
                {children}
            </Link>
        </li>
    );
}

function SocialLink({ href, icon, label }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-[#F6E8D2] flex items-center justify-center text-[#42475B] hover:bg-primary hover:text-white transition-all duration-300"
            aria-label={label}
        >
            {icon}
        </a>
    );
}
