export function getPhraseLength(phrase: string): number {
  const trimmedPhrase = phrase.trim();
  if (!trimmedPhrase) return 0;

  return /\s/u.test(trimmedPhrase)
    ? trimmedPhrase.split(/\s+/u).length
    : Array.from(trimmedPhrase).length;
}
