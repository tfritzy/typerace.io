import { BoxRenderable, TextRenderable, type CliRenderer } from "@opentui/core";

type SessionControls = {
  end(): void;
};

export function mountCounter(
  renderer: CliRenderer,
  session: SessionControls,
): void {
  renderer.setBackgroundColor("#282828");

  const screen = new BoxRenderable(renderer, {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  });

  const complete = new TextRenderable(renderer, {
    content: "The quick brow",
    fg: "#a89984",
  });
  const cursor = new TextRenderable(renderer, {
    content: "n",
    fg: "#fbf1c7",
    bg: "#fabd2f",
  });
  const incomplete = new TextRenderable(renderer, {
    content: " fox jumped over the thingy",
    fg: "#d5c4a1",
  });

  screen.add(complete);
  screen.add(cursor);
  screen.add(incomplete);
  renderer.root.add(screen);

  let count = 0;
  renderer.keyInput.on("keypress", (key) => {
    if (key.ctrl && key.name === "c") {
      session.end();
      return;
    }

    count = count + 1;
    // counter.content = String(count);
  });
}
