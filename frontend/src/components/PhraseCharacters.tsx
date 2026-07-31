import {
  memo,
  useLayoutEffect,
  useMemo,
  useRef,
  type MutableRefObject,
} from "react";

const NON_BREAKING_SPACE = "\u00A0";
const SPACE_INDICATOR = "␣";
const ERROR_INDICATOR_CLASS =
  "pointer-events-none absolute left-1/2 -translate-x-1/2 -top-[1em] leading-none text-destructive text-xs";
const UNTYPED_CHARACTER_CLASS =
  "transition-all duration-150 leading-none text-text-untyped";
const ERROR_CHARACTER_CLASS =
  "transition-all duration-150 leading-none text-destructive underline decoration-2 decoration-destructive";
const COMPLETED_CHARACTER_CLASS =
  "transition-all duration-150 leading-none text-text-completed";
const CURRENT_CHARACTER_CLASS =
  "transition-all duration-150 leading-none text-foreground";
const INLINE_CHARACTER_STYLE = { display: "inline-block" } as const;

interface PhraseCharactersProps {
  phrase: string;
  input: string;
  noSpaces?: boolean;
  targetRef: MutableRefObject<HTMLElement | null>;
}

export const PhraseCharacters = memo(
  ({ phrase, input, noSpaces, targetRef }: PhraseCharactersProps) => {
    const characterRefs = useRef<Array<HTMLSpanElement | null>>([]);
    const textRefs = useRef<Array<HTMLSpanElement | null>>([]);
    const errorRefs = useRef<Array<HTMLSpanElement | null>>([]);

    const characters = useMemo(
      () => [
        ...Array.from(phrase, (char, index) => (
          <span
            key={index}
            ref={(element) => {
              characterRefs.current[index] = element;
            }}
            data-char-index={index}
            className="relative"
            style={noSpaces ? INLINE_CHARACTER_STYLE : undefined}
          >
            <span
              ref={(element) => {
                errorRefs.current[index] = element;
              }}
              className={ERROR_INDICATOR_CLASS}
            >
              {NON_BREAKING_SPACE}
            </span>
            <span
              ref={(element) => {
                textRefs.current[index] = element;
              }}
              className={UNTYPED_CHARACTER_CLASS}
            >
              {char}
            </span>
          </span>
        )),
        <span
          key="cursor-at-end"
          ref={(element) => {
            characterRefs.current[phrase.length] = element;
          }}
          data-char-index={phrase.length}
        />,
      ],
      [phrase, noSpaces],
    );

    useLayoutEffect(() => {
      let lastCompletedWordEnd = 0;
      for (
        let index = 0;
        index < input.length && index < phrase.length;
        index++
      ) {
        if (input[index] !== phrase[index]) break;
        if (phrase[index] === " ") lastCompletedWordEnd = index + 1;
      }

      const phraseComplete = input === phrase;
      for (let index = 0; index < phrase.length; index++) {
        const typedChar = input[index];
        const isTyped = index < input.length;
        const isCorrect = typedChar === phrase[index];
        const isError = isTyped && !isCorrect;

        let className = UNTYPED_CHARACTER_CLASS;
        if (isError) {
          className = ERROR_CHARACTER_CLASS;
        } else if (phraseComplete || index < lastCompletedWordEnd) {
          className = COMPLETED_CHARACTER_CLASS;
        } else if (
          index >= lastCompletedWordEnd &&
          index < input.length &&
          isCorrect
        ) {
          className = CURRENT_CHARACTER_CLASS;
        }

        const textElement = textRefs.current[index];
        if (textElement && textElement.className !== className) {
          textElement.className = className;
        }

        const errorElement = errorRefs.current[index];
        const indicator = !isError
          ? NON_BREAKING_SPACE
          : typedChar === " "
            ? SPACE_INDICATOR
            : typedChar;
        if (errorElement && errorElement.textContent !== indicator) {
          errorElement.textContent = indicator;
        }
      }

      targetRef.current =
        characterRefs.current[Math.min(input.length, phrase.length)] ?? null;
    }, [input, phrase, targetRef]);

    return characters;
  },
);
