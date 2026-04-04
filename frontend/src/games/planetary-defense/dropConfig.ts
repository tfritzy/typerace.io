import { RelicType } from "./relicConfig";

export enum ItemType {
  EmbercrestBlade = RelicType.EmbercrestBlade,
  BriarthornSaber = RelicType.BriarthornSaber,
  RavenplumeEdge = RelicType.RavenplumeEdge,
  RubyguardGreatsword = RelicType.RubyguardGreatsword,
  SunfireScimitar = RelicType.SunfireScimitar,
  CloudveilLongsword = RelicType.CloudveilLongsword,
  VoidthornBlade = RelicType.VoidthornBlade,
  GildedPlumeblade = RelicType.GildedPlumeblade,
  GlacialCrusader = RelicType.GlacialCrusader,
  BloodthornDirk = RelicType.BloodthornDirk,
  TwinflareCrossblades = RelicType.TwinflareCrossblades,
  MoltenZweihander = RelicType.MoltenZweihander,
  FrostfangClaymore = RelicType.FrostfangClaymore,
  SporesparkGlaive = RelicType.SporesparkGlaive,
  AzureCrescent = RelicType.AzureCrescent,
  RosevineRapier = RelicType.RosevineRapier,
  CrystalbreakSaber = RelicType.CrystalbreakSaber,
  CinderstoneBlade = RelicType.CinderstoneBlade,
  EmeraldFang = RelicType.EmeraldFang,
  StarfallStiletto = RelicType.StarfallStiletto,
  CrimsonCleaver = RelicType.CrimsonCleaver,
  TigerstripeFalchion = RelicType.TigerstripeFalchion,
  DawnfireCutlass = RelicType.DawnfireCutlass,
  JadecrossBroadsword = RelicType.JadecrossBroadsword,
  ChainlinkEstoc = RelicType.ChainlinkEstoc,
  PermafrostGreatsword = RelicType.PermafrostGreatsword,
  MistralSabre = RelicType.MistralSabre,
  TidecallerBlade = RelicType.TidecallerBlade,
  SolarisEdge = RelicType.SolarisEdge,
  InfernalRavager = RelicType.InfernalRavager,
  SteelBattleaxe = RelicType.SteelBattleaxe,
  MoonlitHatchet = RelicType.MoonlitHatchet,
  ObsidianReaver = RelicType.ObsidianReaver,
  RubyflareGreataxe = RelicType.RubyflareGreataxe,
  GildedWaraxe = RelicType.GildedWaraxe,
  CopperheadCleaver = RelicType.CopperheadCleaver,
  BonecrestAxe = RelicType.BonecrestAxe,
  DarkwoodHatchet = RelicType.DarkwoodHatchet,
  DuskforgeHalberd = RelicType.DuskforgeHalberd,
  RosegoldBroadaxe = RelicType.RosegoldBroadaxe,
  FrostbiteCleaver = RelicType.FrostbiteCleaver,
  BloodmoonReaver = RelicType.BloodmoonReaver,
  TidebreakAxe = RelicType.TidebreakAxe,
  IronwoodTomahawk = RelicType.IronwoodTomahawk,
  GreystoneBroadaxe = RelicType.GreystoneBroadaxe,
  SandstoneHatchet = RelicType.SandstoneHatchet,
  CrimsonWaraxe = RelicType.CrimsonWaraxe,
  GoldscarHalberd = RelicType.GoldscarHalberd,
  FlamecrestGreataxe = RelicType.FlamecrestGreataxe,
  WroughtIronChopper = RelicType.WroughtIronChopper,
  SpectralCleaver = RelicType.SpectralCleaver,
  BloodruneAxe = RelicType.BloodruneAxe,
  PearlsteelHatchet = RelicType.PearlsteelHatchet,
  EmberstrikeTomahawk = RelicType.EmberstrikeTomahawk,
  NightbloomReaver = RelicType.NightbloomReaver,
  BlackironSplitter = RelicType.BlackironSplitter,
  VerdantWaraxe = RelicType.VerdantWaraxe,
  AshenBroadaxe = RelicType.AshenBroadaxe,
  PrismaticGreataxe = RelicType.PrismaticGreataxe,
  HellforgedCleaver = RelicType.HellforgedCleaver,
  GraniteWaraxe = RelicType.GraniteWaraxe,

  Gold = 1000,
  ChippedTopaz,
  FlawedTopaz,
  Topaz,
  FlawlessTopaz,
  PerfectTopaz,
  ChippedRuby,
  FlawedRuby,
  Ruby,
  FlawlessRuby,
  PerfectRuby,
  ChippedEmerald,
  FlawedEmerald,
  Emerald,
  FlawlessEmerald,
  PerfectEmerald,
}

const FIRST_RELIC = ItemType.EmbercrestBlade;
const LAST_RELIC = ItemType.GraniteWaraxe;
const FIRST_GEM = ItemType.ChippedTopaz;
const LAST_GEM = ItemType.PerfectEmerald;

export function isRelic(type: ItemType): boolean {
  return type >= FIRST_RELIC && type <= LAST_RELIC;
}

export function isGem(type: ItemType): boolean {
  return type >= FIRST_GEM && type <= LAST_GEM;
}

export function toRelicType(type: ItemType): RelicType {
  return type as number as RelicType;
}

export function fromRelicType(relic: RelicType): ItemType {
  return relic as number as ItemType;
}

export const GEM_COLORS: Partial<Record<ItemType, number>> = {
  [ItemType.ChippedTopaz]: 0xf59e0b,
  [ItemType.FlawedTopaz]: 0xf59e0b,
  [ItemType.Topaz]: 0xf59e0b,
  [ItemType.FlawlessTopaz]: 0xf59e0b,
  [ItemType.PerfectTopaz]: 0xf59e0b,
  [ItemType.ChippedRuby]: 0xef4444,
  [ItemType.FlawedRuby]: 0xef4444,
  [ItemType.Ruby]: 0xef4444,
  [ItemType.FlawlessRuby]: 0xef4444,
  [ItemType.PerfectRuby]: 0xef4444,
  [ItemType.ChippedEmerald]: 0x10b981,
  [ItemType.FlawedEmerald]: 0x10b981,
  [ItemType.Emerald]: 0x10b981,
  [ItemType.FlawlessEmerald]: 0x10b981,
  [ItemType.PerfectEmerald]: 0x10b981,
};

export const GOLD_COLOR = 0xfbbf24;
export const DROP_LABEL_COLOR = "#b0b0b0";

export const DROP_SIZE = 8;
export const DROP_SPEED = 80;

export function calculateGoldDrop(power: number): number {
  return Math.ceil(power / 10);
}

export function rollGemDrop(power: number): ItemType | null {
  const gemChance = Math.min(0.5, 0.05 + power / 10000);
  if (Math.random() >= gemChance) return null;

  const bases = [0, 5, 10];
  const base = bases[Math.floor(Math.random() * 3)];

  let quality: number;
  if (power >= 10000) quality = 4;
  else if (power >= 1000) quality = 3;
  else if (power >= 200) quality = 2;
  else if (power >= 50) quality = 1;
  else quality = 0;

  return (FIRST_GEM + base + quality) as ItemType;
}
