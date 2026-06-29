import { BoxRenderable, CliRenderer, Renderable } from "@opentui/core";

export class ResultBox {
  constructor(renderer: CliRenderer, parent: Renderable, contents: Renderable) {
    const box = new BoxRenderable(renderer, {
      border: true,
      borderColor: "#282828",
      paddingX: 2,
      paddingY: 0,
    });

    box.add(contents);
    parent.add(box);
  }
}
