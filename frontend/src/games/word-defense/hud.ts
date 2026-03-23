import { Container, Graphics, Text } from "pixi.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { getPalette, ACCENT_PRIMARY_INDEX, PRIMARY_INDEX } from "./palette";

function packColor(rgb: [number, number, number]): number {
  return (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];
}

export class GameHud {
  readonly container: Container;

  private creditsLabel: Text;
  private habitabilityLabel: Text;
  private habitabilityBarBg: Graphics;
  private habitabilityBarFill: Graphics;
  private habitabilityBarGlow: Graphics;
  private gameOverText: Text;
  private startButton: Container;
  private startButtonText: Text;

  constructor(onStartWave: () => void) {
    this.container = new Container();

    this.creditsLabel = new Text({
      text: "Credits: 0",
      style: { fontFamily: "monospace", fontWeight: "bold", fontSize: 24, fill: 0xffffff },
    });
    this.creditsLabel.anchor.set(1, 0);
    this.creditsLabel.position.set(CANVAS_WIDTH - 20, 12);
    this.creditsLabel.alpha = 0.7;
    this.container.addChild(this.creditsLabel);

    const accentColor = packColor(getPalette()[ACCENT_PRIMARY_INDEX]);

    this.habitabilityLabel = new Text({
      text: "Planet Habitability",
      style: { fontFamily: "monospace", fontWeight: "bold", fontSize: 12, fill: accentColor },
    });
    this.habitabilityLabel.position.set(20, 44);
    this.container.addChild(this.habitabilityLabel);

    this.habitabilityBarBg = new Graphics();
    this.habitabilityBarBg.rect(20, 60, 200, 10);
    this.habitabilityBarBg.fill({ color: 0xffffff, alpha: 0.06 });
    this.habitabilityBarBg.stroke({ color: accentColor, alpha: 0.3, width: 1 });
    this.container.addChild(this.habitabilityBarBg);

    this.habitabilityBarGlow = new Graphics();
    this.container.addChild(this.habitabilityBarGlow);

    this.habitabilityBarFill = new Graphics();
    this.container.addChild(this.habitabilityBarFill);

    this.gameOverText = new Text({
      text: "GAME OVER",
      style: { fontFamily: "monospace", fontWeight: "bold", fontSize: 64, fill: 0xff4444 },
    });
    this.gameOverText.anchor.set(0.5);
    this.gameOverText.position.set(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    this.gameOverText.visible = false;
    this.container.addChild(this.gameOverText);

    this.startButton = new Container();
    this.startButton.position.set(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 60);
    this.startButton.visible = false;
    this.startButton.eventMode = "static";
    this.startButton.cursor = "pointer";
    this.startButton.on("pointertap", onStartWave);

    const btnBg = new Graphics();
    btnBg.roundRect(-90, -20, 180, 40, 8);
    btnBg.fill(0x3b82f6);
    this.startButton.addChild(btnBg);

    this.startButtonText = new Text({
      text: "Start Wave 2",
      style: { fontFamily: "monospace", fontWeight: "bold", fontSize: 16, fill: 0xffffff },
    });
    this.startButtonText.anchor.set(0.5);
    this.startButton.addChild(this.startButtonText);

    this.container.addChild(this.startButton);
  }

  updateCredits(credits: number) {
    this.creditsLabel.text = `Credits: ${credits}`;
  }

  updateHabitability(fraction: number) {
    const palette = getPalette();
    const accentColor = packColor(palette[ACCENT_PRIMARY_INDEX]);
    const primaryColor = packColor(palette[PRIMARY_INDEX]);

    const fillWidth = Math.max(0, 200 * fraction);

    const barColor = fraction > 0.3 ? accentColor : primaryColor;

    this.habitabilityBarFill.clear();
    if (fillWidth > 0) {
      this.habitabilityBarFill.rect(20, 60, fillWidth, 10);
      this.habitabilityBarFill.fill({ color: barColor, alpha: 0.85 });
    }

    this.habitabilityBarGlow.clear();
    if (fillWidth > 0) {
      this.habitabilityBarGlow.rect(20, 59, fillWidth, 12);
      this.habitabilityBarGlow.fill({ color: barColor, alpha: 0.15 });
    }

    const pct = Math.round(fraction * 100);
    this.habitabilityLabel.text = `Planet Habitability ${pct}%`;
  }

  showGameOver() {
    this.gameOverText.visible = true;
  }

  showStartButton(nextWaveNumber: number) {
    this.startButtonText.text = `Start Wave ${nextWaveNumber}`;
    this.startButton.visible = true;
  }

  hideStartButton() {
    this.startButton.visible = false;
  }
}
