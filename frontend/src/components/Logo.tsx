import { memo } from "react";

interface LogoProps {
    className?: string;
    onClick?: () => void;
    tagline?: string;
}

export const Logo = memo(({ className, onClick, tagline }: LogoProps) => {
    const Component = tagline ? 'h1' : (onClick ? 'button' : 'div');

    return (
        <Component key="logo" className={`logo ${className || ''}`} onClick={onClick}>
            <span className="logo-text">Type</span>
            <span className="logo-accent">Race</span>
            <span className="logo-io">.io</span>
            {tagline && <span className="logo-tagline">{tagline}</span>}
        </Component>
    );
});
