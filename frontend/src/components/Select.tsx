type SelectProps = {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    label?: string;
    className?: string;
};

export const Select = ({ value, onChange, options, label, className = '' }: SelectProps) => {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {label && (
                <label className="text-muted-foreground text-xs font-medium">
                    {label}
                </label>
            )}
            <div className="relative min-w-[150px]">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-input text-foreground border border-border rounded-md pl-4 pr-10 py-2.5 text-sm cursor-pointer outline-none appearance-none h-[42px]"
                >
                    {options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
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
};
