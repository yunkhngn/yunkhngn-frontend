import React from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-background rounded-lg border border-border m-4 shadow-sm">
                    <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                    <h2 className="text-2xl font-bold mb-2 font-serif">Something went wrong</h2>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        We apologize for the inconvenience. An unexpected error occurred.
                    </p>
                    <div className="flex gap-4">
                        <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
                            <RefreshCw className="h-4 w-4" /> Reload Page
                        </Button>
                        <Link href="/">
                            <Button className="gap-2">
                                <Home className="h-4 w-4" /> Go Home
                            </Button>
                        </Link>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
