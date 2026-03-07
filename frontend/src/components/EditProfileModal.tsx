import { useState } from 'react';
import type { PlayerColor } from '../types/stdb';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ThemeSelector } from './ThemeSelector';
import { THEMES } from '../utils/themes';

type EditProfileModalProps = {
    currentName: string;
    currentColor: PlayerColor['tag'];
    onSave: (name: string, color: PlayerColor['tag']) => void;
    onClose: () => void;
};

export const EditProfileModal = ({ currentName, currentColor, onSave, onClose }: EditProfileModalProps) => {
    const [name, setName] = useState(currentName);
    const [theme, setTheme] = useState(currentColor);
    const [themeSelectorOpen, setThemeSelectorOpen] = useState(false);

    const currentTheme = theme in THEMES ? THEMES[theme] : THEMES.GitHubDark;

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim(), theme);
            onClose();
        }
    };

    return (
        <>
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
                        <button
                            onClick={() => setThemeSelectorOpen(true)}
                            className="w-full bg-input text-foreground border border-border rounded-md px-4 py-3 text-sm cursor-pointer outline-none flex items-center justify-between gap-3 hover:border-[var(--border-hover)] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1">
                                    {currentTheme.previewColors.map((color, i) => (
                                        <div
                                            key={i}
                                            className="w-4 h-4 rounded-full border border-white/20"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <span>{currentTheme.name}</span>
                                <span className="text-xs text-muted-foreground">({currentTheme.mode})</span>
                            </div>
                            <svg className="text-muted-foreground shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>
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

            <ThemeSelector
                selectedTheme={theme}
                onThemeSelect={(t) => { setTheme(t); setThemeSelectorOpen(false); }}
                open={themeSelectorOpen}
                onOpenChange={setThemeSelectorOpen}
            />
        </>
    );
};
