'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import HeroBackground from '@/components/home/HeroBackground';

export default function PrivacyPolicy() {
    return (
        <div className="relative min-h-screen overflow-hidden">
            <HeroBackground />

            <div className="container mx-auto px-6 md:px-12 py-20 lg:py-32 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="text-center mb-16 space-y-6">
                        <div className="text-sm text-primary uppercase tracking-widest font-semibold">Legal Information</div>
                        <h1 className="text-5xl md:text-7xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 pb-2">
                            Privacy Policy<span className="text-primary">.</span>
                        </h1>
                        <p className="text-muted-foreground text-lg">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>

                    <div className="prose prose-lg dark:prose-invert prose-headings:font-serif prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 max-w-none bg-background/60 dark:bg-background/40 backdrop-blur-xl p-8 md:p-12 lg:p-16 rounded-3xl border border-foreground/10 shadow-2xl">

                        <section id="intro" className="scroll-mt-32">
                            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                            <p>
                                Welcome to <strong>yun.khngn</strong>. We respect your privacy and are committed to protecting your personal data.
                                This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                            </p>
                        </section>

                        <section id="collect" className="scroll-mt-32 mt-12">
                            <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
                            <p>
                                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                            </p>
                            <ul className="list-disc pl-6 mt-4 space-y-2">
                                <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                                <li><strong>Contact Data</strong> includes email address and telephone number.</li>
                                <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform and other technology on the devices you use to access this website.</li>
                                <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
                            </ul>
                        </section>

                        <section id="use" className="scroll-mt-32 mt-12">
                            <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
                            <p>
                                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                            </p>
                            <ul className="list-disc pl-6 mt-4 space-y-2">
                                <li>To provide and maintain our Service.</li>
                                <li>To notify you about changes to our Service.</li>
                                <li>To allow you to participate in interactive features of our Service when you choose to do so.</li>
                                <li>To provide customer support.</li>
                                <li>To gather analysis or valuable information so that we can improve our Service.</li>
                                <li>To monitor the usage of our Service.</li>
                                <li>To detect, prevent and address technical issues.</li>
                            </ul>
                        </section>

                        <section id="cookies" className="scroll-mt-32 mt-12">
                            <h2 className="text-2xl font-bold mb-4">4. Cookies</h2>
                            <p>
                                We use cookies and similar tracking technologies to track the activity on our Service and hold certain information.
                                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not use cookies, you may not be able to use some portions of our Service.
                            </p>
                        </section>

                        <section id="links" className="scroll-mt-32 mt-12">
                            <h2 className="text-2xl font-bold mb-4">5. Third-Party Links</h2>
                            <p>
                                Our Service may contain links to other sites that are not operated by us. If you click on a third party link, you will be directed to that third party&apos;s site.
                                We strongly advise you to review the Privacy Policy of every site you visit.
                                We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.
                            </p>
                        </section>

                        <section id="contact" className="scroll-mt-32 mt-12">
                            <h2 className="text-2xl font-bold mb-4">6. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us:
                            </p>
                            <ul className="list-disc pl-6 mt-4">
                                <li>By email: <a href="mailto:yunkhngn.mail@gmail.com" className="text-primary hover:underline">yunkhngn.mail@gmail.com</a></li>
                                <li>By visiting this page on our website: <Link href="/contact" className="text-primary hover:underline">/contact</Link></li>
                            </ul>
                        </section>

                    </div>
                </motion.div>
            </div>
        </div>
    );
}
