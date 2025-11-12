import type { ReactNode } from "react";
import "./ChatBox.css";

type ChatBoxProps = {
    children: ReactNode;
};

export const ChatBox = ({ children }: ChatBoxProps) => {
    return (
        <div className="chat-box w-full rounded-lg px-8 py-6 mb-4">
            {children}
        </div>
    );
};
