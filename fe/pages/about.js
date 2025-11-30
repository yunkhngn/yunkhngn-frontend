import Layout from '@/components/shared/Layout';

export default function About() {
    return (
        <Layout title="About Me | DevPortfolio">
            <div className="container max-w-4xl py-6 lg:py-10">
                <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
                    <div className="flex-1 space-y-4">
                        <h1 className="inline-block font-heading text-4xl tracking-tight lg:text-5xl font-bold">
                            About Me
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Software Engineer, Writer, and Creator.
                        </p>
                    </div>
                </div>
                <hr className="my-8" />
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 prose prose-gray dark:prose-invert max-w-none">
                        <p>
                            Hello! I'm a passionate developer who loves building things for the web.
                            I specialize in full-stack development using modern technologies like React, Node.js, and Cloud services.
                        </p>
                        <p>
                            When I'm not coding, you can find me writing about tech, exploring new places, or playing video games.
                        </p>
                        <h3>Tech Stack</h3>
                        <ul>
                            <li>Frontend: React, Next.js, TailwindCSS</li>
                            <li>Backend: NestJS, Node.js, Express</li>
                            <li>Database: PostgreSQL, MSSQL, MongoDB</li>
                            <li>DevOps: Docker, AWS, Firebase</li>
                        </ul>
                        <h3>Contact</h3>
                        <p>
                            Feel free to reach out to me at <a href="mailto:contact@example.com">contact@example.com</a>.
                        </p>
                    </div>
                    <div className="w-full md:w-1/3">
                        {/* Placeholder for a profile image or sidebar content */}
                        <div className="bg-muted rounded-lg aspect-square flex items-center justify-center text-muted-foreground">
                            Profile Image
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
