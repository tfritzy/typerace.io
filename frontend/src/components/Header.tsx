import { ProfileAvatar } from "./ProfileAvatar";
import "../App.css";
import { useNavigate } from "react-router-dom";

export const Header = () => {
    const navigate = useNavigate();

    return (
        <div className="fixed top-4 left-0 right-0 z-10 px-4">
            <div className="content-container flex justify-between items-center">
                <button className="logo" onClick={() => navigate("/")}>
                    <span className="logo-text">Type</span>
                    <span className="logo-accent">Race</span>
                    <span className="logo-io">.io</span>
                </button>
                <ProfileAvatar />
            </div>
        </div>
    );
};
