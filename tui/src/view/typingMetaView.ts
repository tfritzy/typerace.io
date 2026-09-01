import { BoxRenderable, CliRenderer, RenderContext } from "@opentui/core";
import { TypeBox } from "../typebox";
import { Game, PlayerProgress } from "../stdb";
import { PlayerProgressView } from "./playerProgress";
import { THEME } from "../theme";

export class RacingView extends BoxRenderable {
    private totalWords: number;
    private typedWords: number;
    private phrase: string;
    private playerProgresses: PlayerProgressView[] = [];
    public cleanup = () => { };


    constructor(ctx: RenderContext) {
        super(ctx, {
            width: "100%",
            height: "100%",
        });

        this.totalWords = 0;
        this.typedWords = 0;

        this.cleanup = () => {
        };
    }

    public updateGame(game: Game) {
        this.totalWords = game.phrase.split(' ').length + 1;
    }

    public updatePlayerProgress(pp: PlayerProgress) {
        this.typedWords =  
    }

    public addPlayerProgress(pp: PlayerProgress) {
        if (
            this.playerProgresses.find((p) => p.data?.playerId.equals(pp.playerId))
        ) {
            this.updatePlayerProgress(pp);
        } else {
            const slot = this.playerProgresses.find((p) => !p.data);
            slot?.updateProgress(pp);
        }
    }

    public setVisible(visible: boolean) {
        this.screen.visible = visible;
    }
}
