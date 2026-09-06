import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useId } from "react";
import { cn } from "../lib/utils";

interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly SelectOption<T>[];
  label?: string;
  ariaLabel?: string;
  className?: string;
  fluid?: boolean;
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  label,
  ariaLabel,
  className = "",
  fluid = false,
}: SelectProps<T>) {
  const selectId = useId();

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          id={`${selectId}-label`}
          className="text-xs font-medium text-muted-foreground"
        >
          {label}
        </label>
      )}

      <SelectPrimitive.Root value={value} onValueChange={onChange}>
        <SelectPrimitive.Trigger
          id={selectId}
          aria-label={ariaLabel}
          aria-labelledby={label ? `${selectId}-label` : undefined}
          className={cn(
            "group inline-flex h-9 cursor-pointer items-center justify-between gap-2 rounded-lg border border-border/60 bg-secondary px-3 text-left text-xs font-medium text-secondary-foreground outline-none transition-colors hover:border-border-hover hover:bg-secondary/80 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 data-[placeholder]:text-muted-foreground",
            fluid ? "min-w-0 w-full" : "min-w-[150px]",
          )}
        >
          <SelectPrimitive.Value className="min-w-0 flex-1 truncate" />
          <SelectPrimitive.Icon asChild>
            <ChevronDown
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-150 group-data-[state=open]:rotate-180"
              strokeWidth={1.75}
            />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={6}
            collisionPadding={8}
            className="z-2000 max-h-[min(20rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-xl motion-safe:animate-[themePopoverIn_120ms_ease-out]"
          >
            <SelectPrimitive.ScrollUpButton className="flex h-6 cursor-default items-center justify-center text-muted-foreground">
              <ChevronUp aria-hidden className="h-3.5 w-3.5" />
            </SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport>
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className="relative flex h-8 cursor-default select-none items-center rounded-md py-1.5 pl-3 pr-8 text-xs text-secondary-foreground outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-secondary data-[highlighted]:text-foreground data-[state=checked]:text-foreground"
                >
                  <SelectPrimitive.ItemText>
                    {option.label}
                  </SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="absolute right-2 inline-flex items-center text-accent-primary">
                    <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={2} />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton className="flex h-6 cursor-default items-center justify-center text-muted-foreground">
              <ChevronDown aria-hidden className="h-3.5 w-3.5" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}
