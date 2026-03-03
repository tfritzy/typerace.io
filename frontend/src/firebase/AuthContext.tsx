import { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithPopup,
    signInAnonymously,
    GoogleAuthProvider,
    GithubAuthProvider,
    type User
} from 'firebase/auth';
import { auth, isFirebaseEnabled } from '../firebase/config';
import { LoadingDots } from '../components/LoadingDots';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isFirebaseEnabled: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signInWithGithub: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

const noOp = async () => {};

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(isFirebaseEnabled);

    useEffect(() => {
        if (!isFirebaseEnabled || !auth) return;

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                try {
                    await signInAnonymously(auth!);
                } catch (error) {
                    console.error('Failed to sign in anonymously:', error);
                    setUser(null);
                    setLoading(false);
                }
            } else {
                setUser(firebaseUser);
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        if (!auth) return;
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signUp = async (email: string, password: string) => {
        if (!auth) return;
        await createUserWithEmailAndPassword(auth, email, password);
    };

    const signOut = async () => {
        if (!auth) return;
        await firebaseSignOut(auth);
    };

    const resetPassword = async (email: string) => {
        if (!auth) return;
        await sendPasswordResetEmail(auth, email);
    };

    const signInWithGoogle = async () => {
        if (!auth) return;
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const signInWithGithub = async () => {
        if (!auth) return;
        const provider = new GithubAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const value: AuthContextType = isFirebaseEnabled ? {
        user,
        loading,
        isFirebaseEnabled,
        signIn,
        signUp,
        signOut,
        resetPassword,
        signInWithGoogle,
        signInWithGithub,
    } : {
        user: null,
        loading: false,
        isFirebaseEnabled,
        signIn: noOp,
        signUp: noOp,
        signOut: noOp,
        resetPassword: noOp,
        signInWithGoogle: noOp,
        signInWithGithub: noOp,
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <LoadingDots /> : children}
        </AuthContext.Provider>
    );
};