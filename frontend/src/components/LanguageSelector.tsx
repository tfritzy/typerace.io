import { useState, useRef, useEffect } from "react";
import { languages, type LanguageInfo } from "../utils/modes";

interface LanguageSelectorProps {
    currentLang: LanguageInfo;
}

export function LanguageSelector({ currentLang }: LanguageSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

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
        <div className="fixed bottom-0 right-6 z-50">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer bg-transparent border-none px-0 pt-0 pb-10 relative transition-opacity hover:opacity-80"
                style={{
                    transform: mounted ? "translateY(0)" : "translateY(100%)",
                    transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
                aria-label="Select language"
            >
                <span className="text-2xl leading-none block pl-[2px]">{currentLang.flag}</span>
                <div
                    className="absolute left-0 top-0 bottom-0 w-[2px] bg-white/50"
                />
            </button>

            <div
                ref={menuRef}
                className={`absolute bottom-full right-0 mb-1 rounded-xl border border-white/15 p-2 min-w-[180px] max-h-[70vh] overflow-y-auto transition-all ${
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
                            <span className="text-base leading-none">{lang.flag}</span>
                            <span>{lang.nativeName}</span>
                        </a>
                    );
                })}
            </div>
        </div>
    );
}
