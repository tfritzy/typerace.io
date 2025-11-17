import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { GameMode } from "../../module_bindings";
import type { GameTypeValue } from "../components/MatchTypeSelector";

type ActionBarProps = {
  mode?: GameMode;
  gameType?: GameTypeValue;
};

export const ActionBar = ({ mode, gameType }: ActionBarProps) => {
  const navigate = useNavigate();

  const getModeTag = () => {
    return mode?.tag || "English500";
  };

  const getGameType = () => {
    return gameType || "Public";
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "p" || event.key === "P") {
        navigate(`/game?mode=${getModeTag()}&gameType=${getGameType()}`, { replace: true });
      } else if (event.key === "m" || event.key === "M") {
        navigate("/");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [navigate, mode, gameType]);

  return (
    <div className="box rounded-lg px-8 py-6 mt-4">
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => navigate("/")}
          className="bg-transparent text-white border border-[var(--color-box-border)] rounded-lg px-6 py-3 text-base font-semibold cursor-pointer opacity-80"
        >
          Main Menu (M)
        </button>
        <button
          onClick={() => navigate(`/game?mode=${getModeTag()}&gameType=${getGameType()}`, { replace: true })}
          className="bg-transparent text-white border border-[var(--color-box-border)] rounded-lg px-6 py-3 text-base font-semibold cursor-pointer opacity-80"
        >
          Play Again (P)
        </button>
      </div>
    </div>
  );
};
