import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from "react";

type CursorProps = {
  targetRef: RefObject<HTMLElement | null>;
  fadeDelay?: number;
  visible?: boolean;
  color?: string;
  updatePositionRef?: MutableRefObject<(() => void) | null>;
};

export const Cursor = memo(
  ({
    targetRef,
    fadeDelay = 2000,
    visible = true,
    color,
    updatePositionRef,
  }: CursorProps) => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const positioned = useRef(false);
    const lastMoveTime = useRef(Date.now());
    const blinking = useRef(false);
    const [isBlinking, setIsBlinking] = useState(false);

    const updatePosition = useCallback(() => {
      if (!targetRef.current || !cursorRef.current) return;

      const element = cursorRef.current;
      const target = targetRef.current.getBoundingClientRect();
      const cursor = element.getBoundingClientRect();

      if (!positioned.current) element.style.transition = "none";
      element.style.transform = `translate3d(${target.left - cursor.width / 2}px, ${target.top + (target.height - cursor.height) / 2}px, 0)`;
      if (!positioned.current) {
        void element.offsetWidth;
        element.style.transition = "";
        positioned.current = true;
      }
      lastMoveTime.current = Date.now();

      if (blinking.current) {
        blinking.current = false;
        setIsBlinking(false);
      }
    }, [targetRef]);

    useLayoutEffect(() => {
      if (updatePositionRef) updatePositionRef.current = updatePosition;
      updatePosition();

      return () => {
        if (updatePositionRef?.current === updatePosition) {
          updatePositionRef.current = null;
        }
      };
    }, [updatePosition, updatePositionRef]);

    useEffect(() => {
      const fadeInterval = setInterval(() => {
        if (
          !blinking.current &&
          Date.now() - lastMoveTime.current >= fadeDelay
        ) {
          blinking.current = true;
          setIsBlinking(true);
        }
      }, 100);

      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        clearInterval(fadeInterval);
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }, [fadeDelay, updatePosition]);

    return (
      <div
        ref={cursorRef}
        className={`fixed left-0 top-0 h-10 max-w-0 -translate-x-0.5 -translate-y-px transition-transform duration-[70ms] ease-out will-change-transform ${visible ? "opacity-100" : "opacity-0"} ${isBlinking && visible ? "animate-blink" : ""}`}
      >
        <div
          className="h-full rounded-full border-r-2 border-r-accent"
          style={color ? { borderRightColor: color } : undefined}
        />
      </div>
    );
  },
);
