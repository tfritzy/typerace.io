import type { AssetsManifest } from "pixi.js";
import { ASSET_BASE } from "./constants";

export const MANIFEST: AssetsManifest = {
  bundles: [
    {
      name: "starship-demo",
      assets: [
        { alias: "background", src: `${ASSET_BASE}/Backgrounds/Background.png` },

        { alias: "planet-sheet", src: `${ASSET_BASE}/Backgrounds/Planet.png` },
        { alias: "planet-ring-sheet", src: `${ASSET_BASE}/Backgrounds/Planet with ring.png` },

        { alias: "nebula", src: `${ASSET_BASE}/Backgrounds/Nebula.png` },
        { alias: "stars-particle", src: `${ASSET_BASE}/Backgrounds/Stars Particle.png` },
        { alias: "sun-1", src: `${ASSET_BASE}/Backgrounds/Sun_1.png` },
        { alias: "sun-2", src: `${ASSET_BASE}/Backgrounds/Sun_2.png` },
        { alias: "space-station", src: `${ASSET_BASE}/Backgrounds/Space Station.png` },

        { alias: "spaceships", src: `${ASSET_BASE}/SpaceShips/Spaceships.png` },
        { alias: "spaceships-colormap", src: `${ASSET_BASE}/SpaceShips/Spaceships Colormap.png` },
        { alias: "spaceships-shield", src: `${ASSET_BASE}/SpaceShips/Spaceships Shield.png` },

        { alias: "engine-1-big", src: `${ASSET_BASE}/Engines/Engine_1_Big.png` },
        { alias: "engine-1-small", src: `${ASSET_BASE}/Engines/Engine_1_Small.png` },
        { alias: "engine-2-big", src: `${ASSET_BASE}/Engines/Engine_2_Big.png` },
        { alias: "engine-2-small", src: `${ASSET_BASE}/Engines/Engine_2_Small.png` },
        { alias: "engine-3-big", src: `${ASSET_BASE}/Engines/Engine_3_Big.png` },
        { alias: "engine-3-small", src: `${ASSET_BASE}/Engines/Engine_3_Small.png` },
        { alias: "engine-4-big", src: `${ASSET_BASE}/Engines/Engine_4_Big.png` },
        { alias: "engine-4-small", src: `${ASSET_BASE}/Engines/Engine_4_Small.png` },

        { alias: "asteroid-big-brown", src: `${ASSET_BASE}/Asteroids/Asteroid_Big_Brown.png` },
        { alias: "asteroid-big-white", src: `${ASSET_BASE}/Asteroids/Asteroid_Big_White.png` },
        { alias: "asteroid-small-brown", src: `${ASSET_BASE}/Asteroids/Asteroid_Small_Brown.png` },
        { alias: "asteroid-small-white", src: `${ASSET_BASE}/Asteroids/Asteroid_Small_White.png` },

        { alias: "projectile-1", src: `${ASSET_BASE}/Projectiles/Projectile_1.png` },
        { alias: "projectile-2", src: `${ASSET_BASE}/Projectiles/Projectile_2.png` },
        { alias: "projectile-3", src: `${ASSET_BASE}/Projectiles/Projectile_3.png` },
        { alias: "projectile-4", src: `${ASSET_BASE}/Projectiles/Projectile_4.png` },
        { alias: "projectile-5", src: `${ASSET_BASE}/Projectiles/Projectile_5.png` },
        { alias: "projectile-6", src: `${ASSET_BASE}/Projectiles/Projectile_6.png` },

        { alias: "explosion-1", src: `${ASSET_BASE}/Projectiles/Projectile_1_Explosion.png` },
        { alias: "explosion-2", src: `${ASSET_BASE}/Projectiles/Projectile_2_Explosion.png` },
        { alias: "explosion-3", src: `${ASSET_BASE}/Projectiles/Projectile_3_Explosion.png` },
        { alias: "explosion-4", src: `${ASSET_BASE}/Projectiles/Projectile_4_Explosion.png` },
        { alias: "explosion-5", src: `${ASSET_BASE}/Projectiles/Projectile_5_Explosion.png` },
        { alias: "explosion-6", src: `${ASSET_BASE}/Projectiles/Projectile_6_Explosion.png` },
      ],
    },
  ],
};
