import type { AssetsManifest } from "pixi.js";

const BASE = "/pixel_starships_kit";
const ITEMS = "/elv_item_icons";

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

        { alias: "swordtember", src: "/Swordtember 2024 - Sheet/swordtember_2024.json" },
        { alias: "axetober", src: "/Axetober Sheet/axetober_2024.json" },

        { alias: "topaz-0", src: `${ITEMS}/topaz_0.png` },
        { alias: "topaz-1", src: `${ITEMS}/topaz_1.png` },
        { alias: "topaz-2", src: `${ITEMS}/topaz_2.png` },
        { alias: "topaz-3", src: `${ITEMS}/topaz_3.png` },
        { alias: "ruby-0", src: `${ITEMS}/ruby_0.png` },
        { alias: "ruby-1", src: `${ITEMS}/ruby_1.png` },
        { alias: "ruby-2", src: `${ITEMS}/ruby_2.png` },
        { alias: "ruby-3", src: `${ITEMS}/ruby_3.png` },
        { alias: "emerald-0", src: `${ITEMS}/emerald_0.png` },
        { alias: "emerald-1", src: `${ITEMS}/emerald_1.png` },
        { alias: "emerald-2", src: `${ITEMS}/emerald_2.png` },
        { alias: "emerald-3", src: `${ITEMS}/emerald_3.png` },
        { alias: "sapphire-0", src: `${ITEMS}/sapphire_0.png` },
        { alias: "sapphire-1", src: `${ITEMS}/sapphire_1.png` },
        { alias: "sapphire-2", src: `${ITEMS}/sapphire_2.png` },
        { alias: "sapphire-3", src: `${ITEMS}/sapphire_3.png` },
        { alias: "amethyst-0", src: `${ITEMS}/amathyst_0.png` },
        { alias: "amethyst-1", src: `${ITEMS}/amathyst_1.png` },
        { alias: "amethyst-2", src: `${ITEMS}/amathyst_2.png` },
        { alias: "amethyst-3", src: `${ITEMS}/amathyst_3.png` },
        { alias: "diamond-0", src: `${ITEMS}/diamond_0.png` },
        { alias: "diamond-1", src: `${ITEMS}/diamond_1.png` },
        { alias: "diamond-2", src: `${ITEMS}/diamond_2.png` },
        { alias: "diamond-3", src: `${ITEMS}/diamond_3.png` },
        { alias: "coin-0", src: `${ITEMS}/coin_0.png` },
        { alias: "coin-1", src: `${ITEMS}/coin_1.png` },
        { alias: "coin-2", src: `${ITEMS}/coin_2.png` },
      ],
    },
  ],
};
