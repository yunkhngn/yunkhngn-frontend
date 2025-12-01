import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';

export function useUnsavedChanges(isDirty) {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [nextUrl, setNextUrl] = useState(null);
    const isConfirmed = useRef(false);

    useEffect(() => {
        const handleWindowClose = (e) => {
            if (!isDirty) return;
            e.preventDefault();
            return (e.returnValue = 'You have unsaved changes. Are you sure you want to leave?');
        };

        const handleBrowseAway = (url) => {
            if (!isDirty || isConfirmed.current) return;
            
            setNextUrl(url);
            setShowModal(true);
            
            router.events.emit('routeChangeError');
            // Throwing an error is the only way to cancel route change in Next.js Pages Router
            throw 'routeChange aborted.';
        };

        window.addEventListener('beforeunload', handleWindowClose);
        router.events.on('routeChangeStart', handleBrowseAway);

        return () => {
            window.removeEventListener('beforeunload', handleWindowClose);
            router.events.off('routeChangeStart', handleBrowseAway);
        };
    }, [isDirty, router]);

    const confirmNavigation = () => {
        if (nextUrl) {
            isConfirmed.current = true;
            setShowModal(false);
            router.push(nextUrl);
        }
    };

    return { 
        showModal, 
        setShowModal, 
        confirmNavigation 
    };
}

