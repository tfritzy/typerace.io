import {
  BoxOptions,
  BoxRenderable,
  CliRenderer,
  Renderable,
  TextAttributes,
  TextRenderable,
} from "@opentui/core";
import { THEME } from "../theme";

export class ResultBox {
  private text: TextRenderable;
  private box: BoxRenderable;
  private titleNode?: TextRenderable;

  constructor(
    renderer: CliRenderer,
    parent: Renderable,
    text: string,
    title?: string,
    props?: Partial<BoxOptions>,
    gold?: boolean,
  ) {
    this.box = new BoxRenderable(renderer, {
      border: true,
      borderColor: gold ? THEME.accent : THEME.bg0,
      paddingX: 2,
      paddingY: 0,
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      ...props,
    });

    if (title) {
      this.titleNode = new TextRenderable(renderer, {
        position: "absolute",
        content: ` ${title} `,
        top: -1,
        left: "50%",
        bg: THEME.bg0_h,
        fg: gold ? THEME.accent : THEME.bg1,
        paddingX: 1,
      });
      this.titleNode.translateX = -Math.floor((title.length + 2) / 2);
      this.box.add(this.titleNode);
    }

    this.text = new TextRenderable(renderer, {
      content: text,
      fg: gold ? THEME.accent : THEME.fg1,
    });
    this.box.add(this.text);
    parent.add(this.box);
  }

  public setText(content: string, gold: boolean) {
    this.text.content = content;
    if (gold) {
      this.text.fg = THEME.accent;
      if (this.titleNode) this.titleNode.fg = THEME.accent;
      this.box.borderColor = THEME.accent;
    } else {
      this.text.fg = THEME.fg1;
      if (this.titleNode) this.titleNode.fg = THEME.bg0_h;
      this.box.borderColor = THEME.bg0;
    }
  }
}
