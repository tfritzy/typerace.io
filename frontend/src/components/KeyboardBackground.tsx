const ROWS: string[][] = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'"],
  ["Z", "X", "C", "V", "B", "N", "M", ",", ".", "/"],
];

const ROW_OFFSETS = [0, 0.5, 0.85, 1.35];

const HOME_ROW_KEYS = new Set(["A", "S", "D", "F", "J", "K", "L", ";"]);

const KEY_SIZE = 52;
const GAP = 6;
const UNIT = KEY_SIZE + GAP;
const PAD = 20;

const BOARD_WIDTH = PAD + 12 * UNIT + PAD;
const ROWS_HEIGHT = ROWS.length * UNIT;
const SPACE_ROW_HEIGHT = UNIT;
const BOARD_HEIGHT = PAD + ROWS_HEIGHT + SPACE_ROW_HEIGHT + PAD;

const AMBER = "251, 191, 36";

export const KeyboardBackground = () => {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      <div
        style={{
          position: "absolute",
          bottom: "-40px",
          left: "50%",
          transform:
            "translateX(-50%) perspective(1100px) rotateX(42deg)",
          transformOrigin: "bottom center",
        }}
      >
        <svg
          width={BOARD_WIDTH}
          height={BOARD_HEIGHT}
          viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="kb-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="board-fade" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor={`rgba(${AMBER}, 0.06)`} />
              <stop offset="100%" stopColor={`rgba(${AMBER}, 0.01)`} />
            </radialGradient>
          </defs>

          <rect
            x={0}
            y={0}
            width={BOARD_WIDTH}
            height={BOARD_HEIGHT}
            rx={14}
            fill="url(#board-fade)"
            stroke={`rgba(${AMBER}, 0.18)`}
            strokeWidth={1.5}
          />

          {ROWS.map((row, rowIdx) =>
            row.map((label, colIdx) => {
              const isHome = HOME_ROW_KEYS.has(label);
              const x = PAD + (colIdx + ROW_OFFSETS[rowIdx]) * UNIT;
              const y = PAD + rowIdx * UNIT;
              return (
                <g
                  key={`${rowIdx}-${colIdx}`}
                  filter={isHome ? "url(#kb-glow)" : undefined}
                >
                  <rect
                    x={x}
                    y={y}
                    width={KEY_SIZE}
                    height={KEY_SIZE}
                    rx={7}
                    fill={
                      isHome
                        ? `rgba(${AMBER}, 0.12)`
                        : `rgba(${AMBER}, 0.04)`
                    }
                    stroke={
                      isHome
                        ? `rgba(${AMBER}, 0.55)`
                        : `rgba(${AMBER}, 0.22)`
                    }
                    strokeWidth={1}
                  />
                  <text
                    x={x + KEY_SIZE / 2}
                    y={y + KEY_SIZE / 2 + 5}
                    textAnchor="middle"
                    fill={
                      isHome
                        ? `rgba(${AMBER}, 0.75)`
                        : `rgba(${AMBER}, 0.35)`
                    }
                    fontSize={13}
                    fontFamily="JetBrains Mono, ui-monospace, monospace"
                    fontWeight={isHome ? 400 : 200}
                  >
                    {label}
                  </text>
                </g>
              );
            })
          )}

          <rect
            x={PAD + ROW_OFFSETS[3] * UNIT + 2.5 * UNIT}
            y={PAD + ROWS.length * UNIT}
            width={5.5 * UNIT}
            height={KEY_SIZE}
            rx={7}
            fill={`rgba(${AMBER}, 0.04)`}
            stroke={`rgba(${AMBER}, 0.22)`}
            strokeWidth={1}
          />
        </svg>
      </div>
    </div>
  );
};
