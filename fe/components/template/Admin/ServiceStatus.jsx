import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, Loader2, RefreshCw, Server, Image, Shield, Sparkles, Mail, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const StatusItem = ({ icon: Icon, label, status }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
        <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-full bg-muted",
                status.status === 'success' && "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
                status.status === 'error' && "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
            )}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <div className="font-medium">{label}</div>
                <div className={cn("text-xs",
                    status.status === 'success' && "text-green-600 dark:text-green-400",
                    status.status === 'error' && "text-red-600 dark:text-red-400",
                    status.status === 'pending' && "text-muted-foreground"
                )}>
                    {status.message}
                </div>
            </div>
        </div>
        <div>
            {status.status === 'pending' && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            {status.status === 'success' && <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />}
            {status.status === 'error' && <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
        </div>
    </div>
);

export default function ServiceStatus() {
    const { user } = useAuth();
    const [statuses, setStatuses] = useState({
        backend: { status: 'pending', message: 'Checking...' },
        cloudinary: { status: 'pending', message: 'Checking...' },
        firebase: { status: 'pending', message: 'Checking...' },
        gemini: { status: 'pending', message: 'Checking...' },
        resend: { status: 'pending', message: 'Checking...' },
        cloudflare: { status: 'pending', message: 'Checking...' },
    });
    const [loading, setLoading] = useState(false);

    const checkServices = useCallback(async () => {
        setLoading(true);
        setStatuses({
            backend: { status: 'pending', message: 'Checking...' },
            cloudinary: { status: 'pending', message: 'Checking...' },
            firebase: { status: 'pending', message: 'Checking...' },
            gemini: { status: 'pending', message: 'Checking...' },
            resend: { status: 'pending', message: 'Checking...' },
            cloudflare: { status: 'pending', message: 'Checking...' },
        });

        // 1. Check Firebase (Client-side)
        if (user) {
            setStatuses(prev => ({ ...prev, firebase: { status: 'success', message: 'Authenticated' } }));
        } else {
            setStatuses(prev => ({ ...prev, firebase: { status: 'error', message: 'Not Authenticated' } }));
        }

        // 2. Check Backend Health & Services
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`);
            if (res.ok) {
                const data = await res.json();
                setStatuses(prev => ({ ...prev, backend: { status: 'success', message: 'Online' } }));

                // Check Gemini
                if (data.services?.gemini) {
                    setStatuses(prev => ({ ...prev, gemini: { status: 'success', message: 'Configured' } }));
                } else {
                    setStatuses(prev => ({ ...prev, gemini: { status: 'error', message: 'Missing Key' } }));
                }

                // Check Resend
                if (data.services?.resend) {
                    setStatuses(prev => ({ ...prev, resend: { status: 'success', message: 'Configured' } }));
                } else {
                    setStatuses(prev => ({ ...prev, resend: { status: 'error', message: 'Missing Key' } }));
                }

                // Check Cloudflare
                if (data.services?.cloudflare) {
                    setStatuses(prev => ({ ...prev, cloudflare: { status: 'success', message: 'Configured' } }));
                } else {
                    setStatuses(prev => ({ ...prev, cloudflare: { status: 'error', message: 'Missing Key' } }));
                }

            } else {
                setStatuses(prev => ({
                    ...prev,
                    backend: { status: 'error', message: `Status: ${res.status}` },
                    gemini: { status: 'error', message: 'Backend Error' },
                    resend: { status: 'error', message: 'Backend Error' },
                    cloudflare: { status: 'error', message: 'Backend Error' }
                }));
            }
        } catch (error) {
            setStatuses(prev => ({
                ...prev,
                backend: { status: 'error', message: 'Unreachable' },
                gemini: { status: 'error', message: 'Unreachable' },
                resend: { status: 'error', message: 'Unreachable' },
                cloudflare: { status: 'error', message: 'Unreachable' }
            }));
        }

        // 3. Check Cloudinary Config (Client-side)
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

        if (cloudName && apiKey) {
            setStatuses(prev => ({ ...prev, cloudinary: { status: 'success', message: 'Configured' } }));
        } else {
            setStatuses(prev => ({ ...prev, cloudinary: { status: 'error', message: 'Missing Config' } }));
        }

        setLoading(false);
    }, [user]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        checkServices();
    }, [checkServices]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">System Status</h3>
                <Button variant="outline" size="sm" onClick={checkServices} disabled={loading}>
                    <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                    Check Status
                </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <StatusItem icon={Server} label="Backend API" status={statuses.backend} />
                <StatusItem icon={Image} label="Cloudinary" status={statuses.cloudinary} />
                <StatusItem icon={Shield} label="Firebase Auth" status={statuses.firebase} />
                <StatusItem icon={Sparkles} label="Gemini AI" status={statuses.gemini} />
                <StatusItem icon={Mail} label="Resend Email" status={statuses.resend} />
                <StatusItem icon={Activity} label="Cloudflare" status={statuses.cloudflare} />
            </div>
        </div>
    );
}
