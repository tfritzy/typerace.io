import { Star } from "lucide-react";
import { useEffect, useState } from "react";

interface XpDropProps {
    amount: number;
    onComplete: () => void;
    avatarRef?: HTMLDivElement | null;
}

export const XpDrop = ({ amount, onComplete, avatarRef }: XpDropProps) => {
    const [isVisible, setIsVisible] = useState(true);

    const getPosition = () => {
        if (avatarRef) {
            const rect = avatarRef.getBoundingClientRect();
            return {
                top: rect.top + 70,
                left: rect.left - 65
            };
        }
        return { top: 80, left: 8 };
    };

    const position = getPosition();

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onComplete();
        }, 2500);

        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!isVisible) return null;

    return (
        <div
            className="fixed pointer-events-none z-50"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                animation: 'xpDrop 2.5s linear forwards',
            }}
        >
            <div
                className="flex font-light items-center gap-2 text-(--color-accent)"
            >
                <Star size={20} className="stroke-1 stroke-(--color-accent)" />
                <span>{amount}</span>
            </div>
        </div>
    );
};
