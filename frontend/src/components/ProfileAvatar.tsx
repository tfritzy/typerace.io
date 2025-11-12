import { useNavigate } from "react-router-dom";

export const ProfileAvatar = () => {
    const navigate = useNavigate();

    const level = 17;
    const currentXP = 650;
    const xpForNextLevel = 1000;
    const xpProgress = (currentXP / xpForNextLevel) * 100;

    return (
        <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
            <div className="relative w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                <svg
                    viewBox="0 0 100 100"
                    className="w-12 h-12 text-white/60"
                    fill="currentColor"
                >
                    <circle cx="50" cy="35" r="20" />
                </svg>
            </div>

            <div className="flex flex-col items-start min-w-[200px]">
                <div className="text-sm font-medium text-white/80 mb-1">
                    Level {level}
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${xpProgress}%` }}
                    />
                </div>
            </div>
        </button>
    );
};
