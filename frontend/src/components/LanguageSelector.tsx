import { useState, useRef, useEffect } from "react";
import { languages, getFlagUrl, type LanguageInfo } from "../utils/modes";

interface LanguageSelectorProps {
    currentLang: LanguageInfo;
}

export function LanguageSelector({ currentLang }: LanguageSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target as Node)
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
        <div className="fixed bottom-6 right-6 z-50">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer border border-white/20 hover:border-white/40 transition-all hover:scale-105 overflow-hidden p-0"
                style={{ backgroundColor: "var(--color-box-bg)" }}
                aria-label="Select language"
            >
                <img
                    src={getFlagUrl(currentLang.flag)}
                    alt={currentLang.nativeName}
                    className="w-full h-full object-cover"
                />
            </button>

            <div
                ref={menuRef}
                className={`absolute bottom-16 right-0 rounded-xl border border-white/15 p-2 min-w-[180px] max-h-[70vh] overflow-y-auto transition-all ${
                    isOpen
                        ? "opacity-100 visible"
                        : "opacity-0 invisible pointer-events-none"
                }`}
                style={{ backgroundColor: "var(--color-box-bg)" }}
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
                                <img
                                    src={getFlagUrl(lang.flag)}
                                    alt={lang.nativeName}
                                    className="w-5 h-5 rounded-sm object-cover"
                                />
                                <span>{lang.nativeName}</span>
                            </a>
                        );
                    })}
                </div>
        </div>
    );
}
