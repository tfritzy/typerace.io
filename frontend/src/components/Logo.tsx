import { memo } from "react";

interface LogoProps {
    className?: string;
    onClick?: () => void;
}

export const Logo = memo(({ className, onClick }: LogoProps) => {
    const Component = onClick ? 'button' : 'div';

    return (
        <Component key="logo" className={`logo ${className || ''}`} onClick={onClick}><span className="logo-text">Type</span><span className="logo-accent">Race</span><span className="logo-io">.io</span></Component>
    );
});
