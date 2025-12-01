import { Button } from '@/components/ui/Button';
import { Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '@/components/template/Default/Layout';

export default function Resume() {
    const cvUrl = '/file/cv.svg';

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

                <a href={cvUrl} download="KhoaNguyen_CV.svg" target="_blank" rel="noopener noreferrer">
                    <Button className="gap-2">
                        <Download className="h-4 w-4" /> Download CV
                    </Button>
                </a>
            </div>

            <div className="flex justify-center">
                <div className="relative w-full shadow-2xl rounded-3xl overflow-hidden aspect-[1/1.414] border-[16px] border-white">
                    <Image
                        src={cvUrl}
                        alt="Khoa Nguyễn CV"
                        fill
                        className="object-cover bg-white"
                        priority
                    />
                </div>
            </div>
        </div>
    );
}

Resume.getLayout = function getLayout(page) {
    return (
        <Layout
            title="Resume - Khoa Nguyễn"
            description="Curriculum Vitae of Khoa Nguyễn"
        >
            {page}
        </Layout>
    );
};
