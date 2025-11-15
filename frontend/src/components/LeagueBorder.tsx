import { ReactNode } from 'react';
import { League } from '../types/league';

type LeagueBorderProps = {
    league: League;
    children: ReactNode;
    size?: number;
    className?: string;
};

const leagueStyles: Record<League, { borderColor: string; glowColor: string }> = {
    [League.Bronze]: {
        borderColor: 'border-amber-700',
        glowColor: 'shadow-[0_0_10px_rgba(180,83,9,0.5)]',
    },
    [League.Silver]: {
        borderColor: 'border-slate-400',
        glowColor: 'shadow-[0_0_10px_rgba(148,163,184,0.5)]',
    },
    [League.Gold]: {
        borderColor: 'border-yellow-400',
        glowColor: 'shadow-[0_0_10px_rgba(250,204,21,0.5)]',
    },
    [League.Platinum]: {
        borderColor: 'border-cyan-400',
        glowColor: 'shadow-[0_0_10px_rgba(34,211,238,0.5)]',
    },
    [League.Diamond]: {
        borderColor: 'border-blue-400',
        glowColor: 'shadow-[0_0_10px_rgba(96,165,250,0.5)]',
    },
    [League.Master]: {
        borderColor: 'border-purple-500',
        glowColor: 'shadow-[0_0_10px_rgba(168,85,247,0.5)]',
    },
};

export const LeagueBorder = ({ league, children, size, className = '' }: LeagueBorderProps) => {
    const style = leagueStyles[league];
    
    return (
        <div 
            className={`relative shrink-0 border-2 rounded-full ${style.borderColor} ${style.glowColor} ${className}`}
            style={size ? { width: size, height: size } : undefined}
        >
            {children}
        </div>
    );
};
