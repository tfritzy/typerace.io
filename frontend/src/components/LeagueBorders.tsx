import { ReactNode } from 'react';

type LeagueBorderComponentProps = {
    children: ReactNode;
    size?: number;
    className?: string;
};

export const BronzeBorder = ({ children, size, className = '' }: LeagueBorderComponentProps) => {
    return (
        <div 
            className={`relative shrink-0 border-2 rounded-full border-amber-700 shadow-[0_0_10px_rgba(180,83,9,0.5)] ${className}`}
            style={size ? { width: size, height: size } : undefined}
        >
            {children}
        </div>
    );
};

export const SilverBorder = ({ children, size, className = '' }: LeagueBorderComponentProps) => {
    return (
        <div 
            className={`relative shrink-0 border-2 rounded-full border-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.5)] ${className}`}
            style={size ? { width: size, height: size } : undefined}
        >
            {children}
        </div>
    );
};

export const GoldBorder = ({ children, size, className = '' }: LeagueBorderComponentProps) => {
    return (
        <div 
            className={`relative shrink-0 border-2 rounded-full border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)] ${className}`}
            style={size ? { width: size, height: size } : undefined}
        >
            {children}
        </div>
    );
};

export const PlatinumBorder = ({ children, size, className = '' }: LeagueBorderComponentProps) => {
    return (
        <div 
            className={`relative shrink-0 border-2 rounded-full border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] ${className}`}
            style={size ? { width: size, height: size } : undefined}
        >
            {children}
        </div>
    );
};

export const DiamondBorder = ({ children, size, className = '' }: LeagueBorderComponentProps) => {
    return (
        <div 
            className={`relative shrink-0 border-2 rounded-full border-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)] ${className}`}
            style={size ? { width: size, height: size } : undefined}
        >
            {children}
        </div>
    );
};

export const MasterBorder = ({ children, size, className = '' }: LeagueBorderComponentProps) => {
    return (
        <div 
            className={`relative shrink-0 border-2 rounded-full border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] ${className}`}
            style={size ? { width: size, height: size } : undefined}
        >
            {children}
        </div>
    );
};
