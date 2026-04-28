'use client';

import { Button } from '@/components/ui/Button';
import { readNestJson } from '@/lib/api/readJson';
import { Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { useState, useEffect } from 'react';

export default function Resume() {
    const [cvUrl, setCvUrl] = useState('/file/cv.svg');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
                if (res.ok) {
                    const data = await readNestJson(res);
                    const cvSetting = data.find(s => s.settingTitle === 'cv_url');
                    if (cvSetting && cvSetting.content) {
                        setCvUrl(cvSetting.content);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch CV settings", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const isPdf = cvUrl.toLowerCase().endsWith('.pdf');

    return (
        <div className="container mx-auto px-4 py-12 md:py-20 max-w-6xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Resume</h1>
                </div>

                <a href={cvUrl} download="CV - Nguyen Dang Khoa - Fresher Fullstack" target="_blank" rel="noopener noreferrer">
                    <Button className="gap-2">
                        <Download className="h-4 w-4" /> Download CV
                    </Button>
                </a>
            </div>

            <div className="flex justify-center">
                <div className="relative w-full shadow-2xl rounded-3xl bg-white p-4 aspect-[1/1.414]">
                    <div className="relative w-full h-full overflow-hidden rounded-2xl bg-white ring-1 ring-white">
                        {loading ? (
                            <div className="flex items-center justify-center w-full h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            </div>
                        ) : isPdf ? (
                            <object
                                data={cvUrl}
                                type="application/pdf"
                                className="w-full h-full"
                            >
                                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                                    <p className="mb-2">Unable to display PDF directly.</p>
                                    <a
                                        href={cvUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline"
                                    >
                                        Click here to view PDF
                                    </a>
                                </div>
                            </object>
                        ) : (
                            <Image
                                src={cvUrl}
                                alt="Khoa Nguyễn CV"
                                fill
                                sizes="(max-width: 1152px) 100vw, 1152px"
                                className="object-contain"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

