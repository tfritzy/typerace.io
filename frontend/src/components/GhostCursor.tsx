import { memo, useCallback, useEffect, useLayoutEffect, useRef } from "react";

type GhostCursorProps = {
  charIndex: number;
  color: string;
};

export const GhostCursor = memo(({ charIndex, color }: GhostCursorProps) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<Element | null>(null);
  const positioned = useRef(false);

  const updatePosition = useCallback(() => {
    if (!targetRef.current || !cursorRef.current) return;
    const element = cursorRef.current;
    const target = targetRef.current.getBoundingClientRect();

    if (!positioned.current) element.style.transition = "none";
    element.style.transform = `translate3d(${target.left}px, ${target.bottom - 2}px, 0)`;
    if (!positioned.current) {
      void element.offsetWidth;
      element.style.transition = "";
      positioned.current = true;
    }
  }, []);

  useLayoutEffect(() => {
    targetRef.current = document.querySelector(
      `[data-char-index="${charIndex}"]`,
    );
    updatePosition();
  }, [charIndex, updatePosition]);

  useEffect(() => {
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [updatePosition]);

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed left-0 top-0 h-[2px] w-[10px] opacity-20 transition-transform duration-[70ms] ease-out will-change-transform"
      style={{ backgroundColor: color }}
    />
  );
});
