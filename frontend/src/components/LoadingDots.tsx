import { Logo } from "./Logo";
import { useEffect, useRef } from "react";
import { isNonDefaultFont } from "../utils/themes";

export const LoadingDots = () => {
    const spinnerRef = useRef<HTMLDivElement>(null);
    const showLogo = !isNonDefaultFont();

    useEffect(() => {
        if (spinnerRef.current) {
            const startTime = (window as any).__spinnerStartTime || Date.now();
            const elapsed = Date.now() - startTime;
            const delay = -(elapsed % 800);
            spinnerRef.current.style.animationDelay = delay + 'ms';
        }
    }, []);

    return (
        <div className="w-full px-4">
            <style>
                {`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}
            </style>
            <div className="w-full max-w-[1000px] mx-auto flex justify-between items-center h-16">
                {showLogo && <Logo />}
                <div
                    ref={spinnerRef}
                    className="fixed top-1/2 left-1/2 -ml-4 -mt-4 w-8 h-8 border-[3px] border-border border-t-muted-foreground rounded-full"
                    style={{
                        animation: 'spin 0.8s linear infinite'
                    }}
                />
            </div>
        </div>
    );
};
