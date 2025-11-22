import { useNavigate } from "react-router-dom";
import { ProfileAvatar } from "./ProfileAvatar";

interface HeaderProps {
    hideAvatar?: boolean;
}

export const Header = ({ hideAvatar = false }: HeaderProps) => {
    const navigate = useNavigate();

    return (
        <div className="w-full px-4 py-4">
            <div className="content-container flex justify-between items-center">
                <button className="logo" onClick={() => navigate("/")}>
                    <span className="logo-text">Type</span>
                    <span className="logo-accent">Race</span>
                    <span className="logo-io">.io</span>
                </button>
                <button 
                    onClick={() => navigate("/privacy")}
                    className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
                >
                    Privacy Policy
                </button>
                <div className={hideAvatar ? "invisible" : ""}>
                    <ProfileAvatar />
                </div>
            </div>
        </div>
    );
};
