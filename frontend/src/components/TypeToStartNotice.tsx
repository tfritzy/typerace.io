import { useEffect, useState } from "react";
import { HandDrawnArrow } from "./HandDrawnArrow";
import { RoughPaperFilter } from "./RoughPaperFilter";

type TypeToStartNoticeProps = {
  prompt?: {
    instruction: string;
    constraint: string;
  };
};

export function TypeToStartNotice({ prompt }: TypeToStartNoticeProps) {
  const [isFontReady, setIsFontReady] = useState(false);

  useEffect(() => {
    if (!prompt) {
      setIsFontReady(false);
      return;
    }

    let cancelled = false;
    const stylesheet = document.querySelector<HTMLLinkElement>("#google-fonts");

    const waitForStylesheet = () =>
      new Promise<void>((resolve) => {
        if (!stylesheet || stylesheet.dataset.loaded) {
          resolve();
          return;
        }

        const finish = () => resolve();
        stylesheet.addEventListener("load", finish, { once: true });
        stylesheet.addEventListener("error", finish, { once: true });
      });

    setIsFontReady(false);
    void waitForStylesheet()
      .then(() =>
        document.fonts.load(
          "1em Handlee",
          `${prompt.instruction} ${prompt.constraint}`,
        ),
      )
      .finally(() => {
        if (!cancelled) setIsFontReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [prompt]);

  if (!prompt || !isFontReady) return null;

  return (
    <div
      aria-hidden="true"
      className="absolute bottom-full left-4 w-80 h-28 mb-3 origin-bottom-left scale-85 pointer-events-none text-muted-foreground"
      style={{ fontFamily: "Handlee, cursive", contain: "layout style" }}
    >
      <RoughPaperFilter id="rough-handwriting" />
      <div
        className="absolute inset-0 animate-[handwritingReveal_250ms_ease-out]"
        style={{ filter: "url(#rough-handwriting)" }}
      >
        <div className="absolute left-12 -top-5">
          <div className="text-4xl whitespace-nowrap">{prompt.instruction}</div>
          <div className="mt-1 ml-4 text-2xl whitespace-nowrap">
            ∗{prompt.constraint}
          </div>
        </div>
        <HandDrawnArrow className="absolute left-1 top-6 h-[84px] w-14" />
      </div>
    </div>
  );
}
