import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import {
  renderRaceScreenXterm,
  type RacePlayerProgress,
} from "../../../ssh-server/src/rendering";

const phrase =
  "The quick brown fox jumps over the lazy dog with steady hands.";

const CHARACTERS_PER_WORD = 5;

const buildPlayers = (
  inputLength: number,
  wpm: number
): RacePlayerProgress[] => {
  const novaProgressIndex = Math.min(
    phrase.length,
    Math.floor(inputLength * 0.75) + 6
  );
  const atlasProgressIndex = Math.min(
    phrase.length,
    Math.floor(inputLength * 0.55) + 12
  );

  return [
    {
      name: "You",
      progressIndex: inputLength,
      phraseLength: phrase.length,
      wpm,
      isCurrent: true,
    },
    {
      name: "Nova",
      progressIndex: novaProgressIndex,
      phraseLength: phrase.length,
      wpm: 76,
    },
    {
      name: "Atlas",
      progressIndex: atlasProgressIndex,
      phraseLength: phrase.length,
      wpm: 68,
    },
  ];
};

export const SshDemoPage = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const startTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const terminal = new Terminal({
      cursorBlink: true,
      fontFamily: "JetBrains Mono, monospace",
      fontSize: 16,
      theme: {
        background: "#202020",
      },
    });
    terminal.open(containerRef.current);

    let input = "";
    const width = terminal.cols || 80;

    const render = () => {
      const elapsedMinutes = Math.max(
        1 / 60,
        (performance.now() - startTimeRef.current) / 60000
      );
      const wpm = (input.length / CHARACTERS_PER_WORD) / elapsedMinutes;
      const screen = renderRaceScreenXterm({
        phrase,
        input,
        players: buildPlayers(input.length, wpm),
        width,
      });
      terminal.write("\x1b[2J\x1b[H");
      terminal.write(screen);
    };

    let renderPending = false;
    const scheduleRender = () => {
      if (renderPending) {
        return;
      }
      renderPending = true;
      requestAnimationFrame(() => {
        renderPending = false;
        render();
      });
    };

    const handleData = terminal.onData((data) => {
      for (const char of data) {
        if (char === "\u007f" || char === "\b") {
          input = input.slice(0, Math.max(0, input.length - 1));
          continue;
        }
        if (char >= " " && char !== "\u007f") {
          if (input.length < phrase.length) {
            input += char;
          }
        }
      }
      scheduleRender();
    });

    scheduleRender();
    terminal.focus();

    return () => {
      handleData.dispose();
      terminal.dispose();
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="content-container w-full">
        <div className="box w-full rounded-lg p-4">
          <div
            ref={containerRef}
            className="w-full"
            style={{ height: "520px" }}
          />
        </div>
      </div>
    </div>
  );
};
