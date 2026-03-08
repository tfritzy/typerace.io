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
        <div className="w-full px-4">
            <div className="content-container flex justify-between items-center h-12 sm:h-16">
                <Logo onClick={onClick} />
                <div className={hideAvatar ? "invisible" : ""}>
                    <ProfileAvatar />
                </div>
            </div>
        </div>
    );
};
