import { useEffect, useCallback } from "react";

type ActionBarProps = {
  onPlayAgain: () => void;
  onMainMenu: () => void;
};

export const ActionBar = ({ onPlayAgain, onMainMenu }: ActionBarProps) => {

  const handlePlayAgain = useCallback(() => {
    onPlayAgain();
  }, [onPlayAgain]);

  const handleMainMenu = useCallback(() => {
    onMainMenu();
  }, [onMainMenu]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "p" || event.key === "P") {
        handlePlayAgain();
      } else if (event.key === "m" || event.key === "M") {
        handleMainMenu();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handlePlayAgain, handleMainMenu]);

  return (
    <div className="box rounded-lg px-8 py-6 mt-4">
      <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
        <button
          onClick={handleMainMenu}
          style={{
            backgroundColor: "transparent",
            color: "var(--color-white)",
            border: "1px solid var(--color-box-border)",
            borderRadius: "8px",
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s ease",
            opacity: "0.8",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--color-box-border)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.opacity = "0.8";
          }}
        >
          Main Menu (M)
        </button>
        <button
          onClick={handlePlayAgain}
          style={{
            backgroundColor: "transparent",
            color: "var(--color-white)",
            border: "1px solid var(--color-box-border)",
            borderRadius: "8px",
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s ease",
            opacity: "0.8",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--color-box-border)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.opacity = "0.8";
          }}
        >
          Play Again (P)
        </button>
      </div>
    </div>
  );
};

export type { ActionBarProps };
