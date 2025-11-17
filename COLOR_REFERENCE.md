# Color Palette Reference

## All 10 Player Colors

Each color includes 5 shades for avatar generation and a gradient for UI elements.

### 1. Amber (Default)
- **Primary**: #fbbf24 🟡
- **Gradient**: #f59e0b → #fbbf24
- **Avatar Palette**: #fbbf24, #f59e0b, #d97706, #b45309, #92400e
- **Best for**: Warm, welcoming, gold tones

### 2. Blue
- **Primary**: #3b82f6 🔵
- **Gradient**: #2563eb → #3b82f6
- **Avatar Palette**: #3b82f6, #2563eb, #1d4ed8, #1e40af, #1e3a8a
- **Best for**: Professional, calm, trustworthy

### 3. Green
- **Primary**: #10b981 🟢
- **Gradient**: #059669 → #10b981
- **Avatar Palette**: #10b981, #059669, #047857, #065f46, #064e3b
- **Best for**: Fresh, natural, growth

### 4. Purple
- **Primary**: #a855f7 🟣
- **Gradient**: #9333ea → #a855f7
- **Avatar Palette**: #a855f7, #9333ea, #7e22ce, #6b21a8, #581c87
- **Best for**: Creative, royal, mysterious

### 5. Red
- **Primary**: #ef4444 🔴
- **Gradient**: #dc2626 → #ef4444
- **Avatar Palette**: #ef4444, #dc2626, #b91c1c, #991b1b, #7f1d1d
- **Best for**: Bold, energetic, passionate

### 6. Pink
- **Primary**: #ec4899 🩷
- **Gradient**: #db2777 → #ec4899
- **Avatar Palette**: #ec4899, #db2777, #be185d, #9f1239, #831843
- **Best for**: Vibrant, playful, unique

### 7. Cyan
- **Primary**: #06b6d4 🩵
- **Gradient**: #0891b2 → #06b6d4
- **Avatar Palette**: #06b6d4, #0891b2, #0e7490, #155e75, #164e63
- **Best for**: Modern, tech, electric

### 8. Orange
- **Primary**: #f97316 🟠
- **Gradient**: #ea580c → #f97316
- **Avatar Palette**: #f97316, #ea580c, #c2410c, #9a3412, #7c2d12
- **Best for**: Energetic, enthusiastic, warm

### 9. Lime
- **Primary**: #84cc16 🟢
- **Gradient**: #65a30d → #84cc16
- **Avatar Palette**: #84cc16, #65a30d, #4d7c0f, #3f6212, #365314
- **Best for**: Fresh, vibrant, energetic

### 10. Indigo
- **Primary**: #6366f1 🔵
- **Gradient**: #4f46e5 → #6366f1
- **Avatar Palette**: #6366f1, #4f46e5, #4338ca, #3730a3, #312e81
- **Best for**: Deep, rich, sophisticated

## Color Contrast & Accessibility

All colors have been tested against the app's dark background (#202020):
- ✅ All primary colors meet WCAG AA contrast requirements
- ✅ Gradients maintain visibility
- ✅ Avatar palettes provide good visual distinction
- ✅ Colors are distinguishable in multiplayer scenarios

## Usage in UI

### Avatar Borders
Uses the primary color:
```tsx
style={{ borderColor: colorConfig.primary }}
```

### Progress Bars
Uses the gradient:
```tsx
style={{ background: colorConfig.gradient }}
```

### Avatar Pixels
Uses the 5-color palette:
```tsx
<Avatar colors={colorConfig.avatarColors} />
```

### Text Highlights
Uses the primary color:
```tsx
style={{ color: colorConfig.primary }}
```

### Glow Effects
Uses the primary color with opacity:
```tsx
style={{ boxShadow: `0 0 20px ${colorConfig.primary}` }}
```

## Color Distribution Strategy

### For New Players
- Default: Amber (familiar, welcoming)

### For Bots
- Random selection from all 10 colors
- Ensures visual variety in public games
- Players can tell bots apart

### For Player Choice
- All 10 colors immediately available
- No unlock mechanism (keep it simple)
- Instant feedback when changed

## Design Considerations

1. **Distinctiveness**: Each color is easily distinguishable from others
2. **Dark Background**: All colors pop against #202020
3. **Gradient Quality**: Smooth transitions, no harsh jumps
4. **Avatar Palettes**: 5 colors provide good variation for pixel art
5. **Psychological**: Colors chosen to evoke different moods/personalities

## Testing Color Combinations

In multiplayer scenarios with 3 players:
- ✅ Amber + Blue + Green - Clear distinction
- ✅ Red + Purple + Pink - All clearly different
- ✅ Cyan + Lime + Orange - High contrast
- ✅ Any combination of 3 colors remains distinguishable
