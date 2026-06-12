import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { readNestJson } from '@/lib/api/readJson';
import { loadFirebaseAuth } from '@/lib/firebase/lazy';
import { setApiTokenGetter } from '@/lib/api/tokenGetter';
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
    const hasLoggedOut = useRef(false);

    useEffect(() => {
        let unsubscribe = () => {};
        let cancelled = false;

        loadFirebaseAuth().then(({ auth, authMod }) => {
            if (cancelled) return;
            if (!auth) {
                setLoading(false);
                return;
            }

            setApiTokenGetter(async () => {
                const current = auth.currentUser;
                return current ? current.getIdToken() : null;
            });

            unsubscribe = authMod.onAuthStateChanged(auth, async (user) => {
                if (isLoggingIn.current) return;

                if (user) {
                    try {
                        // Skip database check for anonymous users
                        if (user.isAnonymous) {
                            setUser(user);
                        } else {
                            const token = await user.getIdToken();
                            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            });
                            if (res.ok) {
                                const profile = await readNestJson(res);
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
                                await authMod.signOut(auth);
                                setUser(null);
                            }
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
        });

        return () => {
            cancelled = true;
            unsubscribe();
        };
    }, []);

    const signInAnon = async () => {
        const { auth, authMod } = await loadFirebaseAuth();
        if (!auth) {
            throw new Error('Firebase is not configured');
        }
        try {
            const result = await authMod.signInAnonymously(auth);
            hasLoggedOut.current = false;
            return result;
        } catch (error) {
            console.error('Error signing in anonymously:', error);
            throw error;
        }
    };

    const login = async (email, password) => {
        const { auth, authMod } = await loadFirebaseAuth();
        if (!auth) {
            throw new Error('Firebase is not configured');
        }
        return authMod.signInWithEmailAndPassword(auth, email, password);
    };

    // Shared popup flow for providers that require an existing ADMIN account.
    const loginWithValidatedProvider = async (createProvider) => {
        const { auth, authMod } = await loadFirebaseAuth();
        if (!auth) {
            throw new Error('Firebase is not configured');
        }
        isLoggingIn.current = true;
        try {
            const result = await authMod.signInWithPopup(auth, createProvider(authMod));
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

            const profile = await readNestJson(res);
            if (profile.role !== 'ADMIN') {
                await user.delete();
                toast.error('Unauthorized: Access restricted to Admins.');
                throw new Error('Access Denied: Account deleted');
            }

            user.avatarUrl = profile.avatarUrl;
            if (profile.name) user.displayName = profile.name;
            user.role = profile.role;
            setUser(user);

            return result;
        } catch (error) {
            console.error("Login validation failed:", error);
            if (auth?.currentUser) await authMod.signOut(auth);
            throw error;
        } finally {
            isLoggingIn.current = false;
        }
    };

    const loginWithGoogle = () =>
        loginWithValidatedProvider((authMod) => new authMod.GoogleAuthProvider());

    const loginWithGithub = () =>
        loginWithValidatedProvider((authMod) => new authMod.GithubAuthProvider());

    const loginWithFacebook = async () => {
        const { auth, authMod } = await loadFirebaseAuth();
        if (!auth) {
            throw new Error('Firebase is not configured');
        }
        return authMod.signInWithPopup(auth, new authMod.FacebookAuthProvider());
    };

    const loginWithTwitter = async () => {
        const { auth, authMod } = await loadFirebaseAuth();
        if (!auth) {
            throw new Error('Firebase is not configured');
        }
        return authMod.signInWithPopup(auth, new authMod.TwitterAuthProvider());
    };

    const signOut = async () => {
        const { auth, authMod } = await loadFirebaseAuth();
        if (!auth) return;
        try {
            hasLoggedOut.current = true;
            await authMod.signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

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
