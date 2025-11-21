'use client';

import { useRouter } from "next/navigation";
import { ProfileAvatar } from "@/components/ProfileAvatar";

interface HeaderProps {
    hideAvatar?: boolean;
}

export const Header = ({ hideAvatar = false }: HeaderProps) => {
    const navigate = useRouter();

    return (
        <div className="w-full px-4 py-4">
            <div className="content-container flex justify-between items-center">
                <button className="logo" onClick={() => router.push("/")}>
                    <span className="logo-text">Type</span>
                    <span className="logo-accent">Race</span>
                    <span className="logo-io">.io</span>
                </button>
                <div className={hideAvatar ? "invisible" : ""}>
                    <ProfileAvatar />
                </div>
            </div>
        </div>
    );
};
