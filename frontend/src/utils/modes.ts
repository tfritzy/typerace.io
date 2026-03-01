export type ContentTypeValue = "RandomWords" | "Quotes";

export enum SpokenLanguage {
    English = "English",
    Spanish = "Spanish",
    French = "French",
    German = "German",
    Italian = "Italian",
    Portuguese = "Portuguese",
    Japanese = "Japanese",
    Korean = "Korean",
    Chinese = "Chinese",
    Ukrainian = "Ukrainian",
    Arabic = "Arabic",
    Hindi = "Hindi",
    Dutch = "Dutch",
    Swedish = "Swedish",
    Turkish = "Turkish",
}

export enum ProgrammingLanguage {
    Python = "Python",
    CSharp = "C#",
    TypeScript = "TypeScript",
}

export type Language = SpokenLanguage | ProgrammingLanguage;
export const Language = { ...SpokenLanguage, ...ProgrammingLanguage };

export interface SpokenLanguageInfo {
    language: SpokenLanguage;
    flag: string;
    randomWordsMode: string;
    quotesMode: string;
}

export interface ProgrammingLanguageInfo {
    language: ProgrammingLanguage;
    icon: string;
    quotesMode: string;
    shikiLanguage: string;
}

export const spokenLanguages: SpokenLanguageInfo[] = [
    { language: SpokenLanguage.English, flag: "🇬🇧", randomWordsMode: "English500", quotesMode: "EnglishQuotes" },
    { language: SpokenLanguage.Spanish, flag: "🇪🇸", randomWordsMode: "Spanish500", quotesMode: "SpanishQuotes" },
    { language: SpokenLanguage.French, flag: "🇫🇷", randomWordsMode: "French500", quotesMode: "FrenchQuotes" },
    { language: SpokenLanguage.German, flag: "🇩🇪", randomWordsMode: "German500", quotesMode: "GermanQuotes" },
    { language: SpokenLanguage.Italian, flag: "🇮🇹", randomWordsMode: "Italian500", quotesMode: "ItalianQuotes" },
    { language: SpokenLanguage.Portuguese, flag: "🇵🇹", randomWordsMode: "Portuguese500", quotesMode: "PortugueseQuotes" },
    { language: SpokenLanguage.Japanese, flag: "🇯🇵", randomWordsMode: "Japanese500", quotesMode: "JapaneseQuotes" },
    { language: SpokenLanguage.Korean, flag: "🇰🇷", randomWordsMode: "Korean500", quotesMode: "KoreanQuotes" },
    { language: SpokenLanguage.Chinese, flag: "🇨🇳", randomWordsMode: "Chinese500", quotesMode: "ChineseQuotes" },
    { language: SpokenLanguage.Ukrainian, flag: "🇺🇦", randomWordsMode: "Ukrainian500", quotesMode: "UkrainianQuotes" },
    { language: SpokenLanguage.Arabic, flag: "🇸🇦", randomWordsMode: "Arabic500", quotesMode: "ArabicQuotes" },
    { language: SpokenLanguage.Hindi, flag: "🇮🇳", randomWordsMode: "Hindi500", quotesMode: "HindiQuotes" },
    { language: SpokenLanguage.Dutch, flag: "🇳🇱", randomWordsMode: "Dutch500", quotesMode: "DutchQuotes" },
    { language: SpokenLanguage.Swedish, flag: "🇸🇪", randomWordsMode: "Swedish500", quotesMode: "SwedishQuotes" },
    { language: SpokenLanguage.Turkish, flag: "🇹🇷", randomWordsMode: "Turkish500", quotesMode: "TurkishQuotes" },
].sort((a, b) => a.language.localeCompare(b.language));

export const programmingLanguages: ProgrammingLanguageInfo[] = [
    { language: ProgrammingLanguage.Python, icon: "/icons/python.png", quotesMode: "PythonSnippets", shikiLanguage: "python" },
    { language: ProgrammingLanguage.CSharp, icon: "/icons/csharp.svg", quotesMode: "CSharpSnippets", shikiLanguage: "csharp" },
    { language: ProgrammingLanguage.TypeScript, icon: "/icons/typescript.svg", quotesMode: "TypeScriptSnippets", shikiLanguage: "typescript" },
].sort((a, b) => a.language.localeCompare(b.language));

export function getShikiLanguage(modeTag: string): string | undefined {
    return programmingLanguages.find(l => l.quotesMode === modeTag)?.shikiLanguage;
}

export interface ModeOption {
    mode: { tag: string };
    label: string;
    flag: string;
}

export const randomWordsModes: ModeOption[] = spokenLanguages.map(l => ({
    mode: { tag: l.randomWordsMode },
    label: l.language,
    flag: l.flag,
}));

export const quotesModes: ModeOption[] = spokenLanguages.map(l => ({
    mode: { tag: l.quotesMode },
    label: l.language,
    flag: l.flag,
}));

export function getLanguageFromMode(modeTag: string): Language {
    const spoken = spokenLanguages.find(l => l.randomWordsMode === modeTag || l.quotesMode === modeTag);
    if (spoken) return spoken.language;
    const programming = programmingLanguages.find(l => l.quotesMode === modeTag);
    if (programming) return programming.language;
    return SpokenLanguage.English;
}

export function getContentTypeFromMode(modeTag: string): ContentTypeValue {
    if (modeTag.endsWith("Quotes") || modeTag.endsWith("Snippets")) {
        return "Quotes";
    }
    return "RandomWords";
}

const languageStartupPhrases: Record<Language, string[]> = {
  [Language.English]: [
    "glhf",
    "glgl",
    "ready for dust-off",
    "let's go",
    "commence bombardment",
    "ready to plunder",
    "fortune favors the bold",
    "let's get into the fight",
    "systems primed",
    "bring it",
    "oh, it's on",
    "let's do this",
    "it's go time",
    "it's about to get heavy",
    "put me in coach",
  ],
  [Language.Spanish]: [
    "adelante",
    "listos para la batalla",
    "vamos allá",
    "a por ellos",
    "preparados",
    "empecemos",
    "suerte a todos",
  ],
  [Language.French]: [
    "en avant",
    "prêts pour la bataille",
    "allons-y",
    "bonne chance",
    "c'est parti",
    "commençons",
    "à l'attaque",
  ],
  [Language.German]: [
    "los geht's",
    "viel glück",
    "auf in den kampf",
    "bereit",
    "angriff",
    "vorwärts",
    "jetzt geht's los",
  ],
  [Language.Italian]: [
    "andiamo",
    "buona fortuna",
    "pronti via",
    "avanti",
    "iniziamo",
    "forza",
    "si parte",
  ],
  [Language.Portuguese]: [
    "vamos lá",
    "boa sorte",
    "preparados",
    "começar",
    "avante",
    "força",
    "partiu",
  ],
  [Language.Japanese]: [
    "がんばって",
    "行きましょう",
    "準備完了",
    "スタート",
    "よろしく",
  ],
  [Language.Korean]: [
    "화이팅",
    "가자",
    "시작하자",
    "준비 완료",
    "파이팅",
  ],
  [Language.Chinese]: [
    "加油",
    "开始吧",
    "出发",
    "准备好了",
    "冲",
  ],
  [Language.Ukrainian]: [
    "вперед",
    "удачі",
    "готові",
    "почали",
    "за перемогу",
  ],
  [Language.Arabic]: [
    "يلا",
    "بالتوفيق",
    "هيا بنا",
    "جاهزون",
    "ابدأ",
  ],
  [Language.Hindi]: [
    "चलो",
    "शुभकामनाएं",
    "तैयार हैं",
    "शुरू करें",
    "जीत हमारी",
  ],
  [Language.Dutch]: [
    "laten we gaan",
    "veel succes",
    "klaar",
    "vooruit",
    "beginnen maar",
    "op naar de overwinning",
  ],
  [Language.Swedish]: [
    "kör hårt",
    "lycka till",
    "vi kör",
    "redo",
    "framåt",
    "nu kör vi",
  ],
  [Language.Turkish]: [
    "hadi bakalım",
    "başarılar",
    "hazırız",
    "başlayalım",
    "ileri",
    "haydi",
  ],
  [Language.Python]: [
    "import antigravity",
    "pip install",
    "def main():",
    "it's snake time",
    "python -m game",
  ],
  [Language.CSharp]: [
    "using System;",
    "new Game()",
    "dotnet run",
    "Console.WriteLine",
    "await Task.WhenAll",
  ],
  [Language.TypeScript]: [
    "tsc --watch",
    "export type",
    "const fn = () =>",
    "npm run dev",
    "await Promise.all",
  ],
};

export function getRandomStartupPhrase(gameModeTag: string): string {
  const language = getLanguageFromMode(gameModeTag);
  const phrases = languageStartupPhrases[language] || languageStartupPhrases[Language.English];
  const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % phrases.length;
  return phrases[randomIndex];
}

export function isProgrammingMode(modeTag: string): boolean {
  return programmingLanguages.some(l => l.quotesMode === modeTag);
}
