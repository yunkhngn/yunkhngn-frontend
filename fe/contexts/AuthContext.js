import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase/config';

const AuthContext = createContext({
    user: null,
    loading: true,
    signInAnonymously: async () => { },
    signOut: async () => { },
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInAnon = async () => {
        try {
            await signInAnonymously(auth);
        } catch (error) {
            console.error('Error signing in anonymously:', error);
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    // Auto sign-in anonymously if not logged in (for visitors)
    useEffect(() => {
        if (!loading && !user) {
            signInAnon();
        }
    }, [loading, user]);

    return (
        <AuthContext.Provider value={{ user, loading, signInAnonymously: signInAnon, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
