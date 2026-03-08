import { useEffect, useState } from "react";

interface WordXpIndicatorProps {
  xp: number;
  position: { x: number; y: number };
  onComplete: () => void;
}

export const WordXpIndicator = ({
  xp,
  position,
  onComplete,
}: WordXpIndicatorProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 text-sm font-semibold text-accent"
      style={{
        left: `${position.x}px`,
        top: `${position.y - 15}px`,
        animation: "wordXpFloat 1s ease-out forwards",
      }}
    >
      +{xp}
    </div>
  );
};
