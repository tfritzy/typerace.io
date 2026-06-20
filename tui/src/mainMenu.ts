import { BoxRenderable, TextRenderable, type CliRenderer } from "@opentui/core";
import { mountTypeBox } from "./typebox";

export function mountMainMenu(renderer: CliRenderer): void {
  renderer.setBackgroundColor("#282828");

  const screen = new BoxRenderable(renderer, {
    width: "100%",
    height: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  });

  const typeBox = mountTypeBox(
    renderer,
    "The quick brown fox jumped over the thingy",
    () => {},
  );

  screen.add(typeBox);
  renderer.root.add(screen);
}
