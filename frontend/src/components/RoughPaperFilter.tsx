export function RoughPaperFilter({ id }: { id: string }) {
  return (
    <svg className="absolute w-0 h-0" aria-hidden="true">
      <filter
        id={id}
        x="-10%"
        y="-10%"
        width="120%"
        height="120%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.52"
          numOctaves="6"
          seed="8"
          result="paperGrain"
        />
        <feColorMatrix
          in="paperGrain"
          type="luminanceToAlpha"
          result="grainAlpha"
        />
        <feComponentTransfer in="grainAlpha" result="texturedGrain">
          <feFuncA type="table" tableValues="0.2 0.33 0.73 1" />
        </feComponentTransfer>
        <feComposite
          in="SourceGraphic"
          in2="texturedGrain"
          operator="in"
        />
      </filter>
    </svg>
  );
}
