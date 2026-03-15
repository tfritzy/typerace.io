import { memo, useLayoutEffect, useRef, useState, type RefObject } from "react";

type CursorProps = {
    targetRef: RefObject<HTMLElement | null>;
    lerp?: number;
    fadeDelay?: number;
    visible?: boolean;
    color?: string;
};

export const Cursor = memo(({ targetRef, lerp = .2, fadeDelay = 2000, visible = true, color }: CursorProps) => {
    const followerRef = useRef<HTMLDivElement>(null);
    const position = useRef({ x: 0, y: 0 });
    const target = useRef({ x: 0, y: 0 });
    const initialized = useRef(false);
    const lastMoveTime = useRef(Date.now());
    const [isBlinking, setIsBlinking] = useState(false);

    useLayoutEffect(() => {
        if (!targetRef?.current || !followerRef.current) return;

        const updateTarget = () => {
            if (!targetRef?.current || !followerRef.current) return;
            const targetRect = targetRef.current.getBoundingClientRect();
            const followerRect = followerRef.current.getBoundingClientRect();

            const newTarget = {
                x: targetRect.left - followerRect.width / 2,
                y: targetRect.top + (targetRect.height - followerRect.height) / 2,
            };

            if (newTarget.x !== target.current.x || newTarget.y !== target.current.y) {
                lastMoveTime.current = Date.now();
                setIsBlinking(false);
            }

            target.current = newTarget;

            if (!initialized.current) {
                position.current = { ...target.current };
                initialized.current = true;
                followerRef.current.style.transform = `translate(${position.current.x}px, ${position.current.y}px)`;
            }
        };

        const animate = () => {
            updateTarget();

            position.current.x += (target.current.x - position.current.x) * lerp;
            position.current.y += (target.current.y - position.current.y) * lerp;

            if (followerRef.current) {
                followerRef.current.style.transform = `translate(${position.current.x}px, ${position.current.y}px)`;
            }

            rafId = requestAnimationFrame(animate);
        };

        updateTarget();

        let rafId = requestAnimationFrame(animate);

        const fadeInterval = setInterval(() => {
            const timeSinceMove = Date.now() - lastMoveTime.current;
            if (timeSinceMove >= fadeDelay) {
                setIsBlinking(true);
            }
        }, 100);

        window.addEventListener("scroll", updateTarget);
        window.addEventListener("resize", updateTarget);

        return () => {
            cancelAnimationFrame(rafId);
            clearInterval(fadeInterval);
            window.removeEventListener("scroll", updateTarget);
            window.removeEventListener("resize", updateTarget);
            initialized.current = false;
        };
    }, [targetRef, lerp, fadeDelay]);

    return (
        <div
            ref={followerRef}
            className={`max-w-0 h-8 -translate-y-px fixed -top-0.5 left-0 ${isBlinking && visible ? 'animate-blink' : ''}`}
            style={{ opacity: visible ? 1 : 0 }}
        >
            <div className="h-full rounded-full border-r-2" style={{ borderColor: color || 'var(--color-accent)' }} />
        </div>
    );
});
