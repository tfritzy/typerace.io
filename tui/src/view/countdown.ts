import { CliRenderer, TextRenderable } from "@opentui/core";
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

  constructor(renderer: CliRenderer) {
    this.text = new TextRenderable(renderer, {
      fg: THEME.fg1,
      position: "absolute",
      left: "50%",
      top: "50%",
      visible: false,
    });

    renderer.root.add(this.text);
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
          numberStart_ms - i + 750,
        );
      }

      setTimeout(() => {
        this.text.destroyRecursively();
      }, numberStart_ms);
    }, delay);
  }
}
