import Link from 'next/link';
import { Github, Linkedin, Facebook, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-background border-t border-border pt-16 pb-8 w-full">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8 mb-12">
                    {/* Brand Column */}
                    <div className="lg:w-1/3 flex flex-col justify-between">
                        <div>
                            <Link href="/" className="font-mono text-2xl font-bold flex items-center gap-1 mb-4 hover:opacity-80 transition-opacity">
                                <span className="text-primary">&gt;</span>
                                <span className="text-foreground">yun.khngn</span>
                                <span className="text-primary animate-pulse">_</span>
                            </Link>
                            <p className="text-muted-foreground mb-6 max-w-sm">
                                Full Stack Developer building beautiful web experiences.
                                Sharing knowledge and journey through code.
                            </p>
                        </div>
                        <div className="flex gap-4 mt-auto">
                            <SocialLink href="https://github.com/yunkhngn" icon={<Github size={20} />} label="Github" />
                            <SocialLink href="https://linkedin.com/in/yunkhngn" icon={<Linkedin size={20} />} label="LinkedIn" />
                            <SocialLink href="https://facebook.com/yunkhngn" icon={<Facebook size={20} />} label="Facebook" />
                            <SocialLink href="https://twitter.com/yunkhngn" icon={<Twitter size={20} />} label="Twitter" />
                        </div>
                    </div>

                    {/* Vertical Divider (Desktop only) */}
                    <div className="hidden lg:block w-px bg-border mx-4 h-auto min-h-full"></div>

                    {/* Links Columns */}
                    <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Links Column 1 */}
                        <div>
                            <h3 className="font-semibold text-foreground mb-4">Explore</h3>
                            <ul className="space-y-3">
                                <FooterLink href="/blog">Blog</FooterLink>
                                <FooterLink href="/projects">Projects</FooterLink>
                                <FooterLink href="/about">About Me</FooterLink>
                                <FooterLink href="/gallery">Gallery</FooterLink>
                            </ul>
                        </div>

                        {/* Links Column 2 */}
                        <div>
                            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
                            <ul className="space-y-3">
                                <FooterLink href="/snippets">Code Snippets</FooterLink>
                                <FooterLink href="/tags">Tags</FooterLink>
                                <FooterLink href="/tools">Tools I Use</FooterLink>
                                <FooterLink href="/rss.xml">RSS Feed</FooterLink>
                            </ul>
                        </div>

                        {/* Links Column 3 */}
                        <div>
                            <h3 className="font-semibold text-foreground mb-4">Connect</h3>
                            <ul className="space-y-3">
                                <FooterLink href="/contact">Contact</FooterLink>
                                <FooterLink href="mailto:yunkhngn.mail@gmail.com">Email Me</FooterLink>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} Yunkhngn. All rights reserved.</p>
                    <div className="flex gap-6">
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
