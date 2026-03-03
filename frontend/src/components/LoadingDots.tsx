import { Logo } from "./Logo";
import { useEffect, useRef, useMemo } from "react";
import { LanguageSelector } from "./LanguageSelector";
import { StarryBackground } from "./StarryBackground";
import { getLanguageFromSlug } from "../utils/modes";

export const LoadingDots = () => {
    const spinnerRef = useRef<HTMLDivElement>(null);

    const currentLang = useMemo(() => {
        const pathSegment = window.location.pathname.split('/')[1] || '';
        return getLanguageFromSlug(pathSegment || undefined);
    }, []);

    useEffect(() => {
        if (spinnerRef.current) {
            const startTime = (window as any).__spinnerStartTime || Date.now();
            const elapsed = Date.now() - startTime;
            const delay = -(elapsed % 800);
            spinnerRef.current.style.animationDelay = delay + 'ms';
        }
    }, []);

    return (
        <div className="relative h-screen flex flex-col overflow-hidden">
            <StarryBackground />
            <style>
                {`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}
            </style>
            <div className="relative z-10" style={{
                width: '100%',
                padding: '0 1rem'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '1000px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '4rem'
                }}>
                    <Logo />
                    <div
                        ref={spinnerRef}
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            marginLeft: '-16px',
                            marginTop: '-16px',
                            width: '32px',
                            height: '32px',
                            border: '3px solid rgba(255, 255, 255, 0.1)',
                            borderTopColor: 'rgba(255, 255, 255, 0.6)',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite'
                        }}
                    />
                </div>
            </div>
            <LanguageSelector currentLang={currentLang} />
        </div>
    );
};
