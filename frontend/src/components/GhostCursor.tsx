import { memo, useEffect, useRef } from "react";
import { followPoint } from "../utils/smoothMotion";

type GhostCursorProps = {
    charIndex: number;
    color: string;
};

export const GhostCursor = memo(({ charIndex, color }: GhostCursorProps) => {
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
        let measuredTarget: Element | null = null;

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
            measuredTarget = targetEl;
            const targetRect = targetEl.getBoundingClientRect();

            target.current.x = targetRect.left;
            target.current.y = targetRect.bottom - 2;

            if (!initialized.current) {
                position.current.x = target.current.x;
                position.current.y = target.current.y;
                initialized.current = true;
                followerRef.current.style.transform = `translate3d(${position.current.x}px, ${position.current.y}px, 0)`;
            }
        };

        let previousFrameTime: number | null = null;

        const animate = (frameTime: number) => {
            if (measuredTarget !== findTarget()) updateTarget();

            const elapsedMs = previousFrameTime === null
                ? 1000 / 60
                : frameTime - previousFrameTime;
            previousFrameTime = frameTime;
            followPoint(position.current, target.current, elapsedMs);

            if (followerRef.current) {
                followerRef.current.style.transform = `translate3d(${position.current.x}px, ${position.current.y}px, 0)`;
            }

            rafId = requestAnimationFrame(animate);
        };

        updateTarget();

        let rafId = requestAnimationFrame(animate);

        window.addEventListener("scroll", updateTarget, true);
        window.addEventListener("resize", updateTarget);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("scroll", updateTarget, true);
            window.removeEventListener("resize", updateTarget);
            initialized.current = false;
            cachedIndex.current = -1;
            cachedEl.current = null;
        };
    }, []);

    return (
        <div
            ref={followerRef}
            className="fixed top-0 left-0 pointer-events-none opacity-20 w-[10px] h-[2px]"
            style={{ backgroundColor: color, willChange: "transform" }}
        />
    );
});
