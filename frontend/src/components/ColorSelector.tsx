import { THEMES, type ThemeTag } from '../utils/themes';
import { getColorConfig } from '../utils/colorMapping';

type ColorSelectorProps = {
    selectedColor: ThemeTag;
    onColorSelect: (color: ThemeTag) => void;
};

export const ColorSelector = ({ selectedColor, onColorSelect }: ColorSelectorProps) => {
    const colors = Object.keys(THEMES) as ThemeTag[];

    return (
        <div className="grid gap-2 p-4 max-w-[440px]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(52px, 1fr))' }}>
            {colors.map((key) => {
                const colorConfig = getColorConfig(key);
                const isSelected = selectedColor === key;
                const boxShadow = isSelected
                    ? `0 0 0 3px rgba(255, 255, 255, 0.1), 0 0 20px ${colorConfig.primary}80, inset 0 2px 4px rgba(0, 0, 0, 0.2)`
                    : 'inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.4)';
                return (
                    <button
                        key={key}
                        onClick={() => onColorSelect(key)}
                        className="relative w-[52px] h-[52px] rounded-full border-0 cursor-pointer transition-all duration-[250ms] outline-none"
                        style={{
                            background: colorConfig.gradient,
                            boxShadow,
                            transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        onMouseEnter={(e) => {
                            if (!isSelected) {
                                e.currentTarget.style.transform = 'scale(1.08)';
                                e.currentTarget.style.boxShadow = `0 0 0 2px rgba(255, 255, 255, 0.05), 0 0 16px ${colorConfig.primary}60, inset 0 2px 4px rgba(0, 0, 0, 0.2)`;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isSelected) {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.4)';
                            }
                        }}
                        title={key}
                        aria-label={`Select ${key} color`}
                        aria-pressed={isSelected}
                    >
                        {isSelected && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-foreground/95 shadow-[0_2px_6px_rgba(0,0,0,0.3)] flex items-center justify-center">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path
                                        d="M11.5 3.5L5.5 9.5L2.5 6.5"
                                        stroke={colorConfig.dark}
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
};
