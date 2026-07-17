import { BoxRenderable, CliRenderer } from "@opentui/core";
import { ResultBox } from "./resultBox";
import { Game, PlayerProgress } from "../stdb";
import { WpmChart } from "./wpmChart";

export class ResultsView {
  private screen: BoxRenderable;
  public cleanup = () => {};
  private placeBox: ResultBox;
  private wpmBox: ResultBox;
  private timeBox: ResultBox;
  private accuracyBox: ResultBox;
  private wpmChart: WpmChart;

  constructor(
    renderer: CliRenderer,
    navMainMenu: () => void,
    requestNewGame: () => void,
  ) {
    this.screen = new BoxRenderable(renderer, {
      width: "90%",
      maxWidth: 128,
      height: "100%",
      marginX: "auto",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    });

    this.wpmChart = new WpmChart(renderer);
    this.screen.add(this.wpmChart);

    const placementsBar = new BoxRenderable(renderer, {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginX: "auto",
    });

    this.placeBox = new ResultBox(
      renderer,
      placementsBar,
      "1st",
      "PLACE",
      { paddingY: 1 },
      true,
    );
    this.wpmBox = new ResultBox(renderer, placementsBar, "98", "WPM", {
      paddingY: 1,
    });
    this.timeBox = new ResultBox(renderer, placementsBar, "23s", "TIME", {
      paddingY: 1,
    });
    this.accuracyBox = new ResultBox(
      renderer,
      placementsBar,
      "98%",
      "ACCURACY",
      { paddingY: 1 },
    );

    this.screen.add(placementsBar);

    const actionBar = new BoxRenderable(renderer, {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginX: "auto",
    });

    new ResultBox(renderer, actionBar, "Main menu (m)");
    new ResultBox(renderer, actionBar, "Replay (r)");
    new ResultBox(renderer, actionBar, "New match (n)");

    this.screen.add(actionBar);

    renderer.root.add(this.screen);

    const keyListener = (key: { name: string }) => {
      if (!this.screen.visible) {
        return;
      }

      if (key.name === "m") {
        navMainMenu();
      }

      if (key.name === "n") {
        requestNewGame();
      }
    };
    renderer.keyInput.on("keypress", keyListener);

    this.cleanup = () => {
      renderer.keyInput.removeListener("keypress", keyListener);
      this.screen.destroyRecursively();
    };
  }

  public updateOwnPlayerProgress(pp: PlayerProgress) {
    this.placeBox.setText(this.formatPlace(pp.placement), pp.placement <= 1);
    this.wpmBox.setText(pp.wpm.toFixed(0), pp.wpm >= 100);
    this.timeBox.setText(pp.time.toLocaleString(), pp.placement <= 1);
    this.accuracyBox.setText("100%", true);
    this.wpmChart.updatePlayerProgress(pp);
  }

  public updateGame(game: Game) {
    this.wpmChart.updateGame(game);
  }

  public setVisible(visible: boolean) {
    this.screen.visible = visible;
  }

  private formatPlace(place: number) {
    switch (place) {
      case 1:
        return "1st";
      case 2:
        return "2nd";
      case 3:
        return "3rd";
      default:
        return place + "th";
    }
  }
}
