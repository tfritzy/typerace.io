import { memo, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { followPoint } from "../utils/smoothMotion";

type CursorProps = {
  targetRef: RefObject<HTMLElement | null>;
  fadeDelay?: number;
  visible?: boolean;
  color?: string;
};

export const Cursor = memo(
  ({
    targetRef,
    fadeDelay = 2000,
    visible = true,
    color,
  }: CursorProps) => {
    const followerRef = useRef<HTMLDivElement>(null);
    const position = useRef({ x: 0, y: 0 });
    const target = useRef({ x: 0, y: 0 });
    const initialized = useRef(false);
    const lastMoveTime = useRef(Date.now());
    const [isBlinking, setIsBlinking] = useState(false);

    useLayoutEffect(() => {
      if (!targetRef?.current || !followerRef.current) return;
      let measuredTarget: HTMLElement | null = null;

      const updateTarget = () => {
        if (!targetRef?.current || !followerRef.current) return;
        measuredTarget = targetRef.current;
        const targetRect = targetRef.current.getBoundingClientRect();
        const followerRect = followerRef.current.getBoundingClientRect();

        const targetX = targetRect.left - followerRect.width / 2;
        const targetY =
          targetRect.top + (targetRect.height - followerRect.height) / 2;

        if (
          targetX !== target.current.x ||
          targetY !== target.current.y
        ) {
          lastMoveTime.current = Date.now();
          setIsBlinking(false);
        }

        target.current.x = targetX;
        target.current.y = targetY;

        if (!initialized.current) {
          position.current.x = targetX;
          position.current.y = targetY;
          initialized.current = true;
          followerRef.current.style.transform = `translate3d(${position.current.x}px, ${position.current.y}px, 0)`;
        }
      };

      let previousFrameTime: number | null = null;

      const animate = (frameTime: number) => {
        if (measuredTarget !== targetRef.current) updateTarget();

        const deltaTime =
          previousFrameTime === null
            ? 1000 / 60
            : frameTime - previousFrameTime;
        previousFrameTime = frameTime;

        followPoint(position.current, target.current, deltaTime);

        if (followerRef.current) {
          followerRef.current.style.transform = `translate3d(${position.current.x}px, ${position.current.y}px, 0)`;
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

      window.addEventListener("scroll", updateTarget, true);
      window.addEventListener("resize", updateTarget);

      return () => {
        cancelAnimationFrame(rafId);
        clearInterval(fadeInterval);
        window.removeEventListener("scroll", updateTarget, true);
        window.removeEventListener("resize", updateTarget);
        initialized.current = false;
      };
    }, [targetRef, fadeDelay]);

    return (
      <div
        ref={followerRef}
        className={`max-w-0 h-10 -translate-y-px fixed top-0 -translate-x-0.5 left-0  ${isBlinking && visible ? "animate-blink" : ""}`}
        style={{ opacity: visible ? 1 : 0, willChange: "transform" }}
      >
        <div
          className="h-full rounded-full border-r-2 border-r-accent"
          style={color ? { borderRightColor: color } : undefined}
        />
      </div>
    );
  },
);
