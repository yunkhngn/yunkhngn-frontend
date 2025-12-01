import { DefaultFooter, DefaultNavbar, Metadata } from "@/components/template";
import InteractiveBackground from "@/components/ui/InteractiveBackground";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Github, Facebook, Instagram, Linkedin, Mail } from "lucide-react";

export default function About() {
    return (
        <div className="flex flex-col min-h-screen font-sans bg-background text-foreground relative">
            <Metadata
                title="About - Khoa Nguyễn"
                description="About Khoa Nguyễn (yun.khngn)"
            />

            <div className="absolute top-0 left-0 w-full h-screen overflow-hidden z-0">
                <InteractiveBackground />
            </div>

            <DefaultNavbar />

            <main className="flex-1 container mx-auto px-4 py-12 md:py-24 max-w-3xl relative z-10">
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
                            <SocialLink href="https://github.com/yunkhngn" icon={<Github size={20} />} />
                            <SocialLink href="https://facebook.com/yunkhngn" icon={<Facebook size={20} />} />
                            <SocialLink href="https://instagram.com/yunkhngn" icon={<Instagram size={20} />} />
                            <SocialLink href="https://linkedin.com/in/yunkhngn" icon={<Linkedin size={20} />} />
                            <SocialLink href="mailto:contact@yunkhngn.dev" icon={<Mail size={20} />} />
                        </div>
                    </div>
                </div>

                <div className="space-y-12 text-lg leading-relaxed text-muted-foreground">
                    <p>
                        Xin chào, tớ là <strong className="text-foreground">Khoa Nguyễn (yun.khngn)</strong>, sinh viên chuyên ngành Kỹ thuật phần mềm tại Đại học FPT.
                        Tớ đang là freelancer thiết kế đồ hoạ và là một guitarist.
                        Tớ đang hướng tới trở thành một <strong className="text-foreground">Fullstack Developer</strong> và thực hiện thêm nhiều ước mơ phía trước.
                    </p>

                    <blockquote className="border-l-4 border-primary pl-6 py-2 italic text-xl text-foreground font-serif">
                        "Tương lai thuộc về những người tin vào vẻ đẹp trong chính những giấc mơ, hoài bão to lớn của mình..."
                    </blockquote>

                    <div className="space-y-6">
                        <p>
                            Giới thiệu nhiều hơn một chút về bản thân, tớ sống và làm việc tại Hà Nội.
                            Tớ thích tìm hiểu về những thứ mới mẻ, thử thách bản thân và không ngừng học hỏi nhiều điều hơn.
                            Tớ có kĩ năng khá tốt với nghệ thuật và cả kĩ thuật/công nghệ, không phải là năng khiếu thiên bẩm,
                            nhưng tớ cảm nhận được tớ đã tự đạt được bằng những nỗ lực của bản thân.
                        </p>
                        <p>
                            Tớ đã chơi đàn được hơn 5 năm rồi, và cũng từng được đi diễn tại một số show.
                            Ngoài ra, tớ cũng siêu thích quay phim và chụp ảnh, kiểu như, tớ đang muốn truyền tải với thế giới này những gì tớ thấy qua góc kính máy ảnh nhiệm màu.
                        </p>
                        <p>
                            Tuy rằng hơi bận rộn với việc học và làm, nhưng tớ vẫn luôn có một khoảng dành cho những sở thích của riêng mình,
                            tập đàn 2 tiếng mỗi ngày, hay là ngồi code cả tối. Hihi, chắc là hết rồi, tạm gác ở đây nha!
                        </p>
                    </div>

                    <div className="pt-8 space-y-2">
                        <p className="italic">Vài dòng thư tay viết vội.</p>
                        <p className="font-serif text-xl text-foreground font-bold pt-4">Khoa Nguyễn</p>
                    </div>
                </div>
            </main>

            <footer className="py-8 text-center text-sm text-muted-foreground relative z-10">
                <p>© 2025 Khoa Nguyễn. All rights reserved!</p>
            </footer>
        </div>
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
