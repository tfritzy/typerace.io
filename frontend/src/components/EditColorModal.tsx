import { useState } from 'react';
import type { PlayerColor } from '../types/stdb';
import { COLOR_CONFIGS, getColorConfig } from '../utils/colorMapping';

type EditColorModalProps = {
    currentColor: PlayerColor['tag'];
    onSave: (color: PlayerColor['tag']) => void;
    onClose: () => void;
};

export const EditColorModal = ({ currentColor, onSave, onClose }: EditColorModalProps) => {
    const [color, setColor] = useState(currentColor);
    const [isClosing, setIsClosing] = useState(false);

    const availableColors: PlayerColor['tag'][] = Object.keys(COLOR_CONFIGS) as PlayerColor['tag'][];

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 200);
    };

    const handleSave = () => {
        onSave(color);
        handleClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/20 flex items-center justify-center z-2000"
            onClick={handleClose}
            style={{
                animation: isClosing ? 'modalFadeOut 0.2s ease-out' : 'modalFadeIn 0.2s ease-out'
            }}
        >
            <div
                className="bg-[#272727] border border-white/15 rounded-xl p-8 min-w-[400px] max-w-[500px]"
                onClick={(e) => e.stopPropagation()}
                style={{
                    animation: isClosing ? 'modalSlideOut 0.2s ease-out' : 'modalSlideIn 0.2s ease-out'
                }}
            >
                <h2 className="text-white text-2xl font-bold mb-6 mt-0">
                    Change Color
                </h2>

                <div className="mb-8">
                    <label className="text-white/60 text-sm mb-3 block">
                        Select Color
                    </label>
                    <div className='flex flex-row flex-wrap space-x-2 space-y-2'>
                        {availableColors.map((colorTag) => {
                            const colorConfig = getColorConfig({ tag: colorTag } as PlayerColor);
                            const isSelected = color === colorTag;
                            const borderStyle = isSelected ? { border: '3px solid #ffffff' } : {};
                            return (
                                <button
                                    key={colorTag}
                                    onClick={() => setColor(colorTag)}
                                    className={`w-10 h-10 rounded cursor-pointer ${isSelected ? 'opacity-100' : 'opacity-70'}`}
                                    style={{
                                        background: colorConfig.primary,
                                        ...borderStyle
                                    }}
                                    title={colorTag}
                                />
                            );
                        })}
                    </div>
                </div>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={handleClose}
                        className="bg-transparent text-white/60 border border-white/15 rounded-md px-5 py-2.5 text-sm cursor-pointer font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="border-0 rounded-md px-5 py-2.5 text-sm font-semibold text-white"
                        style={{
                            backgroundColor: 'var(--color-accent)',
                            cursor: 'pointer'
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};
