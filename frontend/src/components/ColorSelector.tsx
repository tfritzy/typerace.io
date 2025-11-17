import { PlayerColor, COLOR_CONFIGS } from '../utils/colorMapping';

type ColorSelectorProps = {
    selectedColor: PlayerColor;
    onColorSelect: (color: PlayerColor) => void;
};

export const ColorSelector = ({ selectedColor, onColorSelect }: ColorSelectorProps) => {
    const colors = Object.entries(COLOR_CONFIGS).map(([value, config]) => ({
        value: Number(value) as PlayerColor,
        config
    }));

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
            {colors.map(({ value, config }) => (
                <button
                    key={value}
                    onClick={() => onColorSelect(value)}
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '12px',
                        background: config.gradient,
                        border: selectedColor === value 
                            ? `3px solid ${config.primary}` 
                            : '3px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: selectedColor === value
                            ? `0 0 20px ${config.primary}`
                            : '0 4px 8px rgba(0, 0, 0, 0.3)',
                        transform: selectedColor === value ? 'scale(1.1)' : 'scale(1)'
                    }}
                    onMouseEnter={(e) => {
                        if (selectedColor !== value) {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = `0 0 15px ${config.primary}`;
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (selectedColor !== value) {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
                        }
                    }}
                    title={PlayerColor[value]}
                />
            ))}
        </div>
    );
};
