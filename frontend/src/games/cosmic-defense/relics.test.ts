import { describe, it, expect } from 'vitest';
import {
  createGameState,
  onPerfectWord,
  onWordWithError,
  onCorrectKeystroke,
  updateState,
  setSpawnerPaused,
  PLANET_X,
  PLANET_Y,
  type GameState,
  type EntityState,
} from './state';
import { computeRelicEffects, RELIC_CATALOG, type RelicId } from './relics';
import { Team, DamageType, ProjectileType, ColorPreset } from './types';

function makeState(relics: RelicId[] = []): GameState {
  const state = createGameState();
  state.relicEffects = computeRelicEffects(relics);
  state.relics = [...relics];
  return state;
}

function makeEnemy(state: GameState, overrides: Partial<EntityState> = {}): EntityState {
  const id = state.nextId++;
  const entity: EntityState = {
    id,
    entityType: 'Pulse',
    x: PLANET_X + 200,
    y: PLANET_Y,
    vx: 0,
    vy: 0,
    health: 100,
    maxHealth: 100,
    power: 10,
    colorPreset: ColorPreset.Preset4,
    team: Team.Enemy,
    fireRate: 2,
    projectileDamage: 5,
    projectileType: ProjectileType.Tiny,
    fireTimer: 10,
    rotation: Math.PI,
    displayRotation: Math.PI,
    speed: 50,
    chargesRequired: 0,
    charge: 0,
    xpReward: 10,
    range: 700,
    hitHalfW: 24,
    hitHalfH: 15,
    role: null,
    plasmaStacks: 0,
    plasmaStacksApplied: 0,
    laserDamage: 0,
    kills: 0,
    damageDealt: 0,
    targetingMode: 0,
    level: 1,
    freezeStacks: 0,
    chainCount: 0,
    buffMultiplier: 0,
    buffedNextAttack: false,
    fireCount: 1,
    beamWidth: 0,
    explosionRadius: 0,
    hitDelay: 0,
    sizeScale: 1,
    isBoss: false,
    damageType: DamageType.Physical,
    ...overrides,
  };
  state.entities.push(entity);
  state.entityById.set(id, entity);
  return entity;
}

function makeAlly(state: GameState, overrides: Partial<EntityState> = {}): EntityState {
  const id = state.nextId++;
  const entity: EntityState = {
    id,
    entityType: 'Moth',
    x: PLANET_X,
    y: PLANET_Y,
    vx: 0,
    vy: 0,
    health: 200,
    maxHealth: 200,
    power: 0,
    colorPreset: ColorPreset.Preset1,
    team: Team.Allied,
    fireRate: 0,
    projectileDamage: 10,
    projectileType: ProjectileType.Projectile1,
    fireTimer: 0,
    rotation: 0,
    displayRotation: 0,
    speed: 0,
    chargesRequired: 4,
    charge: 0,
    xpReward: 0,
    range: 0,
    hitHalfW: 30,
    hitHalfH: 24,
    role: 'shooter',
    plasmaStacks: 0,
    plasmaStacksApplied: 0,
    laserDamage: 0,
    kills: 0,
    damageDealt: 0,
    targetingMode: 0,
    level: 1,
    freezeStacks: 0,
    chainCount: 0,
    buffMultiplier: 0,
    buffedNextAttack: false,
    fireCount: 1,
    beamWidth: 0,
    explosionRadius: 0,
    hitDelay: 0,
    sizeScale: 1,
    isBoss: false,
    damageType: DamageType.Physical,
    ...overrides,
  };
  state.entities.push(entity);
  state.entityById.set(id, entity);
  return entity;
}

function tickSecond(state: GameState): void {
  setSpawnerPaused(state, false);
  const startTime = state.time.time;
  const targetTime = Math.floor(startTime) + 1;
  updateState(state, targetTime - startTime + 0.001);
}

describe('computeRelicEffects', () => {
  it('returns base values with no relics', () => {
    const fx = computeRelicEffects([]);
    expect(fx.damageMultiplier).toBe(1);
    expect(fx.enemySpeedMultiplier).toBe(1);
    expect(fx.planetHealPerSecond).toBe(0);
    expect(fx.streakDamageBonus).toBe(0);
  });

  it('stellar_core sets 1.1 damage multiplier', () => {
    const fx = computeRelicEffects(['stellar_core']);
    expect(fx.damageMultiplier).toBeCloseTo(1.1);
  });

  it('void_crystal sets 0.85 enemy speed', () => {
    const fx = computeRelicEffects(['void_crystal']);
    expect(fx.enemySpeedMultiplier).toBeCloseTo(0.85);
  });

  it('nanite_swarm sets 2 HP per second regen', () => {
    expect(computeRelicEffects(['nanite_swarm']).planetHealPerSecond).toBe(2);
  });

  it('aegis_barrier sets 0.75 damage reduction', () => {
    expect(computeRelicEffects(['aegis_barrier']).planetDamageReduction).toBeCloseTo(0.75);
  });

  it('glacial_emitter sets freeze stacks bonus 1', () => {
    expect(computeRelicEffects(['glacial_emitter']).freezeStacksBonus).toBe(1);
  });

  it('plasma_weave sets plasma stacks bonus 1', () => {
    expect(computeRelicEffects(['plasma_weave']).plasmaStacksBonus).toBe(1);
  });

  it('flow_state sets 0.01 streak damage bonus per word', () => {
    expect(computeRelicEffects(['flow_state']).streakDamageBonus).toBeCloseTo(0.01);
  });

  it('plasma_amplifier sets 2x plasma damage', () => {
    expect(computeRelicEffects(['plasma_amplifier']).plasmaDamageMultiplier).toBe(2);
  });

  it('multiple relics stack multiplicatively for damage', () => {
    const fx = computeRelicEffects(['stellar_core', 'stellar_core']);
    expect(fx.damageMultiplier).toBeCloseTo(1.21);
  });

  it('all relic IDs in catalog are unique', () => {
    const ids = RELIC_CATALOG.map(r => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all relics have a non-empty name and description', () => {
    for (const relic of RELIC_CATALOG) {
      expect(relic.name.length).toBeGreaterThan(0);
      expect(relic.description.length).toBeGreaterThan(0);
    }
  });
});

describe('charge_matrix', () => {
  it('heals planet per keystroke', () => {
    const state = makeState(['charge_matrix']);
    state.planetHealth = 990;
    onCorrectKeystroke(state);
    expect(state.planetHealth).toBe(991);
  });
});

describe('surge_catalyst', () => {
  it('heals planet on perfect word', () => {
    const state = makeState(['surge_catalyst']);
    state.planetHealth = 950;
    onPerfectWord(state);
    expect(state.planetHealth).toBe(970);
  });
});

describe('echo_chamber', () => {
  it('awards XP on perfect word', () => {
    const state = makeState(['echo_chamber']);
    state.pendingChoice = false;
    expect(state.xp).toBe(0);
    onPerfectWord(state);
    expect(state.xp).toBe(5);
  });
});

describe('flow_state', () => {
  it('streak damage bonus increases with streak and resets on error', () => {
    const state = makeState(['flow_state']);
    onPerfectWord(state);
    onPerfectWord(state);
    onPerfectWord(state);
    expect(state.perfectWordStreak).toBe(3);
    onWordWithError(state);
    expect(state.perfectWordStreak).toBe(0);
  });
});

describe('overcharge_coil', () => {
  it('grants an extra charge to allies on perfect word', () => {
    const state = makeState(['overcharge_coil']);
    const ally = makeAlly(state, { chargesRequired: 4 });
    onPerfectWord(state);
    expect(ally.charge).toBe(1);
  });
});

describe('void_crystal', () => {
  it('reduces enemy movement speed', () => {
    const state = makeState(['void_crystal']);
    const enemy = makeEnemy(state, { speed: 100, x: PLANET_X + 1000, y: PLANET_Y, range: 700 });
    setSpawnerPaused(state, false);
    updateState(state, 0.1);
    expect(enemy.vx).toBeLessThan(0);
    expect(Math.abs(enemy.vx)).toBeCloseTo(100 * 0.85, 1);
  });
});

describe('nanite_swarm', () => {
  it('heals planet each second', () => {
    const state = makeState(['nanite_swarm']);
    state.planetHealth = 990;
    tickSecond(state);
    expect(state.planetHealth).toBe(992);
  });
});

describe('aegis_barrier', () => {
  it('reduces enemy projectile damage to planet', () => {
    const state = makeState(['aegis_barrier']);
    state.planetHealth = 1000;
    makeEnemy(state, { projectileDamage: 100, range: 0, speed: 0, x: PLANET_X + 10, y: PLANET_Y, fireTimer: 99 });
    setSpawnerPaused(state, false);
    updateState(state, 0.1);
    expect(state.planetHealth).toBeGreaterThan(925);
  });
});

describe('surge_protocol', () => {
  it('grants charges to all allies when planet takes damage', () => {
    const state = makeState(['surge_protocol']);
    const ally = makeAlly(state, { chargesRequired: 4 });
    makeEnemy(state, { projectileDamage: 10, range: 0, speed: 0, x: PLANET_X + 5, y: PLANET_Y, fireTimer: 0 });
    setSpawnerPaused(state, false);
    updateState(state, 0.1);
    expect(ally.charge).toBeGreaterThan(0);
  });
});

describe('cryo_surge', () => {
  it('freezes nearest enemy on perfect word', () => {
    const state = makeState(['cryo_surge']);
    const enemy = makeEnemy(state);
    expect(enemy.freezeStacks).toBe(0);
    onPerfectWord(state);
    expect(enemy.freezeStacks).toBe(2);
  });
});

describe('frost_nova', () => {
  it('deals damage each time freeze is applied, even if already frozen', () => {
    const state = makeState(['cryo_surge', 'frost_nova']);
    const enemy = makeEnemy(state, { health: 200 });
    onPerfectWord(state);
    expect(enemy.health).toBe(200 - 15);
    onPerfectWord(state);
    expect(enemy.health).toBe(200 - 30);
  });
});

describe('static_discharge', () => {
  it('applies plasma stacks when enemy is frozen via cryo_surge', () => {
    const state = makeState(['cryo_surge', 'static_discharge']);
    const enemy = makeEnemy(state, { plasmaStacks: 0 });
    onPerfectWord(state);
    expect(enemy.freezeStacks).toBeGreaterThan(0);
    expect(enemy.plasmaStacks).toBe(2);
  });
});

describe('plasma_amplifier', () => {
  it('increases plasma tick damage by 2x', () => {
    const state = makeState(['plasma_amplifier']);
    const enemy = makeEnemy(state, { health: 100, plasmaStacks: 3 });
    tickSecond(state);
    expect(enemy.health).toBe(100 - 3 * 2);
  });
});

describe('meltdown', () => {
  it('deals bonus damage when plasma stacks expire', () => {
    const state = makeState(['meltdown']);
    const enemy = makeEnemy(state, { health: 200, plasmaStacks: 1 });
    tickSecond(state);
    expect(enemy.plasmaStacks).toBe(0);
    expect(enemy.health).toBe(200 - 1 - 30);
  });
});

describe('pyroclasm', () => {
  it('transfers plasma stacks to nearest enemy on death', () => {
    const state = makeState(['pyroclasm']);
    const dying = makeEnemy(state, { health: 1, plasmaStacks: 5, x: PLANET_X + 100 });
    const neighbor = makeEnemy(state, { health: 200, plasmaStacks: 0, x: PLANET_X + 150 });
    tickSecond(state);
    expect(state.entityById.has(dying.id)).toBe(false);
    expect(neighbor.plasmaStacks).toBe(4);
  });
});

describe('death_nova', () => {
  it('spreads plasma stacks to nearby enemies when one dies', () => {
    const state = makeState(['death_nova']);
    makeEnemy(state, { health: 1, plasmaStacks: 2, x: PLANET_X + 100, y: PLANET_Y });
    const nearby = makeEnemy(state, { health: 200, plasmaStacks: 0, x: PLANET_X + 150, y: PLANET_Y });
    tickSecond(state);
    expect(nearby.plasmaStacks).toBe(5);
  });
});

describe('frost_chain', () => {
  it('freezes nearby enemies when a frozen enemy is killed by plasma', () => {
    const state = makeState(['frost_chain']);
    const frozen = makeEnemy(state, { health: 1, plasmaStacks: 2, freezeStacks: 3, x: PLANET_X + 100, y: PLANET_Y });
    const nearby = makeEnemy(state, { health: 200, freezeStacks: 0, x: PLANET_X + 150, y: PLANET_Y });
    tickSecond(state);
    expect(nearby.freezeStacks).toBeGreaterThan(0);
    expect(frozen).toBeTruthy();
  });
});

describe('cryo_recharge', () => {
  it('grants charges to all allies when a frozen enemy is killed', () => {
    const state = makeState(['cryo_recharge']);
    const ally = makeAlly(state, { chargesRequired: 5, charge: 0 });
    makeEnemy(state, { health: 1, plasmaStacks: 2, freezeStacks: 3 });
    tickSecond(state);
    expect(ally.charge).toBeGreaterThan(0);
  });
});

describe('permafrost', () => {
  it('freezes nearest unfrozen enemy when a frozen enemy is killed', () => {
    const state = makeState(['permafrost']);
    makeEnemy(state, { health: 1, plasmaStacks: 2, freezeStacks: 3, x: PLANET_X + 100, y: PLANET_Y });
    const unfrozen = makeEnemy(state, { health: 200, freezeStacks: 0, x: PLANET_X + 200, y: PLANET_Y });
    tickSecond(state);
    expect(unfrozen.freezeStacks).toBeGreaterThan(0);
  });
});

describe('entropy_siphon', () => {
  it('heals planet when an enemy dies', () => {
    const state = makeState(['entropy_siphon']);
    state.planetHealth = 900;
    makeEnemy(state, { health: 1, plasmaStacks: 2 });
    tickSecond(state);
    expect(state.planetHealth).toBe(903);
  });
});

describe('vital_matrix', () => {
  it('increases max planet HP by 1 on each kill', () => {
    const state = makeState(['vital_matrix']);
    const before = state.maxPlanetHealth;
    makeEnemy(state, { health: 1, plasmaStacks: 2 });
    tickSecond(state);
    expect(state.maxPlanetHealth).toBe(before + 1);
  });
});

describe('cryo_shatter', () => {
  it('doubles damage to frozen enemies', () => {
    const state = makeState(['cryo_shatter']);
    const ally = makeAlly(state, { projectileDamage: 10, chargesRequired: 1 });
    const frozenEnemy = makeEnemy(state, { health: 200, freezeStacks: 3 });
    onCorrectKeystroke(state);
    setSpawnerPaused(state, false);
    updateState(state, 0.1);
    const damageDone = 200 - frozenEnemy.health;
    expect(damageDone).toBe(20);
    expect(ally).toBeTruthy();
  });
});

describe('first_strike', () => {
  it('deals 50% more damage to undamaged enemies', () => {
    const state = makeState(['first_strike']);
    const ally = makeAlly(state, { projectileDamage: 10, chargesRequired: 1 });
    const fresh = makeEnemy(state, { health: 200, maxHealth: 200 });
    onCorrectKeystroke(state);
    setSpawnerPaused(state, false);
    updateState(state, 0.1);
    expect(200 - fresh.health).toBe(15);
    expect(ally).toBeTruthy();
  });
});

describe('kinetic_mirror', () => {
  it('restores 5% of damage dealt to planet as HP', () => {
    const state = makeState(['kinetic_mirror']);
    state.planetHealth = 500;
    const ally = makeAlly(state, { projectileDamage: 100, chargesRequired: 1 });
    makeEnemy(state, { health: 200 });
    onCorrectKeystroke(state);
    setSpawnerPaused(state, false);
    updateState(state, 0.1);
    expect(state.planetHealth).toBeGreaterThan(500);
    expect(ally).toBeTruthy();
  });
});

describe('chrono_burst', () => {
  it('deals milestone damage to all enemies every 5 perfect words', () => {
    const state = makeState(['chrono_burst']);
    const enemy1 = makeEnemy(state, { health: 200 });
    const enemy2 = makeEnemy(state, { health: 200 });
    for (let i = 0; i < 5; i++) onPerfectWord(state);
    expect(enemy1.health).toBe(200 - 50);
    expect(enemy2.health).toBe(200 - 50);
  });
});

describe('blizzard', () => {
  it('freezes all enemies every 10 consecutive perfect words', () => {
    const state = makeState(['blizzard']);
    const e1 = makeEnemy(state, { freezeStacks: 0 });
    const e2 = makeEnemy(state, { freezeStacks: 0 });
    for (let i = 0; i < 10; i++) onPerfectWord(state);
    expect(e1.freezeStacks).toBe(3);
    expect(e2.freezeStacks).toBe(3);
  });
});

describe('photon_surge', () => {
  it('deals 25 damage to a random enemy on perfect word', () => {
    const state = makeState(['photon_surge']);
    const e1 = makeEnemy(state, { health: 100 });
    onPerfectWord(state);
    expect(e1.health).toBe(75);
  });
});

describe('volatile_ignition', () => {
  it('applies plasma to burning enemies hit by physical attacks', () => {
    const state = makeState(['volatile_ignition']);
    const ally = makeAlly(state, { projectileDamage: 10, chargesRequired: 1, damageType: DamageType.Physical });
    const enemy = makeEnemy(state, { health: 200, plasmaStacks: 3 });
    onCorrectKeystroke(state);
    setSpawnerPaused(state, false);
    updateState(state, 0.1);
    expect(enemy.plasmaStacks).toBeGreaterThan(3);
    expect(ally).toBeTruthy();
  });
});

describe('infernal_chain', () => {
  it('spreads plasma stacks to nearby enemies when a burning enemy dies', () => {
    const state = makeState(['infernal_chain']);
    const burning = makeEnemy(state, { health: 1, plasmaStacks: 3, x: PLANET_X + 100, y: PLANET_Y });
    const nearby = makeEnemy(state, { health: 200, plasmaStacks: 0, x: PLANET_X + 150, y: PLANET_Y });
    tickSecond(state);
    expect(nearby.plasmaStacks).toBe(5);
    expect(burning).toBeTruthy();
  });
});

describe('superheated', () => {
  it('reduces movement speed of enemies with plasma stacks', () => {
    const state = makeState(['superheated']);
    const slowEnemy = makeEnemy(state, { speed: 100, plasmaStacks: 3, x: PLANET_X + 1000, y: PLANET_Y, range: 700 });
    const normalEnemy = makeEnemy(state, { speed: 100, plasmaStacks: 0, x: PLANET_X + 1000, y: PLANET_Y + 300, range: 700 });
    setSpawnerPaused(state, false);
    updateState(state, 0.1);
    expect(Math.abs(slowEnemy.vx)).toBeLessThan(Math.abs(normalEnemy.vx));
  });
});

describe('ice_armor', () => {
  it('freezes attacking enemy when planet takes damage', () => {
    const state = makeState(['ice_armor']);
    const attacker = makeEnemy(state, {
      projectileDamage: 20,
      range: 0,
      speed: 0,
      x: PLANET_X + 5,
      y: PLANET_Y,
      fireTimer: 0,
    });
    setSpawnerPaused(state, false);
    updateState(state, 0.1);
    expect(attacker.freezeStacks).toBeGreaterThan(0);
  });
});

describe('plasma_feedback', () => {
  it('increases damage multiplier based on plasma stacks', () => {
    const state = makeState(['plasma_feedback']);
    expect(state.relicEffects.plasmaDamageBonusPerStack).toBeCloseTo(0.03);
  });
});
