import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const streaks = [
  { top: 8, width: 22, dur: 4.2, delay: 0, op: 0.15, h: 1 },
  { top: 15, width: 35, dur: 3.2, delay: 1.0, op: 0.2, h: 1 },
  { top: 22, width: 18, dur: 5.5, delay: 0.4, op: 0.12, h: 1 },
  { top: 30, width: 28, dur: 2.8, delay: 1.8, op: 0.25, h: 2 },
  { top: 38, width: 20, dur: 4.0, delay: 0.7, op: 0.14, h: 1 },
  { top: 45, width: 40, dur: 3.0, delay: 1.4, op: 0.22, h: 1 },
  { top: 53, width: 16, dur: 5.0, delay: 0.2, op: 0.13, h: 1 },
  { top: 60, width: 30, dur: 3.5, delay: 2.2, op: 0.2, h: 2 },
  { top: 67, width: 24, dur: 4.5, delay: 0.9, op: 0.16, h: 1 },
  { top: 74, width: 38, dur: 2.6, delay: 0.5, op: 0.24, h: 1 },
  { top: 82, width: 14, dur: 5.8, delay: 1.6, op: 0.1, h: 1 },
  { top: 88, width: 32, dur: 3.3, delay: 2.0, op: 0.18, h: 2 },
];

const bands = [
  { top: 18, dur: 8, delay: 0, op: 0.03, h: 60 },
  { top: 45, dur: 10, delay: 3, op: 0.025, h: 80 },
  { top: 72, dur: 9, delay: 1.5, op: 0.02, h: 50 },
];

export const RacingBackground = () => {
  const location = useLocation();
  const isLobby =
    location.pathname === "/" || /^\/[a-z]{2,3}\/?$/.test(location.pathname);
  const [shouldRender, setShouldRender] = useState(isLobby);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (isLobby) {
      setShouldRender(true);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setActive(true));
      });
      return () => cancelAnimationFrame(frame);
    } else {
      setActive(false);
      const timer = setTimeout(() => setShouldRender(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isLobby]);

  if (!shouldRender) return null;

  return (
    <div
      className="racing-background"
      style={{
        opacity: active ? 1 : 0,
        transition: active ? "opacity 1.2s ease-out" : "opacity 0.6s ease-in",
      }}
    >
      <div className="racing-glow" />
      <div className="racing-vignette" />
      {bands.map((b, i) => (
        <div
          key={`band-${i}`}
          className="racing-streak"
          style={{
            top: `${b.top}%`,
            width: "50vw",
            height: `${b.h}px`,
            background: `linear-gradient(90deg, transparent, rgba(251, 191, 36, ${b.op}) 30%, rgba(251, 191, 36, ${b.op * 1.3}) 50%, rgba(251, 191, 36, ${b.op}) 70%, transparent)`,
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
            filter: "blur(20px)",
          }}
        />
      ))}
      {streaks.map((s, i) => (
        <div
          key={`streak-${i}`}
          className="racing-streak"
          style={{
            top: `${s.top}%`,
            width: `${s.width}vw`,
            height: `${s.h}px`,
            background: `linear-gradient(90deg, transparent, rgba(251, 191, 36, ${s.op}) 15%, rgba(251, 191, 36, ${s.op * 1.5}) 50%, rgba(251, 191, 36, ${s.op}) 85%, transparent)`,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
};
