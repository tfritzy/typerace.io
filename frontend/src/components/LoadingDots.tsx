import { Logo } from "./Logo";
import { useEffect, useRef } from "react";

export const LoadingDots = () => {
    const spinnerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (spinnerRef.current) {
            const startTime = (window as any).__spinnerStartTime || Date.now();
            const elapsed = Date.now() - startTime;
            const delay = -(elapsed % 800);
            spinnerRef.current.style.animationDelay = delay + 'ms';
        }
    }, []);

    return (
        <div style={{
            width: '100%',
            padding: '0 1rem'
        }}>
            <style>
                {`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}
            </style>
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
                        border: '3px solid var(--border)',
                        borderTopColor: 'var(--muted-foreground)',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                    }}
                />
            </div>
        </div>
    );
};
