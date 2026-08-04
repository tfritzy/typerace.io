import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  type MutableRefObject,
} from "react";

const SPACE_INDICATOR = "␣";
const CHARACTER_CLASS = "phrase-character";
const UNTYPED_CHARACTER_CLASS =
  `${CHARACTER_CLASS} text-text-untyped`;
const ERROR_CHARACTER_CLASS =
  `${CHARACTER_CLASS} text-destructive underline decoration-2 decoration-destructive`;
const COMPLETED_ERROR_CHARACTER_CLASS =
  `${CHARACTER_CLASS} text-destructive opacity-60`;
const COMPLETED_CHARACTER_CLASS =
  `${CHARACTER_CLASS} text-text-completed`;
const CURRENT_CHARACTER_CLASS =
  `${CHARACTER_CLASS} text-foreground`;

type PhraseCharactersProps = {
  phrase: string;
  input: string;
  completedThrough?: number;
  targetRef: MutableRefObject<HTMLElement | null>;
};

export type PhraseCharactersRef = {
  setInput: (input: string, completedThrough?: number) => void;
};

type InputState = {
  phrase: string;
  input: string;
  completedThrough: number;
};

function getCompletedThrough(phrase: string, input: string) {
  let completedThrough = 0;
  for (let index = 0; index < input.length && index < phrase.length; index++) {
    if (input[index] !== phrase[index]) break;
    if (phrase[index] === " ") completedThrough = index + 1;
  }
  return completedThrough;
}

function firstChangedIndex(previousInput: string, input: string) {
  const sharedLength = Math.min(previousInput.length, input.length);
  let index = 0;
  while (index < sharedLength && previousInput[index] === input[index]) index++;
  return index;
}

function getCharacterClass(
  phrase: string,
  input: string,
  index: number,
  completedThrough: number,
) {
  if (index >= input.length) return UNTYPED_CHARACTER_CLASS;
  if (input[index] !== phrase[index]) {
    return index < completedThrough
      ? COMPLETED_ERROR_CHARACTER_CLASS
      : ERROR_CHARACTER_CLASS;
  }
  if (index < completedThrough) {
    return COMPLETED_CHARACTER_CLASS;
  }
  return CURRENT_CHARACTER_CLASS;
}

export const PhraseCharacters = memo(
  forwardRef<PhraseCharactersRef, PhraseCharactersProps>(
    ({ phrase, input, completedThrough, targetRef }, ref) => {
      const characterRefs = useRef<Array<HTMLElement | null>>([]);
      const stateRef = useRef<InputState | null>(null);

      const characters = useMemo(
        () => [
          ...Array.from(phrase, (character, index) => (
            <span
              key={index}
              ref={(element) => {
                characterRefs.current[index] = element;
              }}
              data-char-index={index}
              data-error=""
              className={UNTYPED_CHARACTER_CLASS}
            >
              {character}
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
        [phrase],
      );

      const setInput = useCallback(
        (nextInput: string, nextLockedThrough?: number) => {
          const previous =
            stateRef.current?.phrase === phrase
              ? stateRef.current
              : { phrase, input: "", completedThrough: 0 };
          const completedThrough =
            nextLockedThrough ?? getCompletedThrough(phrase, nextInput);
          const completionChanged =
            previous.completedThrough !== phrase.length &&
            completedThrough === phrase.length;
          let start = firstChangedIndex(previous.input, nextInput);

          if (
            previous.completedThrough !== completedThrough ||
            completionChanged
          ) {
            start = Math.min(
              start,
              previous.completedThrough,
              completedThrough,
            );
          }

          start = Math.min(start, phrase.length);
          const end = completionChanged
            ? phrase.length
            : Math.min(
                phrase.length,
                Math.max(
                  previous.input.length,
                  nextInput.length,
                  previous.completedThrough,
                  completedThrough,
                ),
              );
          for (let index = start; index < end; index++) {
            const element = characterRefs.current[index];
            if (!element) continue;

            const typedCharacter = nextInput[index];
            const isTyped = index < nextInput.length;
            const isError = isTyped && typedCharacter !== phrase[index];
            const className = getCharacterClass(
              phrase,
              nextInput,
              index,
              completedThrough,
            );
            if (element.className !== className) {
              element.className = className;
            }

            const errorIndicator = !isError
              ? ""
              : typedCharacter === " "
                ? SPACE_INDICATOR
                : typedCharacter;
            if (element.dataset.error !== errorIndicator) {
              element.dataset.error = errorIndicator;
            }
          }

          targetRef.current =
            characterRefs.current[
              Math.min(nextInput.length, phrase.length)
            ] ?? null;
          stateRef.current = {
            phrase,
            input: nextInput,
            completedThrough,
          };
        },
        [phrase, targetRef],
      );

      useImperativeHandle(ref, () => ({ setInput }), [setInput]);
      useLayoutEffect(
        () => setInput(input, completedThrough),
        [input, completedThrough, setInput],
      );

      return characters;
    },
  ),
);
