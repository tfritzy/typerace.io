import type {
    GameMode,
    PlayerColor,
    Game,
    Player,
    GameRecord,
    PlayerProgress,
    XpGain,
    GameState,
    GameType,
    GlobalStats,
    PersonalRecord,
    CharacterEventType,
} from "../../module_bindings/types";

export type {
    GameMode,
    PlayerColor,
    Game,
    Player,
    GameRecord,
    PlayerProgress,
    XpGain,
    GameState,
    GameType,
    GlobalStats,
    PersonalRecord,
    CharacterEventType,
};

export interface Reducers {
    JoinGame(params: { gameMode: GameMode; joinCode: string; gameType: GameType }): Promise<void>;
    JoinPrivateGame(params: { gameId: string }): Promise<void>;
    Rematch(params: { gameId: string }): Promise<void>;
    SetPlayerColor(params: { color: PlayerColor }): Promise<void>;
    SetPlayerName(params: { name: string }): Promise<void>;
    StartPrivateGame(params: { gameId: string }): Promise<void>;
    SyncAnonymousStatus(params: { isAnonymous: boolean }): Promise<void>;
    UpdateProgress(params: { gameId: string; newIndex: number; eventType: CharacterEventType }): Promise<void>;
}
