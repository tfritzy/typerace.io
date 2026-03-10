import { AuthContext, type AuthContextType, type AuthUser } from './AuthContext';

const devUser: AuthUser = {
    uid: 'dev-user-local',
    isAnonymous: true,
    getIdToken: async () => 'dev-token',
};

const noop = async () => {};

const devAuthValue: AuthContextType = {
    user: devUser,
    loading: false,
    signIn: noop,
    signUp: noop,
    signOut: noop,
    resetPassword: noop,
    signInWithGoogle: noop,
    signInWithGithub: noop,
};

interface DevAuthProviderProps {
    children: React.ReactNode;
}

export const DevAuthProvider = ({ children }: DevAuthProviderProps) => {
    return (
        <AuthContext.Provider value={devAuthValue}>
            {children}
        </AuthContext.Provider>
    );
};
