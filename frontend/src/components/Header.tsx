import { useNavigate } from "react-router-dom";
import { ProfileAvatar } from "./ProfileAvatar";

interface HeaderProps {
    hideAvatar?: boolean;
}

export const Header = ({ hideAvatar = false }: HeaderProps) => {
    const navigate = useNavigate();

    return (
        <div className="w-full px-4 py-4">
            <div className="content-container flex justify-between items-center gap-2">
                <button className="logo logo-mobile" onClick={() => navigate("/")}>
                    <span className="logo-text">Type</span>
                    <span className="logo-accent">Race</span>
                    <span className="logo-io">.io</span>
                </button>
                <div className={hideAvatar ? "invisible" : "flex-shrink-0"}>
                    <ProfileAvatar />
                </div>
            </div>
        </div>
    );
};
