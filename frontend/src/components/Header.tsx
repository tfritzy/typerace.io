import { useNavigate } from "react-router-dom";
import { ProfileAvatar } from "./ProfileAvatar";
import { Logo } from "./Logo";
import { useCallback } from "react";
import { getLangHome } from "../utils/modes";

interface HeaderProps {
    hideAvatar?: boolean;
    tagline?: string;
}

export const Header = ({ hideAvatar = false, tagline }: HeaderProps) => {
    const navigate = useNavigate();

    const onClick = useCallback(() => {
        navigate(getLangHome())
    }, []);

    return (
        <header className="w-full px-4">
            <nav className="content-container flex justify-between items-center h-16">
                <Logo onClick={onClick} tagline={tagline} />
                <div className={hideAvatar ? "invisible" : ""}>
                    <ProfileAvatar />
                </div>
            </nav>
        </header>
    );
};
