interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
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
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-muted-foreground">
          {label}
        </label>
      )}
      <div className={`relative ${fluid ? "min-w-0" : "min-w-[150px]"}`}>
        <select
          aria-label={ariaLabel ?? label}
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          className="h-[42px] w-full cursor-pointer appearance-none rounded-md border border-border bg-input py-2.5 pl-4 pr-10 text-sm text-foreground outline-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}
