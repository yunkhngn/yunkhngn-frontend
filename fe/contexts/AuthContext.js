import { createContext, useContext, useEffect, useState } from 'react';
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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
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
                    }
                } catch (error) {
                    console.error('Failed to fetch user profile:', error);
                }
            }
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

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const loginWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    };

    const loginWithGithub = () => {
        const provider = new GithubAuthProvider();
        return signInWithPopup(auth, provider);
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
