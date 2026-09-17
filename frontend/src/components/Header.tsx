import { useNavigate } from "react-router-dom";
import { ProfileAvatar } from "./ProfileAvatar";
import { Logo } from "./Logo";
import { useCallback } from "react";
import { Trophy } from "lucide-react";
import { getLangHome } from "../utils/modes";

interface HeaderProps {
    hideAvatar?: boolean;
}

export const Header = ({ hideAvatar = false }: HeaderProps) => {
    const navigate = useNavigate();

    const onClick = useCallback(() => {
        navigate(getLangHome())
    }, []);

    return (
        <header className="w-full px-4">
            <nav className="content-container flex justify-between items-center h-16">
                <Logo onClick={onClick} />
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate("/leaderboard")}
                        aria-label="Leaderboard"
                        title="Leaderboard"
                        className="p-2.5 rounded-lg cursor-pointer text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                        <Trophy aria-hidden size={20} strokeWidth={2} />
                    </button>
                    {!hideAvatar && <ProfileAvatar />}
                </div>
            </nav>
        </header>
    );
};
