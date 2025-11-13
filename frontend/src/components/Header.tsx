import { ProfileAvatar } from "./ProfileAvatar";
import "../App.css";

export const Header = () => {
    return (
        <div className="fixed top-4 left-0 right-0 z-10 px-4">
            <div className="content-container flex justify-between items-center">
                <div className="logo">
                    <span className="logo-text">Type</span>
                    <span className="logo-accent">Race</span>
                    <span className="logo-io">.io</span>
                </div>
                <ProfileAvatar />
            </div>
        </div>
    );
};
