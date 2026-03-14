import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { languages, getLanguageFromSlug, type LanguageInfo } from "../utils/modes";

function getCurrentLang(): LanguageInfo {
    try {
        const slug = localStorage.getItem("typerace_lang_slug") ?? undefined;
        return getLanguageFromSlug(slug);
    } catch {
        return getLanguageFromSlug(undefined);
    }
}

export function LanguageDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const currentLang = getCurrentLang();

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative inline-flex" ref={dropdownRef}>
            <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer bg-secondary text-secondary-foreground"
                onClick={() => setIsOpen(!isOpen)}
            >
                <img src={`/flags/${currentLang.countryCode}.svg`} alt={currentLang.nativeName} className="w-4 h-3 rounded-[1px]" />
                <span>{currentLang.nativeName}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <div
                className={`absolute top-full left-0 mt-1 rounded-xl border border-border bg-card p-1.5 min-w-[160px] max-h-52 overflow-y-auto z-50 transition-all duration-150 ${
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
                            hrefLang={lang.htmlLang}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors no-underline ${
                                isSelected
                                    ? "bg-secondary text-secondary-foreground"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                            }`}
                        >
                            <img src={`/flags/${lang.countryCode}.svg`} alt={lang.nativeName} className="w-6 h-[18px] rounded-sm" />
                            {lang.nativeName}
                        </a>
                    );
                })}
            </div>
        </div>
    );
}
