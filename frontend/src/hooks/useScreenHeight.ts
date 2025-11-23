import { useState, useEffect } from "react";

export function useScreenHeight() {
  const [isLimitedHeight, setIsLimitedHeight] = useState(false);

  useEffect(() => {
    const checkHeight = () => {
      setIsLimitedHeight(window.innerHeight < 700);
    };

    checkHeight();
    window.addEventListener("resize", checkHeight);

    return () => window.removeEventListener("resize", checkHeight);
  }, []);

  return { isLimitedHeight };
}
