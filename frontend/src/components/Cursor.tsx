import { memo, useLayoutEffect, useRef, useState, type RefObject } from "react";

const CURSOR_SPEED_MULTIPLIER = 2;

type CursorProps = {
  targetRef: RefObject<HTMLElement | null>;
  lerp?: number;
  fadeDelay?: number;
  visible?: boolean;
};

export const Cursor = memo(
  ({
    targetRef,
    lerp = 0.3,
    fadeDelay = 2000,
    visible = true,
  }: CursorProps) => {
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

        if (
          newTarget.x !== target.current.x ||
          newTarget.y !== target.current.y
        ) {
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

      let previousFrameTime: number | null = null;

      const animate = (frameTime: number) => {
        updateTarget();

        const deltaTime =
          previousFrameTime === null
            ? 1000 / 60
            : frameTime - previousFrameTime;
        previousFrameTime = frameTime;

        const normalizedLerp = Math.min(Math.max(lerp, 0), 1);
        const frameIndependentLerp =
          1 -
          Math.pow(
            1 - normalizedLerp,
            (CURSOR_SPEED_MULTIPLIER * deltaTime) / (1000 / 60),
          );

        position.current.x +=
          (target.current.x - position.current.x) * frameIndependentLerp;
        position.current.y +=
          (target.current.y - position.current.y) * frameIndependentLerp;

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
        className={`max-w-0 h-10 -translate-y-px fixed top-0 -translate-x-0.5 left-0  ${isBlinking && visible ? "animate-blink" : ""}`}
        style={{ opacity: visible ? 1 : 0 }}
      >
        <div className="h-full rounded-full border-r-2 border-r-accent" />
      </div>
    );
  },
);
