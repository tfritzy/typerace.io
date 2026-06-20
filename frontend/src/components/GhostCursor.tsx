import { memo, useEffect, useRef } from "react";

type GhostCursorProps = {
    charIndex: number;
    lerp?: number;
    color: string;
};

export const GhostCursor = memo(({ charIndex, lerp = 0.15, color }: GhostCursorProps) => {
    const followerRef = useRef<HTMLDivElement>(null);
    const position = useRef({ x: 0, y: 0 });
    const target = useRef({ x: 0, y: 0 });
    const initialized = useRef(false);
    const charIndexRef = useRef(charIndex);
    charIndexRef.current = charIndex;
    const cachedIndex = useRef(-1);
    const cachedEl = useRef<Element | null>(null);

    useEffect(() => {
        if (!followerRef.current) return;

        const findTarget = () => {
            if (cachedIndex.current !== charIndexRef.current) {
                cachedIndex.current = charIndexRef.current;
                cachedEl.current = document.querySelector(`[data-char-index="${charIndexRef.current}"]`);
            }
            return cachedEl.current;
        };

        const updateTarget = () => {
            const targetEl = findTarget();
            if (!targetEl || !followerRef.current) return;
            const targetRect = targetEl.getBoundingClientRect();

            const newTarget = {
                x: targetRect.left,
                y: targetRect.bottom - 2,
            };

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

        window.addEventListener("scroll", updateTarget);
        window.addEventListener("resize", updateTarget);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("scroll", updateTarget);
            window.removeEventListener("resize", updateTarget);
            initialized.current = false;
            cachedIndex.current = -1;
            cachedEl.current = null;
        };
    }, [lerp]);

    return (
        <div
            ref={followerRef}
            className="fixed top-0 left-0 pointer-events-none opacity-20 w-[10px] h-[2px]"
            style={{ backgroundColor: color }}
        />
    );
});
