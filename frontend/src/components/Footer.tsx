import { useNavigate } from "react-router-dom";

export const Footer = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full px-4 py-3 text-center">
            <button 
                onClick={() => navigate("/privacy")}
                className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
            >
                Privacy Policy
            </button>
        </div>
    );
};
