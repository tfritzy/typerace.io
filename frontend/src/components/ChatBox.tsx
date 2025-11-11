import type { ReactNode } from "react";

type ChatBoxProps = {
    children: ReactNode;
};

export const ChatBox = ({ children }: ChatBoxProps) => {
    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div
                className="w-full max-w-4xl rounded-2xl px-8 py-6"
                style={{
                    backgroundColor: "var(--color-chat-box-bg)",
                    border: "1px solid var(--color-chat-box-border)",
                    boxShadow: "var(--shadow-chat-box)",
                }}
            >
                {children}
            </div>
        </div>
    );
};
