import { useNavigate } from "react-router-dom";
import { ProfileAvatar } from "./ProfileAvatar";
import { Logo } from "./Logo";
import { useCallback } from "react";
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
                {!hideAvatar && <ProfileAvatar />}
            </nav>
        </header>
    );
};
