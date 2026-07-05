import { BoxRenderable, CliRenderer, TextRenderable } from "@opentui/core";
import { THEME } from "../theme";

const numbers = [
  `
 ██████╗ 
██╔═████╗
██║██╔██║
████╔╝██║
╚██████╔╝
 ╚═════╝ 
`,
  `
 ██╗
███║
╚██║
 ██║
 ██║
 ╚═╝
`,
  `
██████╗ 
╚════██╗
 █████╔╝
██╔═══╝ 
███████╗
╚══════╝
`,
  `
██████╗ 
╚════██╗
 █████╔╝
 ╚═══██╗
██████╔╝
╚═════╝ 
`,
  `
██╗  ██╗
██║  ██║
███████║
╚════██║
     ██║
     ╚═╝
`,
  `
███████╗
██╔════╝
███████╗
╚════██║
███████║
╚══════╝
`,
];

export class Countdown {
  private text: TextRenderable;
  private cleanup: () => void;

  constructor(renderer: CliRenderer) {
    const box = new BoxRenderable(renderer, {
      width: "100%",
      height: "100%",
      position: "absolute",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    });

    this.text = new TextRenderable(renderer, {
      fg: THEME.fg1,
      visible: false,
    });

    box.add(this.text);
    renderer.root.add(box);

    this.cleanup = () => {
      box.destroyRecursively();
    };
  }

  public start(duration_ms: number) {
    this.text.visible = true;

    const numberStart_ms = Math.round(duration_ms / 1000) * 1000;
    const delay = duration_ms - numberStart_ms;

    setTimeout(() => {
      for (let i = numberStart_ms; i > 0; i -= 1000) {
        setTimeout(() => {
          this.text.content = numbers[i / 1000];
        }, numberStart_ms - i);

        setTimeout(
          () => {
            this.text.content = "";
          },
          numberStart_ms - i + 900,
        );
      }

      setTimeout(() => {
        this.cleanup();
      }, numberStart_ms);
    }, delay);
  }
}
