import type { AssetsManifest } from "pixi.js";

const BASE = "/pixel_starships_kit";

export const MANIFEST: AssetsManifest = {
  bundles: [
    {
      name: "planetary-defense",
      assets: [
        { alias: "background", src: `${BASE}/Backgrounds/Background.png` },

        { alias: "planets", src: `${BASE}/Backgrounds/planets.json` },
        { alias: "planets-ring", src: `${BASE}/Backgrounds/planets-ring.json` },
        { alias: "stars-particle", src: `${BASE}/Backgrounds/stars-particle.json` },

        { alias: "spaceships", src: `${BASE}/SpaceShips/spaceships.json` },
        { alias: "spaceships-colormap", src: `${BASE}/SpaceShips/spaceships-colormap.json` },
        { alias: "spaceships-shield", src: `${BASE}/SpaceShips/spaceships-shield.json` },
        { alias: "color-preset-1", src: `${BASE}/SpaceShips/SpaceShip Color Preset 1.png` },
        { alias: "color-preset-2", src: `${BASE}/SpaceShips/SpaceShip Color Preset 2.png` },
        { alias: "color-preset-3", src: `${BASE}/SpaceShips/SpaceShip Color Preset 3.png` },
        { alias: "color-preset-4", src: `${BASE}/SpaceShips/SpaceShip Color Preset 4.png` },

        { alias: "engine-1-big", src: `${BASE}/Engines/engine-1-big.json` },
        { alias: "engine-1-small", src: `${BASE}/Engines/engine-1-small.json` },
        { alias: "engine-2-big", src: `${BASE}/Engines/engine-2-big.json` },
        { alias: "engine-2-small", src: `${BASE}/Engines/engine-2-small.json` },
        { alias: "engine-3-big", src: `${BASE}/Engines/engine-3-big.json` },
        { alias: "engine-3-small", src: `${BASE}/Engines/engine-3-small.json` },
        { alias: "engine-4-big", src: `${BASE}/Engines/engine-4-big.json` },
        { alias: "engine-4-small", src: `${BASE}/Engines/engine-4-small.json` },

        { alias: "asteroids-big-brown", src: `${BASE}/Asteroids/asteroids-big-brown.json` },
        { alias: "asteroids-big-white", src: `${BASE}/Asteroids/asteroids-big-white.json` },
        { alias: "asteroids-small-brown", src: `${BASE}/Asteroids/asteroids-small-brown.json` },
        { alias: "asteroids-small-white", src: `${BASE}/Asteroids/asteroids-small-white.json` },
      ],
    },
  ],
};
