import { useState } from 'react';
import type { PlayerColor } from '../types/stdb';
import { COLOR_CONFIGS, getColorConfig } from '../utils/colorMapping';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

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
        <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="min-w-[400px] max-w-[500px]">
                <DialogHeader className="mb-6">
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>

                <div className="mb-6">
                    <Label className="mb-2 block">Name</Label>
                    <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={30}
                    />
                </div>

                <div className="mb-8">
                    <Label className="mb-3 block">Color</Label>
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
                    <Button onClick={handleSave} disabled={!name.trim()}>
                        Save
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
