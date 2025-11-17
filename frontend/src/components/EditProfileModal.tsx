import { useState } from 'react';
import type { PlayerColor } from '../../module_bindings';
import { COLOR_CONFIGS, getColorConfig } from '../utils/colorMapping';

type EditProfileModalProps = {
    currentName: string;
    currentColor: PlayerColor['tag'];
    onSave: (name: string, color: PlayerColor['tag']) => void;
    onClose: () => void;
};

export const EditProfileModal = ({ currentName, currentColor, onSave, onClose }: EditProfileModalProps) => {
    const [name, setName] = useState(currentName);
    const [color, setColor] = useState(currentColor);

    const availableColors: PlayerColor['tag'][] = Object.keys(COLOR_CONFIGS) as PlayerColor['tag'][];

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim(), color);
            onClose();
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: '#272727',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    padding: '32px',
                    minWidth: '400px',
                    maxWidth: '500px'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 style={{
                    color: '#ffffff',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    marginBottom: '24px',
                    marginTop: 0
                }}>
                    Edit Profile
                </h2>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.875rem',
                        marginBottom: '8px',
                        display: 'block'
                    }}>
                        Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{
                            width: '100%',
                            backgroundColor: '#1a1a1a',
                            color: '#ffffff',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '6px',
                            padding: '10px 12px',
                            fontSize: '0.875rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                        maxLength={30}
                    />
                </div>

                <div style={{ marginBottom: '32px' }}>
                    <label style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.875rem',
                        marginBottom: '12px',
                        display: 'block'
                    }}>
                        Color
                    </label>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '12px'
                    }}>
                        {availableColors.map((colorTag) => {
                            const colorConfig = getColorConfig({ tag: colorTag } as PlayerColor);
                            const isSelected = color === colorTag;
                            return (
                                <button
                                    key={colorTag}
                                    onClick={() => setColor(colorTag)}
                                    style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '8px',
                                        background: colorConfig.gradient,
                                        border: isSelected ? '3px solid #ffffff' : 'none',
                                        cursor: 'pointer',
                                        opacity: isSelected ? 1 : 0.7
                                    }}
                                    title={colorTag}
                                />
                            );
                        })}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        style={{
                            backgroundColor: 'transparent',
                            color: 'rgba(255, 255, 255, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '6px',
                            padding: '10px 20px',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            fontWeight: 500
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!name.trim()}
                        style={{
                            backgroundColor: 'var(--color-accent)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '10px 20px',
                            fontSize: '0.875rem',
                            cursor: name.trim() ? 'pointer' : 'not-allowed',
                            fontWeight: 600,
                            opacity: name.trim() ? 1 : 0.5
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};
