import { useState, useEffect } from "react";

export const HEIGHT_THRESHOLD = 700;

export function useScreenHeight() {
  const [isLimitedHeight, setIsLimitedHeight] = useState(false);

  useEffect(() => {
    const checkHeight = () => {
      setIsLimitedHeight(window.innerHeight < HEIGHT_THRESHOLD);
    };

    checkHeight();
    window.addEventListener("resize", checkHeight);

    return () => window.removeEventListener("resize", checkHeight);
  }, []);

  return { isLimitedHeight };
}
