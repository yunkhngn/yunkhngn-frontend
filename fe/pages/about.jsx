import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { Github, Facebook, Instagram, Linkedin, Mail } from "lucide-react";
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
                    <p>
                        Xin chào, tớ là <strong className="text-foreground">Khoa Nguyễn (yun.khngn)</strong>, sinh viên chuyên ngành Kỹ thuật phần mềm tại Đại học FPT.
                        Tớ đang là freelancer thiết kế đồ hoạ và là một guitarist.
                        Tớ đang hướng tới trở thành một <strong className="text-foreground">Fullstack Developer</strong> và thực hiện thêm nhiều ước mơ phía trước.
                    </p>
                )}

                <blockquote className="border-l-4 border-primary pl-6 py-2 italic text-xl text-foreground font-serif">
                    {settings.quote || '"Tương lai thuộc về những người tin vào vẻ đẹp trong chính những giấc mơ, hoài bão to lớn của mình..."'}
                </blockquote>
                {
                    settings.about_content ? (
                        <div dangerouslySetInnerHTML={{ __html: settings.about_content }} className="whitespace-pre-wrap" />
                    ) : (
                        <p>
                            Xin chào, tớ là <strong className="text-foreground">Khoa Nguyễn (yun.khngn)</strong>, sinh viên chuyên ngành Kỹ thuật phần mềm tại Đại học FPT.
                            Tớ đang là freelancer thiết kế đồ hoạ và là một guitarist.
                            Tớ đang hướng tới trở thành một <strong className="text-foreground">Fullstack Developer</strong> và thực hiện thêm nhiều ước mơ phía trước.
                        </p>
                    )
                }
                <div className="pt-8 space-y-2">
                    <p className="italic">Vài dòng thư tay viết vội.</p>
                    <p className="font-serif text-xl text-foreground font-bold pt-4">Khoa Nguyễn</p>
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
