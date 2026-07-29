import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import {
  THEME_PRESETS,
  applyTheme,
  getInitialTheme,
  previewTheme,
  type ThemeTag,
} from "../utils/themes";

const themeTags: ThemeTag[] = [
  "EverforestDark",
  "Nord",
  "Cobalt2",
  "OneDark",
  "Dracula",
  "GruvboxDark",
  "Monokai",
  "GitHubDarkDimmed",
  "Kanagawa",
  "CatppuccinMocha",
  "TokyoNight",
  "NightOwl",
  "AyuDark",
];

function ThemeList({
  themes,
  selectedTheme,
  onSelect,
}: {
  themes: ThemeTag[];
  selectedTheme: string;
  onSelect: (tag: ThemeTag) => void;
}) {
  return (
    <div className="py-1">
      {themes.map((tag) => {
        const isSelected = selectedTheme === tag;

        return (
          <button
            key={tag}
            type="button"
            aria-pressed={isSelected}
            onMouseEnter={() => previewTheme(tag)}
            onClick={() => onSelect(tag)}
            className={`flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-1.5 text-left text-sm transition-colors ${
              isSelected ? "bg-muted font-semibold" : "hover:bg-muted"
            }`}
            style={{ color: THEME_PRESETS[tag].accentColor }}
          >
            <span className="truncate">{THEME_PRESETS[tag].name}</span>
            {isSelected && <Check className="size-3.5 shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

type ThemeShowcaseModalProps = {
  open: boolean;
  onClose: () => void;
};

export const ThemeShowcaseModal = ({
  open,
  onClose,
}: ThemeShowcaseModalProps) => {
  const [selectedTheme, setSelectedTheme] = useState(getInitialTheme);
  const committedTheme = useRef(getInitialTheme());
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const currentTheme = getInitialTheme();
    committedTheme.current = currentTheme;
    setSelectedTheme(currentTheme);

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        popoverRef.current?.contains(target) ||
        (target instanceof Element && target.closest("[data-theme-trigger]"))
      ) {
        return;
      }
      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      applyTheme(committedTheme.current);
    };
  }, [open]);

  const selectTheme = (tag: ThemeTag) => {
    committedTheme.current = tag;
    setSelectedTheme(tag);
    applyTheme(tag);
  };

  if (!open) return null;

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Choose a theme"
      onMouseLeave={() => applyTheme(committedTheme.current)}
      className="absolute bottom-full right-0 z-50 mb-2 w-48 max-w-[calc(100vw-2rem)] overflow-hidden rounded-md border border-border bg-popover shadow-xl animate-[themePopoverIn_120ms_ease-out]"
    >
      <div className="max-h-[70vh] overflow-y-auto">
        <ThemeList
          themes={themeTags}
          selectedTheme={selectedTheme}
          onSelect={selectTheme}
        />
      </div>
    </div>
  );
};
