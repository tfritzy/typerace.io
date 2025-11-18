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
    <div className="flex gap-3 mt-3">
      <button
        onClick={() => navigate("/")}
        className="box rounded-lg px-8 py-4 bg-transparent text-white text-base font-semibold cursor-pointer opacity-80 flex-1"
      >
        Main Menu <span className="ml-1 border px-1 rounded-sm font-bold border-white/75 text-white/75">M</span>
      </button>
      <button
        onClick={() => navigate(`/game?mode=${getModeTag()}&gameType=${getGameType()}`, { replace: true })}
        className="box rounded-lg px-8 py-4 bg-transparent text-white text-base font-semibold cursor-pointer opacity-80 flex-1"
      >
        Play Again <span className="ml-1 border px-1 rounded-sm font-bold border-white/75 text-white/75">P</span>
      </button>
    </div>
  );
};
