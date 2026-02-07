import { Server } from "ssh2";
import { renderRaceScreenAnsi, type RacePlayerProgress } from "./rendering";

type AuthContext = {
  accept: () => void;
  reject: () => void;
  method?: string;
  username?: string;
};

export type SshRaceServerOptions = {
  hostKeys: Buffer[];
  phrase: string;
  attribution?: string;
  width?: number;
  getPlayers?: (input: string) => RacePlayerProgress[];
  authenticate?: (ctx: AuthContext) => boolean | Promise<boolean>;
  allowGuest?: boolean;
};

const isPrintable = (char: string): boolean => {
  if (char === "\r" || char === "\n") {
    return false;
  }
  return char >= " " && char !== "\u007f";
};

export const createSshRaceServer = (
  options: SshRaceServerOptions
): Server =>
  new Server({ hostKeys: options.hostKeys }, (client) => {
    client.on("authentication", (ctx) => {
      if (options.authenticate) {
        Promise.resolve(options.authenticate(ctx))
          .then((allowed) => {
            if (allowed) {
              ctx.accept();
            } else {
              ctx.reject();
            }
          })
          .catch(() => {
            ctx.reject();
          });
        return;
      }

      if (options.allowGuest) {
        ctx.accept();
      } else {
        ctx.reject();
      }
    });

    client.on("ready", () => {
      client.on("session", (accept) => {
        const session = accept();

        session.on("pty", (acceptPty) => {
          acceptPty();
        });

        session.on("shell", (acceptShell) => {
          const stream = acceptShell();
          let input = "";
          const raceStart = Date.now();

          const buildPlayers = (): RacePlayerProgress[] => {
            if (options.getPlayers) {
              return options.getPlayers(input);
            }
            const elapsedMinutes = Math.max(1 / 60, (Date.now() - raceStart) / 60000);
            const wpm = (input.length / 5) / elapsedMinutes;
            return [
              {
                name: "You",
                progressIndex: input.length,
                phraseLength: options.phrase.length,
                wpm,
                isCurrent: true,
              },
            ];
          };

          const renderScreen = () => {
            const screen = renderRaceScreenAnsi({
              phrase: options.phrase,
              input,
              players: buildPlayers(),
              attribution: options.attribution,
              width: options.width,
            });
            stream.write("\x1b[2J\x1b[H\x1b[?25l");
            stream.write(screen);
          };

          renderScreen();

          stream.on("data", (data: Buffer) => {
            const chunk = data.toString("utf8");
            for (const char of chunk) {
              if (char === "\u0003") {
                stream.end();
                return;
              }
              if (char === "\u007f" || char === "\b") {
                input = input.slice(0, Math.max(0, input.length - 1));
                continue;
              }
              if (isPrintable(char) && input.length < options.phrase.length) {
                input += char;
              }
            }
            renderScreen();
          });

          stream.on("close", () => {
            stream.write("\x1b[?25h");
            client.end();
          });
        });
      });
    });
  });
