import { useEffect, useState } from "react";

interface CountdownProps {
    onComplete?: () => void;
}

export const Countdown = ({ onComplete }: CountdownProps) => {
    const [count, setCount] = useState(3);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (count === 0) {
            setIsVisible(false);
            onComplete?.();
            return;
        }

        const timer = setTimeout(() => {
            setCount(count - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [count, onComplete]);

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div
                key={count}
                className="countdown-number"
                style={{
                    fontSize: "20rem",
                    fontWeight: "bold",
                    color: "#fff",
                    animation: "countdownPop 1s ease-out forwards",
                }}
            >
                {count}
            </div>
            <style>{`
        @keyframes countdownPop {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.8);
          }
        }
      `}</style>
        </div>
    );
};
