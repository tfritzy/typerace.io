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
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '12px',
            padding: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
            {colors.map((key) => (
                <button
                    key={key}
                    onClick={() => onColorSelect(key)}
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '12px',
                        background: COLOR_CONFIGS[key].gradient,
                        border: selectedColor === key
                            ? `3px solid ${COLOR_CONFIGS[key].primary}`
                            : '3px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: selectedColor === key
                            ? `0 0 20px ${COLOR_CONFIGS[key].primary}`
                            : '0 4px 8px rgba(0, 0, 0, 0.3)',
                        transform: selectedColor === key ? 'scale(1.1)' : 'scale(1)'
                    }}
                    onMouseEnter={(e) => {
                        if (selectedColor !== key) {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = `0 0 15px ${COLOR_CONFIGS[key].primary}`;
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (selectedColor !== key) {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
                        }
                    }}
                    title={key}
                />
            ))}
        </div>
    );
};
