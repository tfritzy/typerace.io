import { Graphics } from "pixi.js";
import { Team } from "./types";

export function drawExpression(
  g: Graphics,
  team: Team,
  shipWidth: number,
  shipHeight: number
): void {
  const eyeX = shipWidth * 0.15;
  const eyeSpread = shipHeight * 0.18;
  const eyeRadius = Math.max(0.8, Math.min(1.5, shipWidth * 0.045));
  const pupilRadius = eyeRadius * 0.45;

  if (team === Team.Allied) {
    g.circle(eyeX, -eyeSpread, eyeRadius);
    g.fill({ color: 0xffffff });
    g.circle(eyeX + pupilRadius * 0.4, -eyeSpread, pupilRadius);
    g.fill({ color: 0x1a1a2e });

    g.circle(eyeX, eyeSpread, eyeRadius);
    g.fill({ color: 0xffffff });
    g.circle(eyeX + pupilRadius * 0.4, eyeSpread, pupilRadius);
    g.fill({ color: 0x1a1a2e });
  } else {
    g.circle(eyeX, -eyeSpread, eyeRadius);
    g.fill({ color: 0xff4444 });

    g.circle(eyeX, eyeSpread, eyeRadius);
    g.fill({ color: 0xff4444 });

    const browLen = eyeRadius * 2;
    g.moveTo(eyeX - browLen * 0.6, -eyeSpread - eyeRadius * 1.8);
    g.lineTo(eyeX + browLen * 0.6, -eyeSpread - eyeRadius * 0.5);
    g.stroke({ color: 0xff4444, width: 0.6 });

    g.moveTo(eyeX - browLen * 0.6, eyeSpread + eyeRadius * 1.8);
    g.lineTo(eyeX + browLen * 0.6, eyeSpread + eyeRadius * 0.5);
    g.stroke({ color: 0xff4444, width: 0.6 });
  }
}
