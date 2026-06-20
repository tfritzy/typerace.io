import { Link } from "react-router-dom";
import { useState } from "react";
import { Palette } from "lucide-react";
import { ThemeShowcaseModal } from "./ThemeShowcaseModal";
import { getTranslations } from "../utils/translations";

export const Footer = () => {
    const [showThemeModal, setShowThemeModal] = useState(false);
    const t = getTranslations();

    return (
        <footer className="py-4 px-4">
            <div className="content-container">
                <div className="flex justify-center items-center gap-3 text-sm text-muted-foreground">
                    <Link
                        to="/stats"
                        className="flex items-center gap-1.5 hover:text-foreground/60 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>{t.siteStats}</span>
                    </Link>
                    <span className="opacity-50">|</span >
                    <a
                        href="https://github.com/tfritzy/typerace.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 hover:text-foreground/60 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        <span>GitHub</span>
                    </a>
                    <span className="opacity-50">|</span >
                    <Link
                        to="/privacy-policy"
                        className="flex items-center gap-1.5 hover:text-foreground/60 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>{t.privacyPolicy}</span>
                    </Link>
                    <span className="opacity-50">|</span >
                    <button
                        onClick={() => setShowThemeModal(true)}
                        className="flex items-center gap-1.5 hover:text-foreground/60 transition-colors cursor-pointer bg-transparent border-0 p-0 text-sm text-muted-foreground"
                    >
                        <Palette className="w-4 h-4" />
                        <span>{t.theme}</span>
                    </button>
                </div>
            </div>
            <ThemeShowcaseModal open={showThemeModal} onClose={() => setShowThemeModal(false)} />
        </footer>
    );
};
