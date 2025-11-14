import type { ReactNode } from "react";
import "./ChatBox.css";

type ChatBoxProps = {
    children: ReactNode;
    onFocus?: () => void;
    className?: string;
};

export const ChatBox = ({ children, onFocus, className }: ChatBoxProps) => {
    return (
        <div
            className={`chat-box w-full rounded-lg px-8 py-6 mb-4 ${onFocus ? 'cursor-pointer' : ''} ${className || ""}`}
            onClick={onFocus}
        >
            {children}
        </div>
    );
};
