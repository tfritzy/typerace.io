import { PlayerColor } from '../../module_bindings';
import { COLOR_CONFIGS } from '../utils/colorMapping';

type ColorSelectorProps = {
    selectedColor: PlayerColor['tag'];
    onColorSelect: (color: PlayerColor['tag']) => void;
};

export const ColorSelector = ({ selectedColor, onColorSelect }: ColorSelectorProps) => {
    const colors = Object.keys(COLOR_CONFIGS) as PlayerColor['tag'][];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(52px, 1fr))',
            gap: '8px',
            padding: '16px',
            maxWidth: '440px',
        }}>
            {colors.map((key) => {
                const isSelected = selectedColor === key;
                return (
                    <button
                        key={key}
                        onClick={() => onColorSelect(key)}
                        style={{
                            position: 'relative',
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            background: COLOR_CONFIGS[key].gradient,
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: isSelected
                                ? `0 0 0 3px rgba(255, 255, 255, 0.1), 0 0 20px ${COLOR_CONFIGS[key].primary}80, inset 0 2px 4px rgba(0, 0, 0, 0.2)`
                                : 'inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.4)',
                            transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                            outline: 'none',
                        }}
                        onMouseEnter={(e) => {
                            if (!isSelected) {
                                e.currentTarget.style.transform = 'scale(1.08)';
                                e.currentTarget.style.boxShadow = `0 0 0 2px rgba(255, 255, 255, 0.05), 0 0 16px ${COLOR_CONFIGS[key].primary}60, inset 0 2px 4px rgba(0, 0, 0, 0.2)`;
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
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path
                                        d="M11.5 3.5L5.5 9.5L2.5 6.5"
                                        stroke={COLOR_CONFIGS[key].darker}
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
