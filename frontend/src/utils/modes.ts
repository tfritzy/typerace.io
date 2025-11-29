export type ContentTypeValue = "RandomWords" | "Quotes";

export interface ModeOption {
    mode: { tag: string };
    label: string;
    flag: string;
}

export const randomWordsModes: ModeOption[] = [
    { mode: { tag: "English500" }, label: "English", flag: "🇬🇧" },
    { mode: { tag: "Spanish500" }, label: "Spanish", flag: "🇪🇸" },
    { mode: { tag: "French500" }, label: "French", flag: "🇫🇷" },
    { mode: { tag: "German500" }, label: "German", flag: "🇩🇪" },
    { mode: { tag: "Italian500" }, label: "Italian", flag: "🇮🇹" },
    { mode: { tag: "Portuguese500" }, label: "Portuguese", flag: "🇵🇹" },
    { mode: { tag: "Japanese500" }, label: "Japanese", flag: "🇯🇵" },
    { mode: { tag: "Korean500" }, label: "Korean", flag: "🇰🇷" },
    { mode: { tag: "Chinese500" }, label: "Chinese", flag: "🇨🇳" },
    { mode: { tag: "Ukrainian500" }, label: "Ukrainian", flag: "🇺🇦" },
    { mode: { tag: "Arabic500" }, label: "Arabic", flag: "🇸🇦" },
    { mode: { tag: "Hindi500" }, label: "Hindi", flag: "🇮🇳" },
    { mode: { tag: "Dutch500" }, label: "Dutch", flag: "🇳🇱" },
    { mode: { tag: "Swedish500" }, label: "Swedish", flag: "🇸🇪" },
    { mode: { tag: "Turkish500" }, label: "Turkish", flag: "🇹🇷" },
];

export const quotesModes: ModeOption[] = [
    { mode: { tag: "EnglishQuotes" }, label: "English", flag: "🇬🇧" },
    { mode: { tag: "SpanishQuotes" }, label: "Spanish", flag: "🇪🇸" },
    { mode: { tag: "FrenchQuotes" }, label: "French", flag: "🇫🇷" },
    { mode: { tag: "GermanQuotes" }, label: "German", flag: "🇩🇪" },
    { mode: { tag: "ItalianQuotes" }, label: "Italian", flag: "🇮🇹" },
    { mode: { tag: "PortugueseQuotes" }, label: "Portuguese", flag: "🇵🇹" },
];

export function getContentTypeFromMode(modeTag: string): ContentTypeValue {
    if (modeTag.endsWith("Quotes")) {
        return "Quotes";
    }
    return "RandomWords";
}

const languageStartupPhrases: Record<string, string[]> = {
  English: [
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
  Spanish: [
    "adelante",
    "listos para la batalla",
    "vamos allá",
    "a por ellos",
    "preparados",
    "empecemos",
    "suerte a todos",
  ],
  French: [
    "en avant",
    "prêts pour la bataille",
    "allons-y",
    "bonne chance",
    "c'est parti",
    "commençons",
    "à l'attaque",
  ],
  German: [
    "los geht's",
    "viel glück",
    "auf in den kampf",
    "bereit",
    "angriff",
    "vorwärts",
    "jetzt geht's los",
  ],
  Italian: [
    "andiamo",
    "buona fortuna",
    "pronti via",
    "avanti",
    "iniziamo",
    "forza",
    "si parte",
  ],
  Portuguese: [
    "vamos lá",
    "boa sorte",
    "preparados",
    "começar",
    "avante",
    "força",
    "partiu",
  ],
  Japanese: [
    "がんばって",
    "行きましょう",
    "準備完了",
    "スタート",
    "よろしく",
  ],
  Korean: [
    "화이팅",
    "가자",
    "시작하자",
    "준비 완료",
    "파이팅",
  ],
  Chinese: [
    "加油",
    "开始吧",
    "出发",
    "准备好了",
    "冲",
  ],
  Ukrainian: [
    "вперед",
    "удачі",
    "готові",
    "почали",
    "за перемогу",
  ],
  Arabic: [
    "يلا",
    "بالتوفيق",
    "هيا بنا",
    "جاهزون",
    "ابدأ",
  ],
  Hindi: [
    "चलो",
    "शुभकामनाएं",
    "तैयार हैं",
    "शुरू करें",
    "जीत हमारी",
  ],
  Dutch: [
    "laten we gaan",
    "veel succes",
    "klaar",
    "vooruit",
    "beginnen maar",
    "op naar de overwinning",
  ],
  Swedish: [
    "kör hårt",
    "lycka till",
    "vi kör",
    "redo",
    "framåt",
    "nu kör vi",
  ],
  Turkish: [
    "hadi bakalım",
    "başarılar",
    "hazırız",
    "başlayalım",
    "ileri",
    "haydi",
  ],
};

function getLanguageFromModeTag(gameModeTag: string): string {
  const allModes = [...randomWordsModes, ...quotesModes];
  const mode = allModes.find(m => m.mode.tag === gameModeTag);
  return mode?.label || "English";
}

export function getRandomStartupPhrase(gameModeTag: string): string {
  const language = getLanguageFromModeTag(gameModeTag);
  const phrases = languageStartupPhrases[language] || languageStartupPhrases.English;
  const randomIndex = Math.floor(Math.random() * phrases.length);
  return phrases[randomIndex];
}
