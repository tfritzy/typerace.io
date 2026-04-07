import { memo } from "react";

interface LogoProps {
    className?: string;
    onClick?: () => void;
    tagline?: string;
}

export const Logo = memo(({ className, onClick, tagline }: LogoProps) => {
    const nameContent = (
        <>
            <span className="logo-text">Type</span>
            <span className="logo-accent">Race</span>
            <span className="logo-io">.io</span>
        </>
    );

    if (tagline) {
        const inner = onClick ? (
            <button className="logo-button" onClick={onClick}>
                {nameContent}
                <span className="logo-separator">—</span>
                <span className="logo-tagline">{tagline}</span>
            </button>
        ) : (
            <>
                {nameContent}
                <span className="logo-separator">—</span>
                <span className="logo-tagline">{tagline}</span>
            </>
        );

        return <h1 className={`logo ${className || ''}`}>{inner}</h1>;
    }

    const Component = onClick ? 'button' : 'div';
    return (
        <Component key="logo" className={`logo ${className || ''}`} onClick={onClick}>
            {nameContent}
        </Component>
    );
});
