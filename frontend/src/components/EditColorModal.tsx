import { useState } from 'react';
import type { PlayerColor } from '../types/stdb';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { ThemeSelector } from './ThemeSelector';
import { THEMES, applyTheme, applyCustomTheme, getCustomThemeSettings, DEFAULT_THEME_SETTINGS, GOOGLE_FONTS, loadGoogleFont, fontNameToCss, type ThemeSettings } from '../utils/themes';

function cssColorToHex(color: string): string {
    if (color.startsWith('#')) return color;
    const el = document.createElement('div');
    el.style.color = color;
    document.body.appendChild(el);
    const computed = getComputedStyle(el).color;
    document.body.removeChild(el);
    const match = computed.match(/(\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return '#333333';
    return `#${parseInt(match[1]).toString(16).padStart(2, '0')}${parseInt(match[2]).toString(16).padStart(2, '0')}${parseInt(match[3]).toString(16).padStart(2, '0')}`;
}

type EditColorModalProps = {
    currentColor: string;
    onSave: (color: string, customSettings?: ThemeSettings) => void;
    onClose: () => void;
};

export const EditColorModal = ({ currentColor, onSave, onClose }: EditColorModalProps) => {
    const existingCustom = getCustomThemeSettings();
    const [mode, setMode] = useState<'preset' | 'custom'>(currentColor === 'custom' ? 'custom' : 'preset');
    const [theme, setTheme] = useState(currentColor === 'custom' ? 'GitHubDark' as PlayerColor['tag'] : currentColor);
    const [custom, setCustom] = useState<ThemeSettings>(existingCustom || DEFAULT_THEME_SETTINGS);
    const [themeSelectorOpen, setThemeSelectorOpen] = useState(false);

    const currentTheme = mode === 'preset' && theme in THEMES ? THEMES[theme as PlayerColor['tag']] : null;

    const handlePresetSelect = (tag: PlayerColor['tag']) => {
        setTheme(tag);
        setMode('preset');
        applyTheme(tag);
        setThemeSelectorOpen(false);
    };

    const handleCustomChange = (field: keyof ThemeSettings, value: string | number) => {
        const updated = { ...custom, [field]: value };
        setCustom(updated);
        setMode('custom');
        applyCustomTheme(updated);
    };

    const handleSave = () => {
        if (mode === 'custom') {
            onSave('custom', custom);
        } else {
            onSave(theme);
        }
        onClose();
    };

    const handleCancel = () => {
        applyTheme(currentColor);
        onClose();
    };

    return (
        <>
            <Dialog open={true} onOpenChange={(open) => { if (!open) handleCancel(); }}>
                <DialogContent className="min-w-[400px] max-w-[500px]">
                    <DialogHeader className="mb-4">
                        <DialogTitle>Change Theme</DialogTitle>
                    </DialogHeader>

                    <div className="mb-4">
                        <Label className="mb-2 block">Preset</Label>
                        <button
                            onClick={() => setThemeSelectorOpen(true)}
                            className="w-full bg-input text-foreground border border-border rounded-md px-4 py-3 text-sm cursor-pointer outline-none flex items-center justify-between gap-3 hover:border-[var(--border-hover)] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                {currentTheme ? (
                                    <>
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
                                    </>
                                ) : (
                                    <span className="text-muted-foreground">Select a preset...</span>
                                )}
                            </div>
                            <svg className="text-muted-foreground shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>
                    </div>

                    <div className="mb-4">
                        <Label className="mb-2 block">Customize</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Background</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={custom.backgroundColor}
                                        onChange={(e) => handleCustomChange('backgroundColor', e.target.value)}
                                        className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
                                    />
                                    <input
                                        type="text"
                                        value={custom.backgroundColor}
                                        onChange={(e) => handleCustomChange('backgroundColor', e.target.value)}
                                        className="flex-1 bg-input border border-border rounded px-2 py-1 text-xs text-foreground"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Text</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={custom.textColor}
                                        onChange={(e) => handleCustomChange('textColor', e.target.value)}
                                        className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
                                    />
                                    <input
                                        type="text"
                                        value={custom.textColor}
                                        onChange={(e) => handleCustomChange('textColor', e.target.value)}
                                        className="flex-1 bg-input border border-border rounded px-2 py-1 text-xs text-foreground"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Accent</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={custom.accentColor}
                                        onChange={(e) => handleCustomChange('accentColor', e.target.value)}
                                        className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
                                    />
                                    <input
                                        type="text"
                                        value={custom.accentColor}
                                        onChange={(e) => handleCustomChange('accentColor', e.target.value)}
                                        className="flex-1 bg-input border border-border rounded px-2 py-1 text-xs text-foreground"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Border Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={cssColorToHex(custom.borderColor)}
                                        onChange={(e) => handleCustomChange('borderColor', e.target.value)}
                                        className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
                                    />
                                    <input
                                        type="text"
                                        value={custom.borderColor}
                                        onChange={(e) => handleCustomChange('borderColor', e.target.value)}
                                        className="flex-1 bg-input border border-border rounded px-2 py-1 text-xs text-foreground"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Border Width</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="3"
                                    step="1"
                                    value={custom.borderWidth}
                                    onChange={(e) => handleCustomChange('borderWidth', parseInt(e.target.value))}
                                    className="w-full"
                                />
                                <span className="text-xs text-muted-foreground">{custom.borderWidth}px</span>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Border Radius</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="16"
                                    step="2"
                                    value={custom.borderRadius}
                                    onChange={(e) => handleCustomChange('borderRadius', parseInt(e.target.value))}
                                    className="w-full"
                                />
                                <span className="text-xs text-muted-foreground">{custom.borderRadius}px</span>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Font</label>
                                <select
                                    value={custom.font}
                                    onChange={(e) => handleCustomChange('font', e.target.value)}
                                    onFocus={() => GOOGLE_FONTS.forEach(f => loadGoogleFont(f.name))}
                                    className="w-full bg-input border border-border rounded px-2 py-1.5 text-xs text-foreground cursor-pointer"
                                    style={{ fontFamily: fontNameToCss(custom.font) }}
                                >
                                    {GOOGLE_FONTS.map(f => (
                                        <option key={f.name} value={f.name}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Font Weight</label>
                                <select
                                    value={custom.fontWeight}
                                    onChange={(e) => handleCustomChange('fontWeight', parseInt(e.target.value))}
                                    className="w-full bg-input border border-border rounded px-2 py-1.5 text-xs text-foreground cursor-pointer"
                                >
                                    <option value="200">Light (200)</option>
                                    <option value="400">Normal (400)</option>
                                    <option value="500">Medium (500)</option>
                                    <option value="700">Bold (700)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            Save
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <ThemeSelector
                selectedTheme={mode === 'preset' ? theme as PlayerColor['tag'] : undefined}
                onThemeSelect={handlePresetSelect}
                open={themeSelectorOpen}
                onOpenChange={setThemeSelectorOpen}
            />
        </>
    );
};
