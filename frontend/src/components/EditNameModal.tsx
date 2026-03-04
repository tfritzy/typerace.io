import { useState } from 'react';

type EditNameModalProps = {
    currentName: string;
    onSave: (name: string) => void;
    onClose: () => void;
};

export const EditNameModal = ({ currentName, onSave, onClose }: EditNameModalProps) => {
    const [name, setName] = useState(currentName);
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 200);
    };

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
            handleClose();
        }
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
                className="glass-surface rounded-xl p-8 min-w-[400px] max-w-[500px]"
                onClick={(e) => e.stopPropagation()}
                style={{
                    animation: isClosing ? 'modalSlideOut 0.2s ease-out' : 'modalSlideIn 0.2s ease-out'
                }}
            >
                <h2 className="text-white text-2xl font-bold mb-6 mt-0">
                    Edit Name
                </h2>

                <div className="mb-8">
                    <label className="text-white/60 text-sm mb-2 block">
                        Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full glass-input text-white rounded-md px-3 py-2.5 text-sm outline-none box-border"
                        maxLength={30}
                        autoFocus
                    />
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
                        disabled={!name.trim()}
                        className="border-0 rounded-md px-5 py-2.5 text-sm font-semibold text-white"
                        style={{
                            backgroundColor: 'var(--color-accent)',
                            cursor: name.trim() ? 'pointer' : 'not-allowed',
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
