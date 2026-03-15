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

export interface LanguageInfo {
    language: Language;
    flag: string;
    countryCode: string;
    slug: string;
    randomWordsMode: string;
    quotesMode: string | null;
    nativeName: string;
    htmlLang: string;
    title: string;
    description: string;
}

export const languages: LanguageInfo[] = [
    { language: Language.English, flag: "🇬🇧", countryCode: "gb", slug: "", randomWordsMode: "English500", quotesMode: "EnglishQuotes", nativeName: "English", htmlLang: "en", title: "TypeRace.io - Multiplayer Typing Race", description: "Race against players worldwide in real-time typing competitions. Test and improve your typing speed in multiplayer races." },
    { language: Language.Spanish, flag: "🇪🇸", countryCode: "es", slug: "es", randomWordsMode: "Spanish500", quotesMode: "SpanishQuotes", nativeName: "Español", htmlLang: "es", title: "TypeRace.io - Carrera de mecanografía", description: "Compite contra jugadores de todo el mundo en carreras de mecanografía en tiempo real. Mejora tu velocidad de escritura." },
    { language: Language.French, flag: "🇫🇷", countryCode: "fr", slug: "fr", randomWordsMode: "French500", quotesMode: "FrenchQuotes", nativeName: "Français", htmlLang: "fr", title: "TypeRace.io - Course de dactylographie", description: "Affrontez des joueurs du monde entier dans des compétitions de frappe en temps réel. Améliorez votre vitesse de frappe." },
    { language: Language.German, flag: "🇩🇪", countryCode: "de", slug: "de", randomWordsMode: "German500", quotesMode: "GermanQuotes", nativeName: "Deutsch", htmlLang: "de", title: "TypeRace.io - Tippwettbewerb", description: "Tritt gegen Spieler weltweit in Echtzeit-Tippwettbewerben an. Verbessere deine Tippgeschwindigkeit." },
    { language: Language.Italian, flag: "🇮🇹", countryCode: "it", slug: "it", randomWordsMode: "Italian500", quotesMode: "ItalianQuotes", nativeName: "Italiano", htmlLang: "it", title: "TypeRace.io - Gara di digitazione", description: "Gareggia contro giocatori di tutto il mondo in competizioni di digitazione in tempo reale. Migliora la tua velocità di battitura." },
    { language: Language.Portuguese, flag: "🇵🇹", countryCode: "pt", slug: "pt", randomWordsMode: "Portuguese500", quotesMode: "PortugueseQuotes", nativeName: "Português", htmlLang: "pt", title: "TypeRace.io - Corrida de digitação", description: "Compita contra jogadores de todo o mundo em competições de digitação em tempo real. Melhore sua velocidade de digitação." },
    { language: Language.Japanese, flag: "🇯🇵", countryCode: "jp", slug: "ja", randomWordsMode: "Japanese500", quotesMode: "JapaneseQuotes", nativeName: "日本語", htmlLang: "ja", title: "TypeRace.io - タイピングレース", description: "世界中のプレイヤーとリアルタイムのタイピング競争で対戦しましょう。タイピング速度を向上させましょう。" },
    { language: Language.Korean, flag: "🇰🇷", countryCode: "kr", slug: "ko", randomWordsMode: "Korean500", quotesMode: "KoreanQuotes", nativeName: "한국어", htmlLang: "ko", title: "TypeRace.io - 타이핑 레이스", description: "전 세계 플레이어와 실시간 타이핑 대회에서 경쟁하세요. 타이핑 속도를 향상시키세요." },
    { language: Language.Chinese, flag: "🇨🇳", countryCode: "cn", slug: "zh", randomWordsMode: "Chinese500", quotesMode: "ChineseQuotes", nativeName: "中文", htmlLang: "zh", title: "TypeRace.io - 打字竞赛", description: "与全球玩家进行实时打字比赛。提高你的打字速度。" },
    { language: Language.Ukrainian, flag: "🇺🇦", countryCode: "ua", slug: "uk", randomWordsMode: "Ukrainian500", quotesMode: "UkrainianQuotes", nativeName: "Українська", htmlLang: "uk", title: "TypeRace.io - Змагання з друку", description: "Змагайтеся з гравцями з усього світу в змаганнях з друку в реальному часі. Покращуйте швидкість друку." },
    { language: Language.Hindi, flag: "🇮🇳", countryCode: "in", slug: "hi", randomWordsMode: "Hindi500", quotesMode: "HindiQuotes", nativeName: "हिन्दी", htmlLang: "hi", title: "TypeRace.io - टाइपिंग रेस", description: "वास्तविक समय में टाइपिंग प्रतियोगिताओं में दुनिया भर के खिलाड़ियों के खिलाफ प्रतिस्पर्धा करें। अपनी टाइपिंग गति में सुधार करें।" },
    { language: Language.Dutch, flag: "🇳🇱", countryCode: "nl", slug: "nl", randomWordsMode: "Dutch500", quotesMode: "DutchQuotes", nativeName: "Nederlands", htmlLang: "nl", title: "TypeRace.io - Typwedstrijd", description: "Race tegen spelers wereldwijd in real-time typwedstrijden. Verbeter je typsnelheid." },
    { language: Language.Swedish, flag: "🇸🇪", countryCode: "se", slug: "sv", randomWordsMode: "Swedish500", quotesMode: "SwedishQuotes", nativeName: "Svenska", htmlLang: "sv", title: "TypeRace.io - Skrivtävling", description: "Tävla mot spelare världen över i skrivtävlingar i realtid. Förbättra din skrivhastighet." },
    { language: Language.Turkish, flag: "🇹🇷", countryCode: "tr", slug: "tr", randomWordsMode: "Turkish500", quotesMode: "TurkishQuotes", nativeName: "Türkçe", htmlLang: "tr", title: "TypeRace.io - Yazma yarışı", description: "Dünya genelindeki oyuncularla gerçek zamanlı yazma yarışmalarında yarışın. Yazma hızınızı geliştirin." },
].sort((a, b) => a.language.localeCompare(b.language));

export function getLanguageFromMode(modeTag: string): Language {
    const langInfo = languages.find(l => l.randomWordsMode === modeTag || l.quotesMode === modeTag);
    return langInfo?.language || Language.English;
}

export function getLanguageFromSlug(slug: string | undefined): LanguageInfo {
    if (!slug) return languages.find(l => l.language === Language.English)!;
    return languages.find(l => l.slug === slug) || languages.find(l => l.language === Language.English)!;
}

const LANG_SLUG_KEY = "typerace_lang_slug";

export function storeLangSlug(slug: string): void {
    try { localStorage.setItem(LANG_SLUG_KEY, slug); } catch {}
}

export function getLangHome(): string {
    try {
        const slug = localStorage.getItem(LANG_SLUG_KEY);
        if (slug) return `/${slug}`;
    } catch {}
    return "/";
}

export function getLangPrefix(): string {
    try {
        const slug = localStorage.getItem(LANG_SLUG_KEY);
        if (slug) return `/${slug}`;
    } catch {}
    return "";
}

export function getContentTypeFromMode(modeTag: string): ContentTypeValue {
    if (modeTag.endsWith("Quotes")) {
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
};

export function getMaxPlayerCount(gameTypeTag: string): number {
  switch (gameTypeTag) {
    case "Practice": return 1;
    case "Public": return 3;
    case "Private": return 6;
    default: return 3;
  }
}

export function getRandomStartupPhrase(gameModeTag: string): string {
  const language = getLanguageFromMode(gameModeTag);
  const phrases = languageStartupPhrases[language] || languageStartupPhrases[Language.English];
  const randomIndex = Math.floor(Math.random() * phrases.length);
  return phrases[randomIndex];
}
