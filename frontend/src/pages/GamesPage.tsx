import { useEffect } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ThreeScene } from "../components/ThreeScene";

export const GamesPage = () => {
  useEffect(() => {
    document.title = "Games - TypeRace.io";
    return () => {
      document.title = "typerace.io - PvP typing";
    };
  }, []);

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto p-4">
        <div className="content-container">
          <h1 className="text-3xl font-bold mb-6 text-foreground">Games</h1>

          <div className="box p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Word Defense
            </h2>
            <ThreeScene />
          </div>

          <div className="box p-8 mb-8 text-foreground">
            <h2 className="text-2xl font-semibold mb-4">How to Play</h2>

            <section className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Overview</h3>
              <p className="mb-3 leading-relaxed">
                Word Defense is a wave-based typing defense game. Enemies fly in
                from all directions while your characters stand on the ground at
                the bottom of the screen, protected by a shield dome. Type the
                words displayed above enemies to fire at them and survive each
                day.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Combat</h3>
              <ul className="list-disc list-inside ml-4 leading-relaxed space-y-2">
                <li>
                  Each enemy has a word floating above it, drawn from the 500
                  most common English words.
                </li>
                <li>
                  Type an enemy's word to fire your weapon at that enemy. As you
                  type, the letters change from gray to solid so you can track
                  your progress.
                </li>
                <li>
                  After being hit, the enemy receives a new random word. Some
                  enemies have extra health and require multiple words to defeat.
                </li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Characters</h3>
              <p className="mb-3 leading-relaxed">
                You control two characters and can switch between them at any
                time by typing the word <strong>"switch"</strong>, displayed as a
                label beneath your characters. The switch label works just like
                enemy words — letters go from gray to solid as you type.
              </p>

              <div className="ml-4 space-y-4">
                <div>
                  <h4 className="text-lg font-semibold mb-1">The Attacker</h4>
                  <p className="leading-relaxed">
                    Fires at enemies when you type their words. Starts with a
                    slingshot that launches rocks and can be upgraded to more
                    powerful toy weapons.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-1">The Collector</h4>
                  <p className="leading-relaxed">
                    Collects gold dropped by defeated enemies. When the Collector
                    is selected, all gold hanging in the air flies toward them.
                    Starts with a basic vacuum and can be upgraded to more
                    powerful vacuums that pull gold in faster.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Gold &amp; Economy</h3>
              <ul className="list-disc list-inside ml-4 leading-relaxed space-y-2">
                <li>
                  Defeated enemies drop gold that lingers in the air at the spot
                  where they died.
                </li>
                <li>
                  Switch to the Collector to pull gold toward you. The better
                  your vacuum, the faster gold is collected.
                </li>
                <li>
                  Spend gold between days to buy weapon upgrades and repair your
                  shield.
                </li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Days &amp; Upgrades</h3>
              <ul className="list-disc list-inside ml-4 leading-relaxed space-y-2">
                <li>
                  The game progresses through a series of days. Each day brings a
                  wave of enemies to defeat.
                </li>
                <li>
                  After surviving a day, you are presented with upgrade options
                  you can purchase with your collected gold.
                </li>
                <li>
                  Weapon upgrades are all toy-themed. You start with a slingshot
                  and can upgrade to weapons like marbles that fire in a spread
                  pattern, with more options unlocking as you progress.
                </li>
                <li>
                  Collector upgrades give you stronger vacuums that pull in gold
                  faster.
                </li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Shield</h3>
              <ul className="list-disc list-inside ml-4 leading-relaxed space-y-2">
                <li>
                  Your characters are surrounded by a protective shield dome.
                </li>
                <li>
                  When enemies reach the shield, they begin attacking it and it
                  loses health.
                </li>
                <li>
                  The shield can be repaired for gold between days.
                </li>
                <li>
                  If the shield falls, enemies can approach your characters
                  directly.
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">Game Over</h3>
              <p className="leading-relaxed">
                If an enemy reaches your characters after the shield has fallen,
                the game is over. Survive as many days as you can, upgrade
                wisely, and keep typing fast to stay alive.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
