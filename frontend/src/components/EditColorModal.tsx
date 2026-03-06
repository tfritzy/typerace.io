import { useState } from 'react';
import type { PlayerColor } from '../types/stdb';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { ThemeSelector } from './ThemeSelector';

type EditColorModalProps = {
    currentColor: PlayerColor['tag'];
    onSave: (color: PlayerColor['tag']) => void;
    onClose: () => void;
};

export const EditColorModal = ({ currentColor, onSave, onClose }: EditColorModalProps) => {
    const [theme, setTheme] = useState(currentColor);

    const handleSave = () => {
        onSave(theme);
        onClose();
    };

    return (
        <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="min-w-[400px] max-w-[500px]">
                <DialogHeader className="mb-6">
                    <DialogTitle>Change Theme</DialogTitle>
                </DialogHeader>

                <div className="mb-8">
                    <Label className="mb-3 block">Select Theme</Label>
                    <ThemeSelector
                        selectedTheme={theme}
                        onThemeSelect={setTheme}
                    />
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
