import { useState, useRef, useEffect } from "react";
import { languages, type LanguageInfo } from "../utils/modes";

interface LanguageSelectorProps {
    currentLang: LanguageInfo;
}

export function LanguageSelector({ currentLang }: LanguageSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
        <div ref={containerRef} className="fixed bottom-0 right-8 z-50">
            <div
                className={`absolute bottom-28 right-0 glass-surface rounded-xl p-2 min-w-[180px] max-h-[70vh] overflow-y-auto transition-all ${
                    isOpen
                        ? "opacity-100 visible"
                        : "opacity-0 invisible pointer-events-none"
                }`}
            >
                {languages.map((lang) => {
                    const href = lang.slug ? `/${lang.slug}` : "/";
                    const isSelected = lang.language === currentLang.language;

                    return (
                        <a
                            key={lang.language}
                            href={href}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${
                                isSelected
                                    ? "bg-white/10 text-white"
                                    : "text-white/70 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                            <span className="text-base leading-none">{lang.flag}</span>
                            <span>{lang.nativeName}</span>
                        </a>
                    );
                })}
            </div>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer bg-transparent border-none p-0 flex items-start group"
                aria-label="Select language"
                title="Change language"
            >
                <div
                    className="w-[2px] flex-shrink-0"
                    style={{
                        height: "130px",
                        background: "linear-gradient(to bottom, #c0c0c0 0%, #888 8%, #333 20%, black 35%)",
                    }}
                />
                <span
                    className="text-2xl leading-none ml-[-1px] mt-[-2px] block transition-transform duration-150 group-hover:scale-125"
                    style={{
                        filter: "drop-shadow(0 0 4px rgba(0,0,0,0.5))",
                    }}
                >
                    {currentLang.flag}
                </span>
            </button>
        </div>
    );
}
