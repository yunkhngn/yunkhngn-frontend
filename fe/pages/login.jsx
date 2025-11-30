import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

import { DefaultNavbar, DefaultFooter, Metadata } from '@/components/template';

export default function Login() {
    const { login, user } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            // Redirect handled by AuthContext or router if needed, but for now just stay or user can navigate
            window.location.href = '/'; // Simple redirect
        } catch (err) {
            setError('Failed to log in. Please check your credentials.');
            console.error(err);
        }
        setLoading(false);
    };

    const handleSocialLogin = async (method) => {
        try {
            await method();
            window.location.href = '/';
        } catch (err) {
            setError('Failed to log in with social provider.');
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#FDF3E7] dark:bg-background">
            <DefaultNavbar />
            <Metadata
                title="Login to Yunkhngn"
                description="Login to Yunkhngn"
            />
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-foreground">Log in to Yunkhngn</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <div className="text-destructive text-sm text-center">{error}</div>}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Email or username<span className="text-destructive">*</span>
                            </label>
                            <Input
                                type="email"
                                required
                                className="bg-background border-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Password<span className="text-destructive">*</span>
                            </label>
                            <Input
                                type="password"
                                required
                                className="bg-background border-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Log in'}
                        </Button>
                    </form>


                </div>
            </main>

            <DefaultFooter />
        </div>
    );
}


