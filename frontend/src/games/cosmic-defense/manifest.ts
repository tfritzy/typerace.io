import type { AssetsManifest } from "pixi.js";

export const MANIFEST: AssetsManifest = {
  bundles: [
    {
      name: "cosmic-defense",
      assets: [
        { alias: "background", src: "/pixel_starships_kit/Backgrounds/Background.png" },
        { alias: "planets", src: "/pixel_starships_kit/Backgrounds/planets.json" },
        { alias: "spaceships", src: "/pixel_starships_kit/SpaceShips/spaceships.json" },
        { alias: "spaceships-colormap", src: "/pixel_starships_kit/SpaceShips/spaceships-colormap.json" },
        { alias: "spaceships-shield", src: "/pixel_starships_kit/SpaceShips/spaceships-shield.json" },
        { alias: "color-preset-1", src: "/pixel_starships_kit/SpaceShips/SpaceShip Color Preset 1.png" },
        { alias: "color-preset-2", src: "/pixel_starships_kit/SpaceShips/SpaceShip Color Preset 2.png" },
        { alias: "color-preset-3", src: "/pixel_starships_kit/SpaceShips/SpaceShip Color Preset 3.png" },
        { alias: "color-preset-4", src: "/pixel_starships_kit/SpaceShips/SpaceShip Color Preset 4.png" },
        { alias: "plasma-explosion", src: "/Effect and FX/Effects 1/SpriteSheet/plasma-explosion.json" },
        { alias: "ship-death-explosion", src: "/Effect and FX/Effects 4/SpriteSheet/ship-death-explosion.json" },
        { alias: "ice-explosion", src: "/Effect and FX/Effects 10/SpriteSheet/ice-explosion.json" },
        { alias: "hawk-explosion", src: "/Effect and FX/Effects 6/SpriteSheet/hawk-explosion.json" },
        { alias: "moth-explosion", src: "/Effect and FX/Effects 8/SpriteSheet/moth-explosion.json" },
        { alias: "warp-in", src: "/Effect and FX/Effects 5/SpriteSheet/warp-in.json" },
        { alias: "chain-hit", src: "/Effect and FX/Effects 14/SpriteSheet/chain-hit.json" },
      ],
    },
  ],
};
