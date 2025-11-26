interface LogoProps {
    className?: string;
    onClick?: () => void;
}

export const Logo = ({ className, onClick }: LogoProps) => {
    const Component = onClick ? 'button' : 'div';

    return (
        <Component className={`logo ${className || ''}`} onClick={onClick}>
            <span className="logo-text">type</span>
            <span className="logo-accent">race</span>
            <span className="logo-io">.io</span>
        </Component>
    );
};
