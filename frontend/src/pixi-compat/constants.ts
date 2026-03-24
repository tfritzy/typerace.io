export * from "pixi.js";

const blendModes = {
  NORMAL: "normal",
} as Record<string, string>;

export const BLEND_MODES = new Proxy(blendModes, {
  get(target, prop) {
    if (typeof prop !== "string") return target.NORMAL;
    return target[prop] ?? prop.toLowerCase().replaceAll("_", "-");
  },
});
