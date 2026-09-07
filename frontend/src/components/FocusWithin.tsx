import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { getTranslations } from "../utils/translations";

type FocusWithinProps = {
  children: ReactNode;
};

export function FocusWithin({ children }: FocusWithinProps) {
  const [focused, setFocused] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const prompt = getTranslations().focusTypeBoxPrompt;
  const shortcutKey = "t";
  const promptLabel = prompt(shortcutKey).join("");
  const promptContent = prompt(
    <kbd
      key="focus-hotkey"
      dir="ltr"
      className="inline-flex min-w-7 items-center justify-center rounded-md border border-border bg-background px-2 py-0.5 font-mono text-base font-semibold shadow-sm"
    >
      {shortcutKey}
    </kbd>,
  );

  const focusTarget = useCallback(() => {
    containerRef.current
      ?.querySelector<HTMLElement>("textarea, input, [tabindex]")
      ?.focus();
  }, []);

  const handleBlur = useCallback((event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setFocused(false);
    }
  }, []);

  useEffect(() => {
    if (focused) return;

    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target;
      const isEditingAnotherControl =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement);

      if (
        event.key.toLowerCase() !== shortcutKey.toLowerCase() ||
        isEditingAnotherControl
      ) {
        return;
      }

      event.preventDefault();
      focusTarget();
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [focusTarget, focused, shortcutKey]);

  const preventFocusLoss = useCallback(
    (event: MouseEvent<HTMLDivElement>) => event.preventDefault(),
    [],
  );

  return (
    <div
      ref={containerRef}
      className="group/focus-within relative rounded-[calc(var(--radius,8px)*2)]"
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={handleBlur}
      onMouseDown={preventFocusLoss}
      onClick={focusTarget}
    >
      {children}
      <div
        role="status"
        aria-hidden={focused}
        aria-label={promptLabel}
        className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] px-6 text-center font-mono text-lg font-medium text-foreground transition-[opacity,backdrop-filter] duration-200 ease-out group-focus-within/focus-within:opacity-0 group-focus-within/focus-within:backdrop-blur-none ${focused ? "opacity-0 backdrop-blur-none" : "opacity-100 backdrop-blur-[2px]"}`}
      >
        <span>{promptContent}</span>
      </div>
    </div>
  );
}
