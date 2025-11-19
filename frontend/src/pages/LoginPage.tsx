import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";
import { Header } from "../components/Header";

export const LoginPage = () => {
    const navigate = useNavigate();
    const { signIn, signUp, signInWithGoogle, signInWithGithub, signInWithDiscord } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(false);

    const handleSocialSignIn = async (provider: 'google' | 'github' | 'discord') => {
        setError("");
        setLoading(true);

        try {
            if (provider === 'google') {
                await signInWithGoogle();
            } else if (provider === 'github') {
                await signInWithGithub();
            } else if (provider === 'discord') {
                await signInWithDiscord();
            }
            navigate("/");
        } catch (err: any) {
            if (err.code === "auth/popup-closed-by-user") {
                setError("Sign-in cancelled");
            } else if (err.code === "auth/account-exists-with-different-credential") {
                setError("An account already exists with this email");
            } else {
                setError(err.message || "An error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            try {
                await signIn(email, password);
            } catch (signInError: any) {
                if (signInError.code === "auth/user-not-found" || signInError.code === "auth/wrong-password") {
                    await signUp(email, password);
                } else {
                    throw signInError;
                }
            }
            navigate("/");
        } catch (err: any) {
            if (err.code === "auth/email-already-in-use") {
                setError("Email already in use");
            } else if (err.code === "auth/invalid-email") {
                setError("Invalid email address");
            } else if (err.code === "auth/invalid-credential") {
                setError("Invalid email or password");
            } else {
                setError(err.message || "An error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <Header hideAvatar={true} />

            <div className="flex flex-col items-center justify-center px-4 pt-20">
                <div className="w-full max-w-md">
                    <div className="bg-[#272727] border border-white/15 rounded-lg p-8 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                        <h1 className="text-white text-2xl font-bold text-center mb-8">
                            Sign in to TypeRace
                        </h1>

                        <div className="space-y-3 mb-6">
                            <button
                                onClick={() => handleSocialSignIn('google')}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-white/90 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Continue with Google
                            </button>

                            <button
                                onClick={() => handleSocialSignIn('github')}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-white/90 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5 fill-gray-900" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                                Continue with GitHub
                            </button>

                            <button
                                onClick={() => handleSocialSignIn('discord')}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                                </svg>
                                Continue with Discord
                            </button>

                            {!showEmailForm ? (
                                <button
                                    onClick={() => setShowEmailForm(true)}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Continue with Email
                                </button>
                            ) : (
                                <div className="bg-white/5 border border-white/15 rounded-lg p-4">
                                    <form onSubmit={handleEmailSubmit} className="space-y-3">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-[#1a1a1a] text-white border border-white/15 rounded-lg px-4 py-2.5 outline-none focus:border-white/30 transition-colors text-sm"
                                            placeholder="Email"
                                            required
                                            autoFocus
                                        />

                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-[#1a1a1a] text-white border border-white/15 rounded-lg px-4 py-2.5 outline-none focus:border-white/30 transition-colors text-sm"
                                            placeholder="Password"
                                            required
                                        />

                                        {error && (
                                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-xs">
                                                {error}
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex-1 bg-(--color-accent) hover:bg-(--color-accent-dark) text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                            >
                                                {loading ? "Loading..." : "Continue"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowEmailForm(false);
                                                    setError("");
                                                }}
                                                className="px-4 bg-white/5 hover:bg-white/10 text-white/70 font-medium rounded-lg transition-colors text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => navigate("/")}
                                className="text-white/50 hover:text-white/70 transition-colors text-sm"
                            >
                                Continue as guest
                            </button>
                        </div>
                    </div>

                    <p className="mt-6 text-center text-white/40 text-xs">
                        By continuing, you agree to save your progress and game history
                    </p>
                </div>
            </div>
        </div>
    );
};
