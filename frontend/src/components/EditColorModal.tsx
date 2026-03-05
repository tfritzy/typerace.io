import { useState } from 'react';
import type { PlayerColor } from '../types/stdb';
import { COLOR_CONFIGS, getColorConfig } from '../utils/colorMapping';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';

type EditColorModalProps = {
    currentColor: PlayerColor['tag'];
    onSave: (color: PlayerColor['tag']) => void;
    onClose: () => void;
};

export const EditColorModal = ({ currentColor, onSave, onClose }: EditColorModalProps) => {
    const [color, setColor] = useState(currentColor);

    const availableColors: PlayerColor['tag'][] = Object.keys(COLOR_CONFIGS) as PlayerColor['tag'][];

    const handleSave = () => {
        onSave(color);
        onClose();
    };

    return (
        <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="min-w-[400px] max-w-[500px]">
                <DialogHeader className="mb-6">
                    <DialogTitle>Change Color</DialogTitle>
                </DialogHeader>

                <div className="mb-8">
                    <Label className="mb-3 block">Select Color</Label>
                    <div className="flex flex-row flex-wrap space-x-2 space-y-2">
                        {availableColors.map((colorTag) => {
                            const colorConfig = getColorConfig({ tag: colorTag } as PlayerColor);
                            const isSelected = color === colorTag;
                            const borderStyle = isSelected ? { border: '3px solid var(--foreground)' } : {};
                            return (
                                <button
                                    key={colorTag}
                                    onClick={() => setColor(colorTag)}
                                    className={`w-10 h-10 rounded cursor-pointer border-0 ${isSelected ? 'opacity-100' : 'opacity-70'}`}
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
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
