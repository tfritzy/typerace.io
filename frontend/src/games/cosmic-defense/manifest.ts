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
        { alias: "projectile-1", src: "/pixel_starships_kit/Projectiles/projectile-1.json" },
        { alias: "projectile-2", src: "/pixel_starships_kit/Projectiles/projectile-2.json" },
        { alias: "projectile-3", src: "/pixel_starships_kit/Projectiles/projectile-3.json" },
        { alias: "projectile-4", src: "/pixel_starships_kit/Projectiles/projectile-4.json" },
        { alias: "projectile-5", src: "/pixel_starships_kit/Projectiles/projectile-5.json" },
        { alias: "projectile-6", src: "/pixel_starships_kit/Projectiles/projectile-6.json" },
        { alias: "plasma-explosion", src: "/Effect and FX/Effects 1/SpriteSheet/plasma-explosion.json" },
        { alias: "ship-death-explosion", src: "/Effect and FX/Effects 4/SpriteSheet/ship-death-explosion.json" },
        { alias: "ice-explosion", src: "/Effect and FX/Effects 10/SpriteSheet/ice-explosion.json" },
        { alias: "warp-in", src: "/Effect and FX/Effects 5/SpriteSheet/209.png" },
      ],
    },
  ],
};
