import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Github, Facebook, Twitter } from 'lucide-react';
import { DefaultNavbar, DefaultFooter } from '@/components/template';

export default function Login() {
    const { login, loginWithGoogle, loginWithGithub, loginWithFacebook, loginWithTwitter } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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

                        <div className="flex items-center justify-between">
                            <Link href="/forgot-password" className="text-sm text-primary hover:underline font-medium">
                                I forgot my password
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Log in'}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-muted-foreground/20" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#FDF3E7] dark:bg-background px-2 text-muted-foreground font-medium">
                                Or log in using:
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <SocialButton onClick={() => handleSocialLogin(loginWithGoogle)} label="Google">
                            {/* Google Icon SVG */}
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                        </SocialButton>

                        <SocialButton onClick={() => handleSocialLogin(loginWithFacebook)} label="Facebook">
                            <Facebook className="w-5 h-5 text-[#1877F2]" fill="currentColor" />
                        </SocialButton>

                        <SocialButton onClick={() => handleSocialLogin(loginWithGithub)} label="Github">
                            <Github className="w-5 h-5" />
                        </SocialButton>

                        <SocialButton onClick={() => handleSocialLogin(loginWithTwitter)} label="Twitter">
                            <Twitter className="w-5 h-5 text-[#1DA1F2]" fill="currentColor" />
                        </SocialButton>

                        <SocialButton label="Apple">
                            {/* Apple Icon SVG */}
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74s2.57-.99 4.31-.82c.72.03 2.26.29 3.32 1.84-2.87 1.76-2.35 5.7 1.11 7.15-.65 1.54-1.54 3.03-2.82 4.06zm-4.08-15.7c.67-1.13 1.7-1.75 2.85-1.58.12 1.25-.65 2.58-1.53 3.33-.88.75-2.05 1.07-2.76.88-.12-1.25.75-2.55 1.44-2.63z" />
                            </svg>
                        </SocialButton>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">Not a member yet? </span>
                        <Link href="/signup" className="text-primary font-medium hover:underline">
                            Sign up for free
                        </Link>
                    </div>
                </div>
            </main>

            <DefaultFooter />
        </div>
    );
}

function SocialButton({ children, onClick, label }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="p-3 border border-input bg-background rounded-md hover:bg-accent transition-colors flex items-center justify-center"
            aria-label={`Log in with ${label}`}
        >
            {children}
        </button>
    );
}
