import { useNavigate } from "react-router-dom";
import { ProfileAvatar } from "./ProfileAvatar";
import { Logo } from "./Logo";
import { useCallback } from "react";

interface HeaderProps {
    hideAvatar?: boolean;
}

export const Header = ({ hideAvatar = false }: HeaderProps) => {
    const navigate = useNavigate();

    const onClick = useCallback(() => {
        navigate("/")
    }, []);

    return (
        <div className="w-full px-4">
            <div className="content-container flex justify-between items-center h-16">
                <Logo onClick={onClick} />
                <div className={hideAvatar ? "invisible" : ""}>
                    <ProfileAvatar />
                </div>
            </div>
        </div>
    );
};
