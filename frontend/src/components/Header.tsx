import { useNavigate } from "react-router-dom";
import { ProfileAvatar } from "./ProfileAvatar";
import { Logo } from "./Logo";
import { useCallback, useState } from "react";
import { getLangHome } from "../utils/modes";
import { Palette } from "lucide-react";
import { ThemeShowcaseModal } from "./ThemeShowcaseModal";

interface HeaderProps {
    hideAvatar?: boolean;
}

export const Header = ({ hideAvatar = false }: HeaderProps) => {
    const navigate = useNavigate();
    const [showThemeModal, setShowThemeModal] = useState(false);

    const onClick = useCallback(() => {
        navigate(getLangHome())
    }, []);

    return (
        <div className="w-full px-4">
            <div className="content-container flex justify-between items-center h-16">
                <Logo onClick={onClick} />
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowThemeModal(true)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-0"
                    >
                        <Palette className="w-5 h-5" />
                    </button>
                    <div className={hideAvatar ? "invisible" : ""}>
                        <ProfileAvatar />
                    </div>
                </div>
            </div>
            {showThemeModal && (
                <ThemeShowcaseModal onClose={() => setShowThemeModal(false)} />
            )}
        </div>
    );
};
