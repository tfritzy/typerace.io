import { MAX_VITAL_MATRIX_BONUS } from "./constants";

export type RelicId =
  | "stellar_core"
  | "void_crystal"
  | "charge_matrix"
  | "neural_harvester"
  | "overcharge_coil"
  | "inferno_lens"
  | "nanite_swarm"
  | "aegis_barrier"
  | "glacial_emitter"
  | "plasma_weave"
  | "jammer_array"
  | "surge_catalyst"
  | "flow_state"
  | "surge_protocol"
  | "echo_chamber"
  | "resonance_field"
  | "entropy_siphon"
  | "vital_matrix"
  | "prism_array"
  | "signal_boost"
  | "cascade_protocol"
  | "photon_surge"
  | "infernal_chain"
  | "kinetic_mirror"
  | "chrono_burst"
  | "plasma_amplifier"
  | "death_nova"
  | "cryo_shatter"
  | "frost_chain"
  | "first_strike"
  | "plasma_feedback"
  | "volatile_ignition"
  | "permafrost"
  | "blizzard"
  | "superheated"
  | "arctic_core"
  | "cryo_recharge"
  | "thermal_shock"
  | "flash_freeze";

export interface RelicEffects {
  damageMultiplier: number;
  enemySpeedMultiplier: number;
  planetRegenPerKeystroke: number;
  xpMultiplier: number;
  bonusChargesPerPerfectWord: number;
  explosionRadiusMultiplier: number;
  planetHealPerSecond: number;
  planetDamageReduction: number;
  freezeStacksBonus: number;
  plasmaStacksBonus: number;
  enemyFireSlowMultiplier: number;
  planetRegenPerPerfectWord: number;
  streakDamageBonus: number;
  chargesOnPlanetDamage: number;
  xpPerPerfectWord: number;
  laserDamageMultiplier: number;
  projectileDamageMultiplier: number;
  planetHealPerKill: number;
  chargesPerKill: number;
  maxPlanetHealthBonus: number;
  maxPlanetHealthPerKill: number;
  bonusChargesGranted: number;
  perfectWordSplashDamage: number;
  plasmaDeathSpread: number;
  lifeStealPercent: number;
  streakMilestoneDamage: number;
  plasmaDamageMultiplier: number;
  deathNovaPlasmaStacks: number;
  frozenDamageMultiplier: number;
  frostChainFreezeStacks: number;
  firstStrikeDamageBonus: number;
  plasmaDamageBonusPerStack: number;
  physicalAgainstPlasmaStacks: number;
  freezeKillSpread: number;
  blizzardFreezeInterval: number;
  blizzardFreezeStacks: number;
  plasmaSlow: number;
  iceDamageMultiplier: number;
  chargesOnFrozenKill: number;
  thermalShockDamage: number;
  frozenPlasmaMult: number;
}

export interface RelicDefinition {
  id: RelicId;
  name: string;
  description: string;
  sprite: string;
  effects: Partial<RelicEffects>;
}

export const RELIC_CATALOG: RelicDefinition[] = [
  {
    id: "stellar_core",
    name: "Stellar Core",
    description: "Allied weapons deal 10% more damage.",
    sprite: "/futuristic_pixel_icons/Blue Core.png",
    effects: { damageMultiplier: 1.1 },
  },
  {
    id: "void_crystal",
    name: "Void Crystal",
    description: "Enemies move 15% slower.",
    sprite: "/futuristic_pixel_icons/Blue Star Crystal.png",
    effects: { enemySpeedMultiplier: 0.85 },
  },
  {
    id: "charge_matrix",
    name: "Charge Matrix",
    description: "The planet regenerates 1 HP per keystroke.",
    sprite: "/futuristic_pixel_icons/Blue Cosmic Ring.png",
    effects: { planetRegenPerKeystroke: 1 },
  },
  {
    id: "neural_harvester",
    name: "Neural Harvester",
    description: "Gems grant 10% more XP.",
    sprite: "/futuristic_pixel_icons/Green Starcrystal.png",
    effects: { xpMultiplier: 1.10 },
  },
  {
    id: "overcharge_coil",
    name: "Overcharge Coil",
    description: "Completing a word with no errors grants all ships an extra charge.",
    sprite: "/futuristic_pixel_icons/Orange Core.png",
    effects: { bonusChargesPerPerfectWord: 1 },
  },
  {
    id: "inferno_lens",
    name: "Inferno Lens",
    description: "Explosion radii are 30% larger.",
    sprite: "/futuristic_pixel_icons/Orange Power Orb.png",
    effects: { explosionRadiusMultiplier: 1.3 },
  },
  {
    id: "nanite_swarm",
    name: "Nanite Swarm",
    description: "The planet passively regenerates 2 HP per second.",
    sprite: "/futuristic_pixel_icons/Green Core.png",
    effects: { planetHealPerSecond: 2 },
  },
  {
    id: "aegis_barrier",
    name: "Aegis Barrier",
    description: "The planet takes 25% less damage from enemies.",
    sprite: "/futuristic_pixel_icons/Amber Neon Shield.png",
    effects: { planetDamageReduction: 0.75 },
  },
  {
    id: "glacial_emitter",
    name: "Glacial Emitter",
    description: "Freezing attacks apply 1 additional freeze stack to enemies hit.",
    sprite: "/futuristic_pixel_icons/Turqoise Crystal.png",
    effects: { freezeStacksBonus: 1 },
  },
  {
    id: "plasma_weave",
    name: "Plasma Weave",
    description: "Plasma attacks apply 1 additional stack of plasma.",
    sprite: "/futuristic_pixel_icons/Purple Starcrystal.png",
    effects: { plasmaStacksBonus: 1 },
  },
  {
    id: "jammer_array",
    name: "Jammer Array",
    description: "Enemies fire 25% slower.",
    sprite: "/futuristic_pixel_icons/Blue Chip.png",
    effects: { enemyFireSlowMultiplier: 1.25 },
  },
  {
    id: "surge_catalyst",
    name: "Surge Catalyst",
    description: "Completing a word with no errors restores 20 HP to the planet.",
    sprite: "/futuristic_pixel_icons/Pink Crystal.png",
    effects: { planetRegenPerPerfectWord: 20 },
  },
  {
    id: "flow_state",
    name: "Flow State",
    description: "For each word with no errors in your streak, allied weapons deal 1% more damage (max 25%).",
    sprite: "/futuristic_pixel_icons/Orange Star Shards.png",
    effects: { streakDamageBonus: 0.01 },
  },
  {
    id: "surge_protocol",
    name: "Surge Protocol",
    description: "When the planet takes damage, all ships gain 1 charge.",
    sprite: "/futuristic_pixel_icons/Orange Chip.png",
    effects: { chargesOnPlanetDamage: 1 },
  },
  {
    id: "echo_chamber",
    name: "Echo Chamber",
    description: "Completing a word with no errors grants 5 XP.",
    sprite: "/futuristic_pixel_icons/Amber Crystal.png",
    effects: { xpPerPerfectWord: 5 },
  },
  {
    id: "resonance_field",
    name: "Resonance Field",
    description: "Allied laser ships deal 20% more damage.",
    sprite: "/futuristic_pixel_icons/Laser Rifle Blue.png",
    effects: { laserDamageMultiplier: 1.2 },
  },
  {
    id: "entropy_siphon",
    name: "Entropy Siphon",
    description: "Each enemy kill restores 3 HP to the planet.",
    sprite: "/futuristic_pixel_icons/Red Heart Crystal.png",
    effects: { planetHealPerKill: 3 },
  },
  {
    id: "vital_matrix",
    name: "Vital Matrix",
    description: `Each enemy kill permanently increases planet max HP by 1 (up to +${MAX_VITAL_MATRIX_BONUS}).`,
    sprite: "/futuristic_pixel_icons/Health Pack.png",
    effects: { maxPlanetHealthPerKill: 1 },
  },
  {
    id: "prism_array",
    name: "Kinetic Amp",
    description: "Allied physical weapons deal 20% more damage.",
    sprite: "/futuristic_pixel_icons/Blue Neon Bullet.png",
    effects: { projectileDamageMultiplier: 1.2 },
  },
  {
    id: "signal_boost",
    name: "Signal Boost",
    description: "Charge-granting ships send 1 extra charge per activation.",
    sprite: "/futuristic_pixel_icons/Green Circuit.png",
    effects: { bonusChargesGranted: 1 },
  },
  {
    id: "cascade_protocol",
    name: "Kill Drive",
    description: "The killing ship gains 1 charge when it destroys an enemy.",
    sprite: "/futuristic_pixel_icons/Lightning Icon.png",
    effects: { chargesPerKill: 1 },
  },
  {
    id: "photon_surge",
    name: "Photon Surge",
    description: "Completing a word with no errors deals 25 damage to a random enemy.",
    sprite: "/futuristic_pixel_icons/Bluerite Orb.png",
    effects: { perfectWordSplashDamage: 25 },
  },
  {
    id: "infernal_chain",
    name: "Infernal Chain",
    description: "When a burning enemy dies, nearby enemies gain 5 plasma stacks.",
    sprite: "/futuristic_pixel_icons/Purple Grenade.png",
    effects: { plasmaDeathSpread: 5 },
  },
  {
    id: "kinetic_mirror",
    name: "Kinetic Mirror",
    description: "5% of damage dealt to enemies is restored to the planet as HP.",
    sprite: "/futuristic_pixel_icons/Pink Heart Crystal.png",
    effects: { lifeStealPercent: 0.05 },
  },
  {
    id: "chrono_burst",
    name: "Chrono Burst",
    description: "Every 5th consecutive word with no errors triggers a shockwave dealing 50 damage to all enemies.",
    sprite: "/futuristic_pixel_icons/Onyx Star Shards.png",
    effects: { streakMilestoneDamage: 50 },
  },
  {
    id: "plasma_amplifier",
    name: "Plasma Amplifier",
    description: "Plasma deals 2x more damage.",
    sprite: "/futuristic_pixel_icons/Red Circuit.png",
    effects: { plasmaDamageMultiplier: 2 },
  },
  {
    id: "death_nova",
    name: "Death Nova",
    description: "When an enemy dies, it explodes applying 5 plasma stacks to nearby enemies.",
    sprite: "/futuristic_pixel_icons/Green Grenade.png",
    effects: { deathNovaPlasmaStacks: 5 },
  },
  {
    id: "cryo_shatter",
    name: "Cryo Shatter",
    description: "Frozen enemies take 2x damage.",
    sprite: "/futuristic_pixel_icons/Ice Pack.png",
    effects: { frozenDamageMultiplier: 2 },
  },
  {
    id: "frost_chain",
    name: "Frost Chain",
    description: "When a frozen enemy dies, it explodes freezing nearby enemies for 1 second.",
    sprite: "/futuristic_pixel_icons/Turqoise Ring.png",
    effects: { frostChainFreezeStacks: 1 },
  },
  {
    id: "first_strike",
    name: "First Strike",
    description: "Undamaged enemies take 50% more damage.",
    sprite: "/futuristic_pixel_icons/Bolt.png",
    effects: { firstStrikeDamageBonus: 0.5 },
  },
  {
    id: "plasma_feedback",
    name: "Plasma Feedback",
    description: "Each plasma stack on an enemy increases the damage it takes by 3%.",
    sprite: "/futuristic_pixel_icons/Orange Crystal.png",
    effects: { plasmaDamageBonusPerStack: 0.03 },
  },
  {
    id: "volatile_ignition",
    name: "Volatile Ignition",
    description: "Physical attacks against burning enemies apply 2 plasma stacks.",
    sprite: "/futuristic_pixel_icons/Darkred Cosmic Ring.png",
    effects: { physicalAgainstPlasmaStacks: 2 },
  },
  {
    id: "permafrost",
    name: "Permafrost",
    description: "When a frozen enemy is killed, the nearest unfrozen enemy is frozen for 2 seconds.",
    sprite: "/futuristic_pixel_icons/Light Crystal.png",
    effects: { freezeKillSpread: 2 },
  },
  {
    id: "blizzard",
    name: "Blizzard",
    description: "Every 10 consecutive words with no errors, freeze all enemies for 3 seconds.",
    sprite: "/futuristic_pixel_icons/Crystal.png",
    effects: { blizzardFreezeInterval: 10, blizzardFreezeStacks: 3 },
  },
  {
    id: "superheated",
    name: "Superheated",
    description: "Enemies with plasma stacks move 30% slower.",
    sprite: "/futuristic_pixel_icons/Red Starcrystal.png",
    effects: { plasmaSlow: 0.3 },
  },
  {
    id: "arctic_core",
    name: "Arctic Core",
    description: "Ice ships deal 25% more damage.",
    sprite: "/futuristic_pixel_icons/Blue Star Crystal.png",
    effects: { iceDamageMultiplier: 1.25 },
  },
  {
    id: "cryo_recharge",
    name: "Cryo Recharge",
    description: "Killing a frozen enemy grants all ships 2 charges.",
    sprite: "/futuristic_pixel_icons/Turqoise Ring.png",
    effects: { chargesOnFrozenKill: 2 },
  },
  {
    id: "thermal_shock",
    name: "Thermal Shock",
    description: "Applying freeze to a burning enemy deals 30 damage and removes all plasma stacks.",
    sprite: "/futuristic_pixel_icons/Orange Star Shards.png",
    effects: { thermalShockDamage: 30 },
  },
  {
    id: "flash_freeze",
    name: "Flash Freeze",
    description: "Plasma tick damage against frozen enemies is doubled.",
    sprite: "/futuristic_pixel_icons/Light Crystal.png",
    effects: { frozenPlasmaMult: 2 },
  },
];

export const RELIC_MAP: Map<RelicId, RelicDefinition> = new Map(
  RELIC_CATALOG.map((r) => [r.id, r])
);

export function computeRelicEffects(relics: RelicId[]): RelicEffects {
  const result: RelicEffects = {
    damageMultiplier: 1,
    enemySpeedMultiplier: 1,
    planetRegenPerKeystroke: 0,
    xpMultiplier: 1,
    bonusChargesPerPerfectWord: 0,
    explosionRadiusMultiplier: 1,
    planetHealPerSecond: 0,
    planetDamageReduction: 1,
    freezeStacksBonus: 0,
    plasmaStacksBonus: 0,
    enemyFireSlowMultiplier: 1,
    planetRegenPerPerfectWord: 0,
    streakDamageBonus: 0,
    chargesOnPlanetDamage: 0,
    xpPerPerfectWord: 0,
    laserDamageMultiplier: 1,
    projectileDamageMultiplier: 1,
    planetHealPerKill: 0,
    chargesPerKill: 0,
    maxPlanetHealthBonus: 0,
    maxPlanetHealthPerKill: 0,
    bonusChargesGranted: 0,
    perfectWordSplashDamage: 0,
    plasmaDeathSpread: 0,
    lifeStealPercent: 0,
    streakMilestoneDamage: 0,
    plasmaDamageMultiplier: 1,
    deathNovaPlasmaStacks: 0,
    frozenDamageMultiplier: 1,
    frostChainFreezeStacks: 0,
    firstStrikeDamageBonus: 0,
    plasmaDamageBonusPerStack: 0,
    physicalAgainstPlasmaStacks: 0,
    freezeKillSpread: 0,
    blizzardFreezeInterval: 0,
    blizzardFreezeStacks: 0,
    plasmaSlow: 0,
    iceDamageMultiplier: 1,
    chargesOnFrozenKill: 0,
    thermalShockDamage: 0,
    frozenPlasmaMult: 1,
  };
  for (const relicId of relics) {
    const def = RELIC_MAP.get(relicId);
    if (!def) continue;
    if (def.effects.damageMultiplier !== undefined) result.damageMultiplier *= def.effects.damageMultiplier;
    if (def.effects.enemySpeedMultiplier !== undefined) result.enemySpeedMultiplier *= def.effects.enemySpeedMultiplier;
    if (def.effects.planetRegenPerKeystroke !== undefined) result.planetRegenPerKeystroke += def.effects.planetRegenPerKeystroke;
    if (def.effects.xpMultiplier !== undefined) result.xpMultiplier *= def.effects.xpMultiplier;
    if (def.effects.bonusChargesPerPerfectWord !== undefined) result.bonusChargesPerPerfectWord += def.effects.bonusChargesPerPerfectWord;
    if (def.effects.explosionRadiusMultiplier !== undefined) result.explosionRadiusMultiplier *= def.effects.explosionRadiusMultiplier;
    if (def.effects.planetHealPerSecond !== undefined) result.planetHealPerSecond += def.effects.planetHealPerSecond;
    if (def.effects.planetDamageReduction !== undefined) result.planetDamageReduction *= def.effects.planetDamageReduction;
    if (def.effects.freezeStacksBonus !== undefined) result.freezeStacksBonus += def.effects.freezeStacksBonus;
    if (def.effects.plasmaStacksBonus !== undefined) result.plasmaStacksBonus += def.effects.plasmaStacksBonus;
    if (def.effects.enemyFireSlowMultiplier !== undefined) result.enemyFireSlowMultiplier *= def.effects.enemyFireSlowMultiplier;
    if (def.effects.planetRegenPerPerfectWord !== undefined) result.planetRegenPerPerfectWord += def.effects.planetRegenPerPerfectWord;
    if (def.effects.streakDamageBonus !== undefined) result.streakDamageBonus += def.effects.streakDamageBonus;
    if (def.effects.chargesOnPlanetDamage !== undefined) result.chargesOnPlanetDamage += def.effects.chargesOnPlanetDamage;
    if (def.effects.xpPerPerfectWord !== undefined) result.xpPerPerfectWord += def.effects.xpPerPerfectWord;
    if (def.effects.laserDamageMultiplier !== undefined) result.laserDamageMultiplier *= def.effects.laserDamageMultiplier;
    if (def.effects.projectileDamageMultiplier !== undefined) result.projectileDamageMultiplier *= def.effects.projectileDamageMultiplier;
    if (def.effects.planetHealPerKill !== undefined) result.planetHealPerKill += def.effects.planetHealPerKill;
    if (def.effects.chargesPerKill !== undefined) result.chargesPerKill += def.effects.chargesPerKill;
    if (def.effects.maxPlanetHealthBonus !== undefined) result.maxPlanetHealthBonus += def.effects.maxPlanetHealthBonus;
    if (def.effects.maxPlanetHealthPerKill !== undefined) result.maxPlanetHealthPerKill += def.effects.maxPlanetHealthPerKill;
    if (def.effects.bonusChargesGranted !== undefined) result.bonusChargesGranted += def.effects.bonusChargesGranted;
    if (def.effects.perfectWordSplashDamage !== undefined) result.perfectWordSplashDamage += def.effects.perfectWordSplashDamage;
    if (def.effects.plasmaDeathSpread !== undefined) result.plasmaDeathSpread += def.effects.plasmaDeathSpread;
    if (def.effects.lifeStealPercent !== undefined) result.lifeStealPercent += def.effects.lifeStealPercent;
    if (def.effects.streakMilestoneDamage !== undefined) result.streakMilestoneDamage += def.effects.streakMilestoneDamage;
    if (def.effects.plasmaDamageMultiplier !== undefined) result.plasmaDamageMultiplier *= def.effects.plasmaDamageMultiplier;
    if (def.effects.deathNovaPlasmaStacks !== undefined) result.deathNovaPlasmaStacks += def.effects.deathNovaPlasmaStacks;
    if (def.effects.frozenDamageMultiplier !== undefined) result.frozenDamageMultiplier *= def.effects.frozenDamageMultiplier;
    if (def.effects.frostChainFreezeStacks !== undefined) result.frostChainFreezeStacks += def.effects.frostChainFreezeStacks;
    if (def.effects.firstStrikeDamageBonus !== undefined) result.firstStrikeDamageBonus += def.effects.firstStrikeDamageBonus;
    if (def.effects.plasmaDamageBonusPerStack !== undefined) result.plasmaDamageBonusPerStack += def.effects.plasmaDamageBonusPerStack;
    if (def.effects.physicalAgainstPlasmaStacks !== undefined) result.physicalAgainstPlasmaStacks += def.effects.physicalAgainstPlasmaStacks;
    if (def.effects.freezeKillSpread !== undefined) result.freezeKillSpread += def.effects.freezeKillSpread;
    if (def.effects.blizzardFreezeInterval !== undefined) result.blizzardFreezeInterval += def.effects.blizzardFreezeInterval;
    if (def.effects.blizzardFreezeStacks !== undefined) result.blizzardFreezeStacks += def.effects.blizzardFreezeStacks;
    if (def.effects.plasmaSlow !== undefined) result.plasmaSlow += def.effects.plasmaSlow;
    if (def.effects.iceDamageMultiplier !== undefined) result.iceDamageMultiplier *= def.effects.iceDamageMultiplier;
    if (def.effects.chargesOnFrozenKill !== undefined) result.chargesOnFrozenKill += def.effects.chargesOnFrozenKill;
    if (def.effects.thermalShockDamage !== undefined) result.thermalShockDamage += def.effects.thermalShockDamage;
    if (def.effects.frozenPlasmaMult !== undefined) result.frozenPlasmaMult *= def.effects.frozenPlasmaMult;
  }
  return result;
}
