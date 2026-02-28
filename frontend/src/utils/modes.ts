export type ContentTypeValue = "RandomWords" | "Quotes";

export enum Language {
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

export interface LanguageInfo {
    language: Language;
    flag: string;
    randomWordsMode: string;
    quotesMode: string | null;
}

export interface ProgrammingLanguageInfo {
    language: ProgrammingLanguage;
    icon: string;
    mode: string;
    startupPhrases: string[];
}

export const languages: LanguageInfo[] = [
    { language: Language.English, flag: "🇬🇧", randomWordsMode: "English500", quotesMode: "EnglishQuotes" },
    { language: Language.Spanish, flag: "🇪🇸", randomWordsMode: "Spanish500", quotesMode: "SpanishQuotes" },
    { language: Language.French, flag: "🇫🇷", randomWordsMode: "French500", quotesMode: "FrenchQuotes" },
    { language: Language.German, flag: "🇩🇪", randomWordsMode: "German500", quotesMode: "GermanQuotes" },
    { language: Language.Italian, flag: "🇮🇹", randomWordsMode: "Italian500", quotesMode: "ItalianQuotes" },
    { language: Language.Portuguese, flag: "🇵🇹", randomWordsMode: "Portuguese500", quotesMode: "PortugueseQuotes" },
    { language: Language.Japanese, flag: "🇯🇵", randomWordsMode: "Japanese500", quotesMode: "JapaneseQuotes" },
    { language: Language.Korean, flag: "🇰🇷", randomWordsMode: "Korean500", quotesMode: "KoreanQuotes" },
    { language: Language.Chinese, flag: "🇨🇳", randomWordsMode: "Chinese500", quotesMode: "ChineseQuotes" },
    { language: Language.Ukrainian, flag: "🇺🇦", randomWordsMode: "Ukrainian500", quotesMode: "UkrainianQuotes" },
    { language: Language.Hindi, flag: "🇮🇳", randomWordsMode: "Hindi500", quotesMode: "HindiQuotes" },
    { language: Language.Dutch, flag: "🇳🇱", randomWordsMode: "Dutch500", quotesMode: "DutchQuotes" },
    { language: Language.Swedish, flag: "🇸🇪", randomWordsMode: "Swedish500", quotesMode: "SwedishQuotes" },
    { language: Language.Turkish, flag: "🇹🇷", randomWordsMode: "Turkish500", quotesMode: "TurkishQuotes" },
].sort((a, b) => a.language.localeCompare(b.language));

export const programmingLanguages: ProgrammingLanguageInfo[] = [
    {
        language: ProgrammingLanguage.Python,
        icon: "/logos/python.png",
        mode: "PythonSnippets",
        startupPhrases: [
            "def main()",
            "print('start race')",
            "Race().start()",
            "'ecar'[::-1]",
        ],
    },
    {
        language: ProgrammingLanguage.CSharp,
        icon: "/logos/csharp.svg",
        mode: "CSharpSnippets",
        startupPhrases: [
            "dotnet run",
            "await Race();",
            "Console.ReadLine();",
            "new Race().Start();",
        ],
    },
    {
        language: ProgrammingLanguage.TypeScript,
        icon: "/logos/typescript.svg",
        mode: "TypeScriptSnippets",
        startupPhrases: [
            "console.log('start race')",
            "new Race().start()",
            "await race()",
            "race().then(race)",
        ],
    },
];

export interface ModeOption {
    mode: { tag: string };
    label: string;
    flag: string;
}

export const randomWordsModes: ModeOption[] = languages.map(l => ({
    mode: { tag: l.randomWordsMode },
    label: l.language,
    flag: l.flag,
}));

export const quotesModes: ModeOption[] = languages
    .filter(l => l.quotesMode !== null)
    .map(l => ({
        mode: { tag: l.quotesMode! },
        label: l.language,
        flag: l.flag,
    }));

export function getLanguageFromMode(modeTag: string): Language {
    const langInfo = languages.find(l => l.randomWordsMode === modeTag || l.quotesMode === modeTag);
    return langInfo?.language || Language.English;
}

export function getContentTypeFromMode(modeTag: string): ContentTypeValue {
    if (modeTag.endsWith("Quotes")) {
        return "Quotes";
    }
    return "RandomWords";
}

export function isProgrammingMode(modeTag: string): boolean {
    return programmingLanguages.some(p => p.mode === modeTag);
}

export function getProgrammingLanguageFromMode(modeTag: string): ProgrammingLanguageInfo | undefined {
    return programmingLanguages.find(p => p.mode === modeTag);
}

const shikiLanguageMap: Record<string, "python" | "csharp" | "typescript"> = {
    PythonSnippets: "python",
    CSharpSnippets: "csharp",
    TypeScriptSnippets: "typescript",
};

export function getShikiLanguage(modeTag: string): "python" | "csharp" | "typescript" | undefined {
    return shikiLanguageMap[modeTag];
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
};

export function getRandomStartupPhrase(gameModeTag: string): string {
  const programmingLanguage = getProgrammingLanguageFromMode(gameModeTag);
  if (programmingLanguage) {
    const phrases = programmingLanguage.startupPhrases;
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  const language = getLanguageFromMode(gameModeTag);
  const phrases = languageStartupPhrases[language] || languageStartupPhrases[Language.English];
  const randomIndex = Math.floor(Math.random() * phrases.length);
  return phrases[randomIndex];
}
