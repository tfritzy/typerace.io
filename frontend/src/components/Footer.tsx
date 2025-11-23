import { useNavigate } from "react-router-dom";

export const Footer = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full px-4 pb-2 text-center">
            <div className="flex justify-center gap-4">
                <button
                    onClick={() => navigate("/privacy")}
                    className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
                >
                    Privacy Policy
                </button>
                <span className="text-xs text-gray-600">|</span>
                <button
                    onClick={() => navigate("/stats")}
                    className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
                >
                    Site Stats
                </button>
            </div>
        </div>
    );
};
