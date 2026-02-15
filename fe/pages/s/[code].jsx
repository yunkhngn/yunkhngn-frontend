import { useEffect, useState } from 'react';
import { Loader2, ExternalLink, ArrowRight, Terminal } from 'lucide-react';
import Link from 'next/link';

export async function getServerSideProps(context) {
    const { code } = context.params;

    try {
        const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/shortlinks/resolve/${code}`);

        if (!res.ok) {
            return { notFound: true };
        }

        const data = await res.json();

        if (data?.targetUrl) {
            // Security check: Ensure URL uses http or https protocol
            const isValidProtocol = /^https?:\/\//i.test(data.targetUrl);

            if (isValidProtocol) {
                return {
                    props: {
                        targetUrl: data.targetUrl,
                        code,
                    },
                };
            }
        }

        return { notFound: true };
    } catch (error) {
        console.error('Shortlink resolve error:', error);
        return { notFound: true };
    }
}

export default function ShortlinkRedirect({ targetUrl, code }) {
    const [countdown, setCountdown] = useState(3);
    const [dots, setDots] = useState('');

    useEffect(() => {
        const dotTimer = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);
        return () => clearInterval(dotTimer);
    }, []);

    useEffect(() => {
        // Double check protocol on client side before starting redirect
        if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    window.location.href = targetUrl;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [targetUrl]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 font-mono">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="flex items-center gap-2 text-primary border-b border-border pb-4">
                    <Terminal className="h-5 w-5" />
                    <span className="font-bold tracking-tight">SYSTEM_REDIRECT_PROTOCOL</span>
                </div>

                {/* Main Card */}
                <div className="border border-border bg-card/50 backdrop-blur-sm p-6 md:p-8 rounded-lg shadow-2xl space-y-6 relative overflow-hidden">
                    {/* Background Grid Effect */}
                    <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none" />

                    {/* Status Display */}
                    <div className="relative z-10 flex flex-col items-center justify-center space-y-4 py-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                            <Loader2 className="h-16 w-16 text-primary animate-spin relative z-10" />
                            <span className="absolute inset-0 flex items-center justify-center font-bold text-xl text-foreground z-20">
                                {countdown}
                            </span>
                        </div>
                        <div className="text-center space-y-1">
                            <h2 className="text-lg font-bold text-foreground">
                                Initiating Transfer{dots}
                            </h2>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest">
                                Secure Connection Established
                            </p>
                        </div>
                    </div>

                    {/* Target Info */}
                    <div className="relative z-10 space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground uppercase">
                            <span>Origin</span>
                            <span>Destination</span>
                        </div>
                        <div className="flex items-center gap-3 bg-muted/50 p-3 rounded border border-border/50">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <div className="flex-1 h-px bg-border relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent w-1/2 animate-shimmer" />
                            </div>
                            <ExternalLink className="h-4 w-4 text-primary" />
                        </div>
                        <div className="bg-black/40 p-3 rounded border border-border/30 font-mono text-xs break-all text-muted-foreground">
                            <span className="text-green-500">$</span> target: <span className="text-blue-400">{targetUrl}</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative z-10 w-full bg-muted/30 h-1 mt-6">
                        <div
                            className="bg-primary h-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                            style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Footer / Manual Link */}
                <div className="text-center space-y-4">
                    <a
                        href={targetUrl}
                        className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors group cursor-pointer"
                    >
                        <span>Click manually if redirect fails</span>
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </a>

                    <div className="text-[10px] text-muted-foreground/50 uppercase tracking-widest">
                        Powered by yunkhngn.dev
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                .animate-shimmer {
                    animation: shimmer 1.5s infinite linear;
                }
            `}</style>
        </div>
    );
}
