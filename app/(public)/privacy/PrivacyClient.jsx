import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <div className="container mx-auto px-4 py-12 md:py-24 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 font-serif">Privacy Policy</h1>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                    <p>
                        Welcome to <strong>yun.khngn</strong>. We respect your privacy and are committed to protecting your personal data.
                        This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                    </p>
                </section>

                <section className="mb-8">
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

                <section className="mb-8">
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

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">4. Cookies</h2>
                    <p>
                        We use cookies and similar tracking technologies to track the activity on our Service and hold certain information.
                        You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not use cookies, you may not be able to use some portions of our Service.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">5. Third-Party Links</h2>
                    <p>
                        Our Service may contain links to other sites that are not operated by us. If you click on a third party link, you will be directed to that third party&apos;s site.
                        We strongly advise you to review the Privacy Policy of every site you visit.
                        We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.
                    </p>
                </section>

                <section className="mb-8">
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
        </div>
    );
}

