import { useEffect } from "react";
import { Header } from "../components/Header";
import { getDefaultSiteTitle } from "../utils/modes";

export const PrivacyPolicyPage = () => {
    useEffect(() => {
        document.title = "Privacy Policy - TypeRace.io";
        return () => { document.title = getDefaultSiteTitle(); };
    }, []);

    return (
        <div className="relative h-full flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-4">
                <div className="content-container">
                    <div className="box p-8 my-8 text-foreground">
                        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
                        <p className="text-sm text-muted-foreground mb-6">Last Updated: November 22, 2024</p>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-3">Introduction</h2>
                            <p className="mb-3 leading-relaxed">
                                TypeRace.io ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our typing game application.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
                            
                            <h3 className="text-xl font-semibold mb-2 mt-4">Account Information</h3>
                            <p className="mb-3 leading-relaxed">
                                When you create an account, we collect:
                            </p>
                            <ul className="list-disc list-inside mb-3 ml-4 leading-relaxed">
                                <li>Email address (when using email authentication)</li>
                                <li>Authentication credentials from third-party providers (Google, GitHub)</li>
                                <li>Display name you choose for your profile</li>
                            </ul>

                            <h3 className="text-xl font-semibold mb-2 mt-4">Game Data</h3>
                            <p className="mb-3 leading-relaxed">
                                During gameplay, we automatically collect:
                            </p>
                            <ul className="list-disc list-inside mb-3 ml-4 leading-relaxed">
                                <li>Typing speed and accuracy metrics (words per minute, error rates)</li>
                                <li>Game results and performance statistics</li>
                                <li>Experience points (XP) and player level</li>
                                <li>ELO ratings for competitive matches</li>
                                <li>Game history and records</li>
                                <li>Total words typed and games played</li>
                                <li>Profile customization preferences (avatar color)</li>
                            </ul>

                            <h3 className="text-xl font-semibold mb-2 mt-4">Anonymous Usage</h3>
                            <p className="mb-3 leading-relaxed">
                                You can play anonymously without creating an account. In anonymous mode, we assign you a temporary identifier but do not collect personally identifiable information. Anonymous gameplay data is retained only for the duration of your session.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-3">How We Use Your Information</h2>
                            <p className="mb-3 leading-relaxed">
                                We use the collected information for the following purposes:
                            </p>
                            <ul className="list-disc list-inside mb-3 ml-4 leading-relaxed">
                                <li>To provide and maintain our game services</li>
                                <li>To authenticate your account and manage user sessions</li>
                                <li>To track your progress, statistics, and achievements</li>
                                <li>To enable multiplayer matchmaking and leaderboards</li>
                                <li>To calculate and display ELO ratings and rankings</li>
                                <li>To personalize your gaming experience</li>
                                <li>To analyze and improve game performance and user experience</li>
                                <li>To detect and prevent cheating or abuse</li>
                            </ul>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-3">Data Storage and Security</h2>
                            <p className="mb-3 leading-relaxed">
                                Your data is stored using SpacetimeDB, a distributed database system, and Firebase Authentication services. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                            </p>
                            <p className="mb-3 leading-relaxed">
                                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee its absolute security.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-3">Data Sharing and Disclosure</h2>
                            <p className="mb-3 leading-relaxed">
                                We do not sell, trade, or rent your personal information to third parties. We may share information in the following circumstances:
                            </p>
                            <ul className="list-disc list-inside mb-3 ml-4 leading-relaxed">
                                <li><strong>Public Game Data:</strong> Your display name, statistics, and game results are visible to other players in public matches and on leaderboards</li>
                                <li><strong>Service Providers:</strong> We use Firebase (Google) and SpacetimeDB for authentication and data storage services</li>
                                <li><strong>Legal Requirements:</strong> We may disclose your information if required by law or in response to valid legal requests</li>
                            </ul>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-3">Third-Party Services</h2>
                            <p className="mb-3 leading-relaxed">
                                Our application uses the following third-party services:
                            </p>
                            <ul className="list-disc list-inside mb-3 ml-4 leading-relaxed">
                                <li><strong>Firebase Authentication:</strong> For user authentication and account management (Google's Privacy Policy applies)</li>
                                <li><strong>Google Sign-In:</strong> When you choose to sign in with Google (Google's Privacy Policy applies)</li>
                                <li><strong>GitHub Sign-In:</strong> When you choose to sign in with GitHub (GitHub's Privacy Policy applies)</li>
                            </ul>
                            <p className="mb-3 leading-relaxed">
                                These services may collect information as described in their respective privacy policies.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-3">Your Rights and Choices</h2>
                            <p className="mb-3 leading-relaxed">
                                You have the following rights regarding your personal information:
                            </p>
                            <ul className="list-disc list-inside mb-3 ml-4 leading-relaxed">
                                <li><strong>Access:</strong> You can view your profile information and game statistics at any time</li>
                                <li><strong>Modification:</strong> You can update your display name and profile preferences through your profile settings</li>
                                <li><strong>Deletion:</strong> You can request account deletion by signing out and no longer using the service</li>
                                <li><strong>Anonymous Play:</strong> You can choose to play without creating an account</li>
                            </ul>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-3">Data Retention</h2>
                            <p className="mb-3 leading-relaxed">
                                We retain your account information and game data for as long as your account is active or as needed to provide you services. Game records and statistics may be retained to maintain the integrity of leaderboards and historical data.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-3">Children's Privacy</h2>
                            <p className="mb-3 leading-relaxed">
                                Our service is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-3">Cookies and Tracking Technologies</h2>
                            <p className="mb-3 leading-relaxed">
                                We use browser local storage and session storage to maintain your authentication state and game preferences. These are essential for the functionality of the application.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-3">International Data Transfers</h2>
                            <p className="mb-3 leading-relaxed">
                                Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that are different from the laws of your country.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-3">Changes to This Privacy Policy</h2>
                            <p className="mb-3 leading-relaxed">
                                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
                            <p className="mb-3 leading-relaxed">
                                If you have any questions about this Privacy Policy or our data practices, please contact us through our GitHub repository at:
                            </p>
                            <p className="mb-3 leading-relaxed">
                                <a 
                                    href="https://github.com/tfritzy/typerace.io" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-accent-primary hover:text-accent-light underline"
                                >
                                    https://github.com/tfritzy/typerace.io
                                </a>
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};
