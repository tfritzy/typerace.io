import { useState } from 'react';
import type { PlayerColor } from '../types/stdb';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ThemeSelector } from './ThemeSelector';

type EditProfileModalProps = {
    currentName: string;
    currentColor: PlayerColor['tag'];
    onSave: (name: string, color: PlayerColor['tag']) => void;
    onClose: () => void;
};

export const EditProfileModal = ({ currentName, currentColor, onSave, onClose }: EditProfileModalProps) => {
    const [name, setName] = useState(currentName);
    const [theme, setTheme] = useState(currentColor);

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim(), theme);
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
                    <Label className="mb-3 block">Theme</Label>
                    <ThemeSelector
                        selectedTheme={theme}
                        onThemeSelect={setTheme}
                    />
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
