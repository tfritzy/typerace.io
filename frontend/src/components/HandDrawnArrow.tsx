type HandDrawnArrowProps = {
  className?: string;
};

export function HandDrawnArrow({ className }: HandDrawnArrowProps) {
  return (
    <svg
      viewBox="30 10 125 255"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M145 18C65 25 35 65 42 145C45 177 58 200 83 216"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M63 247L109 260L130 207"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
