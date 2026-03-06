import { type PlayerColor } from '../types/stdb';
import { THEMES } from '../utils/themes';
import { useState, useRef, useEffect } from 'react';

type ThemeSelectorProps = {
    selectedTheme: PlayerColor['tag'];
    onThemeSelect: (theme: PlayerColor['tag']) => void;
};

export const ThemeSelector = ({ selectedTheme, onThemeSelect }: ThemeSelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const themes = Object.entries(THEMES) as [PlayerColor['tag'], typeof THEMES[keyof typeof THEMES]][];

    const currentTheme = THEMES[selectedTheme] || THEMES.Amber;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
        }, 150);
    };

    const handleSelect = (themeTag: PlayerColor['tag']) => {
        onThemeSelect(themeTag);
        handleClose();
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-input text-foreground border border-border rounded-md px-4 py-3 text-sm cursor-pointer outline-none flex items-center justify-between gap-3 hover:border-[var(--border-hover)] transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                        {currentTheme.previewColors.map((color, i) => (
                            <div
                                key={i}
                                className="w-4 h-4 rounded-full border border-white/20"
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                    <span>{currentTheme.name}</span>
                    <span className="text-xs text-muted-foreground">
                        ({currentTheme.mode})
                    </span>
                </div>
                <svg
                    className="text-muted-foreground shrink-0"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {isOpen && (
                <div
                    className="absolute left-0 right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
                    style={{
                        animation: isClosing ? 'menuSlideOut 0.15s ease-out' : 'menuSlideIn 0.15s ease-out'
                    }}
                >
                    {themes.map(([tag, theme]) => {
                        const isSelected = selectedTheme === tag;
                        return (
                            <button
                                key={tag}
                                onClick={() => handleSelect(tag)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer border-0 transition-colors text-left ${
                                    isSelected
                                        ? 'bg-accent/20 text-foreground'
                                        : 'bg-transparent text-foreground hover:bg-muted'
                                }`}
                            >
                                <div className="flex gap-1">
                                    {theme.previewColors.map((color, i) => (
                                        <div
                                            key={i}
                                            className="w-4 h-4 rounded-full border border-white/20"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <span className="flex-1">{theme.name}</span>
                                <span className="text-xs text-muted-foreground">
                                    {theme.mode}
                                </span>
                                {isSelected && (
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path
                                            d="M11.5 3.5L5.5 9.5L2.5 6.5"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
