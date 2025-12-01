import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { 
    onAuthStateChanged, 
    signInAnonymously, 
    signOut as firebaseSignOut,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    GithubAuthProvider,
    FacebookAuthProvider,
    TwitterAuthProvider
} from 'firebase/auth';
import { auth } from '../lib/firebase/config';
import { toast } from 'sonner';

const AuthContext = createContext({
    user: null,
    loading: true,
    signInAnonymously: async () => { },
    login: async (email, password) => { },
    loginWithGoogle: async () => { },
    loginWithGithub: async () => { },
    loginWithFacebook: async () => { },
    loginWithTwitter: async () => { },
    signOut: async () => { },
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const isLoggingIn = useRef(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (isLoggingIn.current) return;

            if (user) {
                try {
                    const token = await user.getIdToken();
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    if (res.ok) {
                        const profile = await res.json();
                        // Merge profile data
                        user.avatarUrl = profile.avatarUrl;
                        if (profile.name) {
                            user.displayName = profile.name;
                        }
                        user.role = profile.role;
                        setUser(user);
                    } else {
                        // User not in DB
                        console.error('User not found in database');
                        await firebaseSignOut(auth);
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Failed to fetch user profile:', error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
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

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const loginWithGoogle = async () => {
        isLoggingIn.current = true;
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const token = await user.getIdToken();

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                await user.delete();
                toast.error('Unauthorized: Account not found in system.');
                throw new Error('Unauthorized: Account deleted');
            }

            const profile = await res.json();
            if (profile.role !== 'ADMIN') {
                await firebaseSignOut(auth);
                toast.error('Unauthorized: Access restricted to Admins.');
                throw new Error('Access Denied: Admins only');
            }

            user.avatarUrl = profile.avatarUrl;
            if (profile.name) user.displayName = profile.name;
            user.role = profile.role;
            setUser(user);

            return result;
        } catch (error) {
            console.error("Login validation failed:", error);
            if (auth.currentUser) await firebaseSignOut(auth);
            throw error;
        } finally {
            isLoggingIn.current = false;
        }
    };

    const loginWithGithub = async () => {
        isLoggingIn.current = true;
        const provider = new GithubAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const token = await user.getIdToken();

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                await user.delete();
                toast.error('Unauthorized: Account not found in system.');
                throw new Error('Unauthorized: Account deleted');
            }

            const profile = await res.json();
            if (profile.role !== 'ADMIN') {
                await firebaseSignOut(auth);
                toast.error('Unauthorized: Access restricted to Admins.');
                throw new Error('Access Denied: Admins only');
            }

            user.avatarUrl = profile.avatarUrl;
            if (profile.name) user.displayName = profile.name;
            user.role = profile.role;
            setUser(user);

            return result;
        } catch (error) {
            console.error("Login validation failed:", error);
            if (auth.currentUser) await firebaseSignOut(auth);
            throw error;
        } finally {
            isLoggingIn.current = false;
        }
    };

    const loginWithFacebook = () => {
        const provider = new FacebookAuthProvider();
        return signInWithPopup(auth, provider);
    };

    const loginWithTwitter = () => {
        const provider = new TwitterAuthProvider();
        return signInWithPopup(auth, provider);
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    // Auto sign-in anonymously if not logged in (for visitors)
    // useEffect(() => {
    //     if (!loading && !user) {
    //         signInAnon();
    //     }
    // }, [loading, user]);

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            signInAnonymously: signInAnon, 
            login,
            loginWithGoogle,
            loginWithGithub,
            loginWithFacebook,
            loginWithTwitter,
            signOut 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
