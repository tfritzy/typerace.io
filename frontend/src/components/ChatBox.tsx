import type { ReactNode } from "react";
import "./ChatBox.css";

type ChatBoxProps = {
    children: ReactNode;
    focused?: boolean;
};

export const ChatBox = ({ children, focused = false }: ChatBoxProps) => {
    return (
        <div
            className="chat-box w-full rounded-lg px-8 py-6 mb-4"
            style={{
                borderColor: focused ? 'rgba(255, 255, 255, 0.25)' : undefined,
                boxShadow: focused
                    ? 'inset 0 0 40px rgba(255, 255, 255, 0.02), 0 8px 20px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.2)'
                    : undefined,
            }}
        >
            {children}
        </div>
    );
};
