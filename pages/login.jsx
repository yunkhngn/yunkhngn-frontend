import Link from 'next/link';
import { Github } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Layout from '@/components/template/Default/Layout';

export default function Login() {
    const { login, user, loginWithGoogle, loginWithGithub } = useAuth();
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
            window.location.href = '/';
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
            setError(err.message || 'Failed to log in with social provider.');

            if (!err.message?.includes('Access Denied') && !err.message?.includes('Unauthorized')) {
                console.error(err);
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center px-4 py-12 min-h-[calc(100vh-200px)]">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground">Log in to Khoa Nguyễn</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="text-destructive text-sm text-center">{error}</div>}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Email or username<span className="text-destructive">*</span>
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-background/50"
                            aria-label="Email Address"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Password<span className="text-destructive">*</span>
                        </label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full font-bold py-2"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Log in'}
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or log in using
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={() => handleSocialLogin(loginWithGoogle)} className="w-full bg-white text-black hover:bg-gray-50 border border-gray-200 dark:bg-white dark:text-black dark:hover:bg-gray-100">
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                        </svg>
                        Google
                    </Button>
                    <Button variant="outline" onClick={() => handleSocialLogin(loginWithGithub)} className="w-full bg-[#24292e] text-white hover:bg-[#24292e]/90 hover:text-white border-transparent dark:bg-white dark:text-black dark:hover:bg-gray-100">
                        <Github className="mr-2 h-4 w-4" />
                        Github
                    </Button>
                </div>


            </div>
        </div>
    );
}

Login.getLayout = function getLayout(page) {
    return (
        <Layout
            title="Login to Khoa Nguyễn"
            description="Login to Khoa Nguyễn"
        >
            {page}
        </Layout>
    );
};


