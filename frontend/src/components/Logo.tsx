import { memo } from "react";

interface LogoProps {
    className?: string;
    onClick?: () => void;
    tagline?: string;
}

export const Logo = memo(({ className, onClick, tagline }: LogoProps) => {
    const logoContent = (
        <>
            <span className="logo-text">Type</span>
            <span className="logo-accent">Race</span>
            <span className="logo-io">.io</span>
            {tagline && <span className="logo-tagline">{tagline}</span>}
        </>
    );

    if (tagline) {
        return (
            <h1 className={`logo ${className || ''}`}>
                {onClick ? (
                    <button className="logo-button" onClick={onClick}>{logoContent}</button>
                ) : logoContent}
            </h1>
        );
    }

    const Component = onClick ? 'button' : 'div';
    return (
        <Component key="logo" className={`logo ${className || ''}`} onClick={onClick}>
            {logoContent}
        </Component>
    );
});
