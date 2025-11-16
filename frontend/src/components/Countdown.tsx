import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTable, where, eq } from "spacetimedb/react";
import type { DbConnection, Game } from "../../module_bindings";

export const Countdown = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const [count, setCount] = useState(3);
    const [isVisible, setIsVisible] = useState(false);
    const [previousGameState, setPreviousGameState] = useState<string | null>(null);

    const { rows: games } = useTable<DbConnection, Game>(
        "game",
        where(eq("id", gameId || ""))
    );

    const game = games[0];

    useEffect(() => {
        if (!game) return;

        const currentState = game.state.tag;

        if (previousGameState === "Lobby" && currentState === "Countdown") {
            const countdownDurationMs = Number(game.countdownDurationMs);
            const initialCount = Math.ceil(countdownDurationMs / 1000);
            setIsVisible(true);
            setCount(initialCount);
        }

        setPreviousGameState(currentState);
    }, [game, previousGameState]);

    useEffect(() => {
        if (!isVisible) return;

        if (count === 0) {
            setIsVisible(false);
            return;
        }

        const timer = setTimeout(() => {
            setCount(count - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [count, isVisible]);

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
