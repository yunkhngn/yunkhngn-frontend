import Layout from '@/components/template/Default/Layout';
import Link from 'next/link';

export default function TermsOfService() {
    return (
        <div className="container mx-auto px-4 py-12 md:py-24 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 font-serif">Terms of Service</h1>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using this website (<strong>yun.khngn</strong>), you accept and agree to be bound by the terms and provision of this agreement.
                        In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                        Any participation in this service will constitute acceptance of this agreement. If you do not agree to abide by the above, please do not use this service.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">2. Intellectual Property</h2>
                    <p>
                        The Site and its original content, features, and functionality are owned by <strong>Khoa Nguyễn</strong> and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">3. User Content</h2>
                    <p>
                        Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material (&quot;Content&quot;).
                        You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
                    </p>
                    <p className="mt-4">
                        By posting Content to the Service, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service.
                        You retain any and all of your rights to any Content you submit, post or display on or through the Service and you are responsible for protecting those rights.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">4. Prohibited Uses</h2>
                    <p>
                        You may use the Service only for lawful purposes and in accordance with Terms. You agree not to use the Service:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                        <li>In any way that violates any applicable national or international law or regulation.</li>
                        <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way by exposing them to inappropriate content or otherwise.</li>
                        <li>To transmit, or procure the sending of, any advertising or promotional material, including any &quot;junk mail&quot;, &quot;chain letter,&quot; &quot;spam,&quot; or any other similar solicitation.</li>
                        <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">5. Disclaimer</h2>
                    <p>
                        The materials on <strong>yun.khngn</strong>&apos;s website are provided on an &apos;as is&apos; basis. <strong>yun.khngn</strong> makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">6. Limitation of Liability</h2>
                    <p>
                        In no event shall <strong>yun.khngn</strong> or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on <strong>yun.khngn</strong>&apos;s website, even if <strong>yun.khngn</strong> or a <strong>yun.khngn</strong> authorized representative has been notified orally or in writing of the possibility of such damage.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">7. Governing Law</h2>
                    <p>
                        These Terms shall be governed and construed in accordance with the laws of Vietnam, without regard to its conflict of law provisions.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">8. Changes to Terms</h2>
                    <p>
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days&apos; notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>
                    <p>
                        If you have any questions about these Terms, please contact us:
                    </p>
                    <ul className="list-disc pl-6 mt-4">
                        <li>By email: <a href="mailto:yunkhngn.mail@gmail.com" className="text-primary hover:underline">yunkhngn.mail@gmail.com</a></li>
                        <li>By visiting this page on our website: <Link href="/contact" className="text-primary hover:underline">/contact</Link></li>
                    </ul>
                </section>
            </div>
        </div>
    );
}

TermsOfService.getLayout = function getLayout(page) {
    return (
        <Layout
            title="Terms of Service - Khoa Nguyễn"
            description="Terms of Service for yunkhngn website"
        >
            {page}
        </Layout>
    );
};
