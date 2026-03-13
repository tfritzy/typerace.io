import { type Infer } from "spacetimedb";
import * as Bindings from "../../module_bindings";

export type GameMode = Infer<typeof Bindings.GameMode>;
export type Game = Infer<typeof Bindings.Game>;
export type Player = Infer<typeof Bindings.Player>;
export type GameRecord = Infer<typeof Bindings.GameRecord>;
export type PlayerProgress = Infer<typeof Bindings.PlayerProgress>;
export type XpGain = Infer<typeof Bindings.XpGain>;
export type GameState = Infer<typeof Bindings.GameState>;
export type GameType = Infer<typeof Bindings.GameType>;
export type GlobalStats = Infer<typeof Bindings.GlobalStats>;
export type PersonalRecord = Infer<typeof Bindings.PersonalRecord>;
export type CharacterEventType = Infer<typeof Bindings.CharacterEventType>;
