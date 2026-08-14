export type ContentTypeValue = "RandomWords" | "Quotes";

export const WORD_COUNT_BUCKETS = [8, 12, 16, 20] as const;
export type WordCountBucket = (typeof WORD_COUNT_BUCKETS)[number];

export enum Language {
  English = "English",
  Spanish = "Spanish",
  French = "French",
  German = "German",
  Italian = "Italian",
  Portuguese = "Portuguese",
  Ukrainian = "Ukrainian",
  Arabic = "Arabic",
  Dutch = "Dutch",
  Swedish = "Swedish",
  Turkish = "Turkish",
  Russian = "Russian",
  Romanian = "Romanian",
  Indonesian = "Indonesian",
  Polish = "Polish",
  Czech = "Czech",
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
  measurementMode: "wpm" | "cpm";
  title: string;
  description: string;
}

export const languages: LanguageInfo[] = [
  {
    language: Language.English,
    flag: "🇬🇧",
    countryCode: "gb",
    slug: "",
    randomWordsMode: "English500",
    quotesMode: "EnglishQuotes",
    nativeName: "English",
    htmlLang: "en",
    measurementMode: "wpm" as const,
    title: "TypeRace.io | Multiplayer Typing Races and WPM Tracker",
    description:
      "Race against players worldwide in real-time typing competitions. Test and improve your typing speed in multiplayer races.",
  },
  {
    language: Language.Spanish,
    flag: "🇪🇸",
    countryCode: "es",
    slug: "es",
    randomWordsMode: "Spanish500",
    quotesMode: "SpanishQuotes",
    nativeName: "Español",
    htmlLang: "es",
    measurementMode: "wpm" as const,
    title:
      "TypeRace.io | Batallas de mecanografía trepidantes y medidor de PPM",
    description:
      "Compite contra jugadores de todo el mundo en carreras de mecanografía en tiempo real. Mejora tu velocidad de escritura.",
  },
  {
    language: Language.French,
    flag: "🇫🇷",
    countryCode: "fr",
    slug: "fr",
    randomWordsMode: "French500",
    quotesMode: "FrenchQuotes",
    nativeName: "Français",
    htmlLang: "fr",
    measurementMode: "wpm" as const,
    title: "TypeRace.io | Duels de frappe effrénés et suivi MPM",
    description:
      "Affrontez des joueurs du monde entier dans des compétitions de frappe en temps réel. Améliorez votre vitesse de frappe.",
  },
  {
    language: Language.German,
    flag: "🇩🇪",
    countryCode: "de",
    slug: "de",
    randomWordsMode: "German500",
    quotesMode: "GermanQuotes",
    nativeName: "Deutsch",
    htmlLang: "de",
    measurementMode: "wpm" as const,
    title: "TypeRace.io | Rasante Tippduelle und WPM-Tracker",
    description:
      "Tritt gegen Spieler weltweit in Echtzeit-Tippwettbewerben an. Verbessere deine Tippgeschwindigkeit.",
  },
  {
    language: Language.Italian,
    flag: "🇮🇹",
    countryCode: "it",
    slug: "it",
    randomWordsMode: "Italian500",
    quotesMode: "ItalianQuotes",
    nativeName: "Italiano",
    htmlLang: "it",
    measurementMode: "wpm" as const,
    title: "TypeRace.io | Sfide di digitazione ad alto ritmo e tracker PPM",
    description:
      "Gareggia contro giocatori di tutto il mondo in competizioni di digitazione in tempo reale. Migliora la tua velocità di battitura.",
  },
  {
    language: Language.Portuguese,
    flag: "🇵🇹",
    countryCode: "pt",
    slug: "pt",
    randomWordsMode: "Portuguese500",
    quotesMode: "PortugueseQuotes",
    nativeName: "Português",
    htmlLang: "pt",
    measurementMode: "wpm" as const,
    title:
      "TypeRace.io | Batalhas de digitação em ritmo acelerado e rastreador de PPM",
    description:
      "Compita contra jogadores de todo o mundo em competições de digitação em tempo real. Melhore sua velocidade de digitação.",
  },
  {
    language: Language.Indonesian,
    flag: "🇮🇩",
    countryCode: "id",
    slug: "id",
    randomWordsMode: "Indonesian500",
    quotesMode: "IndonesianQuotes",
    nativeName: "Bahasa Indonesia",
    htmlLang: "id",
    measurementMode: "wpm" as const,
    title: "TypeRace.io | Balapan Mengetik Cepat dan Pelacak WPM",
    description:
      "Berlomba melawan pemain dari seluruh dunia dalam kompetisi mengetik waktu nyata. Tingkatkan kecepatan mengetik Anda.",
  },
  {
    language: Language.Polish,
    flag: "🇵🇱",
    countryCode: "pl",
    slug: "pl",
    randomWordsMode: "Polish500",
    quotesMode: "PolishQuotes",
    nativeName: "Polski",
    htmlLang: "pl",
    measurementMode: "wpm" as const,
    title: "TypeRace.io | Szybkie wyścigi pisania i pomiar WPM",
    description:
      "Ścigaj się z graczami z całego świata w zawodach pisania na żywo. Poprawiaj szybkość pisania.",
  },
  {
    language: Language.Czech,
    flag: "🇨🇿",
    countryCode: "cz",
    slug: "cs",
    randomWordsMode: "Czech500",
    quotesMode: "CzechQuotes",
    nativeName: "Čeština",
    htmlLang: "cs",
    measurementMode: "wpm" as const,
    title: "TypeRace.io | Rychlé závody v psaní a měření WPM",
    description:
      "Závoděte s hráči z celého světa v psaní v reálném čase. Zlepšujte svou rychlost a přesnost psaní.",
  },
  {
    language: Language.Ukrainian,
    flag: "🇺🇦",
    countryCode: "ua",
    slug: "uk",
    randomWordsMode: "Ukrainian500",
    quotesMode: "UkrainianQuotes",
    nativeName: "Українська",
    htmlLang: "uk",
    measurementMode: "wpm" as const,
    title: "TypeRace.io | Динамічні батли з друку та трекер швидкості друку",
    description:
      "Змагайтеся з гравцями з усього світу в змаганнях з друку в реальному часі. Покращуйте швидкість друку.",
  },
  {
    language: Language.Dutch,
    flag: "🇳🇱",
    countryCode: "nl",
    slug: "nl",
    randomWordsMode: "Dutch500",
    quotesMode: "DutchQuotes",
    nativeName: "Nederlands",
    htmlLang: "nl",
    measurementMode: "wpm" as const,
    title: "TypeRace.io | Snelle typegevechten en WPM-tracker",
    description:
      "Race tegen spelers wereldwijd in real-time typwedstrijden. Verbeter je typsnelheid.",
  },
  {
    language: Language.Russian,
    flag: "🇷🇺",
    countryCode: "ru",
    slug: "ru",
    randomWordsMode: "Russian500",
    quotesMode: "RussianQuotes",
    nativeName: "Русский",
    htmlLang: "ru",
    measurementMode: "wpm" as const,
    title: "TypeRace.io | Динамичные гонки печати и трекер скорости",
    description:
      "Соревнуйтесь с игроками со всего мира в гонках печати в реальном времени. Улучшайте скорость и точность набора текста.",
  },
  {
    language: Language.Romanian,
    flag: "🇷🇴",
    countryCode: "ro",
    slug: "ro",
    randomWordsMode: "Romanian500",
    quotesMode: "RomanianQuotes",
    nativeName: "Română",
    htmlLang: "ro",
    measurementMode: "wpm" as const,
    title: "TypeRace.io | Curse rapide de tastare și monitorizare WPM",
    description:
      "Concurează cu jucători din întreaga lume în competiții de tastare în timp real. Îmbunătățește-ți viteza de tastare.",
  },
  {
    language: Language.Swedish,
    flag: "🇸🇪",
    countryCode: "se",
    slug: "sv",
    randomWordsMode: "Swedish500",
    quotesMode: "SwedishQuotes",
    nativeName: "Svenska",
    htmlLang: "sv",
    measurementMode: "wpm" as const,
    title: "TypeRace.io | Snabba skrivdueller och WPM-spårare",
    description:
      "Tävla mot spelare världen över i skrivtävlingar i realtid. Förbättra din skrivhastighet.",
  },
  {
    language: Language.Turkish,
    flag: "🇹🇷",
    countryCode: "tr",
    slug: "tr",
    randomWordsMode: "Turkish500",
    quotesMode: "TurkishQuotes",
    nativeName: "Türkçe",
    htmlLang: "tr",
    measurementMode: "wpm" as const,
    title: "TypeRace.io | Hızlı tempolu yazma düelloları ve WPM takipçisi",
    description:
      "Dünya genelindeki oyuncularla gerçek zamanlı yazma yarışmalarında yarışın. Yazma hızınızı geliştirin.",
  },
].sort((a, b) => a.language.localeCompare(b.language));

export function getLanguageFromMode(modeTag: string): Language {
  const langInfo = languages.find(
    (l) =>
      l.randomWordsMode === modeTag ||
      l.quotesMode === modeTag ||
      WORD_COUNT_BUCKETS.some((count) => modeTag === `${l.language}${count}`),
  );
  return langInfo?.language || Language.English;
}

export function getWordModeTag(
  language: Language,
  wordCount: WordCountBucket,
): string {
  return `${language}${wordCount}`;
}

export function getLanguageFromSlug(slug: string | undefined): LanguageInfo {
  if (!slug) return languages.find((l) => l.language === Language.English)!;
  return (
    languages.find((l) => l.slug === slug) ||
    languages.find((l) => l.language === Language.English)!
  );
}

const LANG_SLUG_KEY = "typerace_lang_slug";

export function storeLangSlug(slug: string): void {
  try {
    localStorage.setItem(LANG_SLUG_KEY, slug);
  } catch {}
}

export function getDefaultSiteTitle(slug?: string): string {
  if (slug !== undefined) {
    return getLanguageFromSlug(slug).title;
  }
  try {
    const storedSlug = localStorage.getItem(LANG_SLUG_KEY) ?? undefined;
    return getLanguageFromSlug(storedSlug).title;
  } catch {}
  return getLanguageFromSlug(undefined).title;
}

export function getLangHome(): string {
  try {
    const slug = localStorage.getItem(LANG_SLUG_KEY);
    if (slug && languages.some((language) => language.slug === slug)) {
      return `/${slug}`;
    }
  } catch {}
  return "/";
}

export function getLangPrefix(): string {
  try {
    const slug = localStorage.getItem(LANG_SLUG_KEY);
    if (slug && languages.some((language) => language.slug === slug)) {
      return `/${slug}`;
    }
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
    "let's go",
    "ready to plunder",
    "systems primed",
    "bring it",
    "oh, it's on",
    "let's do this",
    "it's go time",
    "put me in coach",
    "you're on",
    "lock and load",
    "let's roll",
    "dropping the hammer",
  ],
  [Language.Spanish]: [
    "listos para el combate",
    "sistemas listos",
    "comenzar bombardeo",
    "preparados para despegar",
    "a la carga",
    "la fortuna sonríe a los audaces",
    "que empiece la fiesta",
    "tráiganlos",
  ],
  [Language.French]: [
    "prêts au combat",
    "systèmes opérationnels",
    "commencez le bombardement",
    "parés au décollage",
    "à l'attaque",
    "la fortune sourit aux audacieux",
    "qu'on en finisse",
    "amenez-les",
  ],
  [Language.German]: [
    "kampfbereit",
    "systeme bereit",
    "feuer eröffnen",
    "startklar",
    "auf in die schlacht",
    "das glück ist mit den tapferen",
    "leg los",
    "her mit ihnen",
  ],
  [Language.Italian]: [
    "pronti al combattimento",
    "sistemi attivati",
    "iniziare il bombardamento",
    "pronti al decollo",
    "all'attacco",
    "la fortuna aiuta gli audaci",
    "facciamoli a pezzi",
    "fatti sotto",
  ],
  [Language.Portuguese]: [
    "prontos para o combate",
    "sistemas ativos",
    "iniciar bombardeio",
    "prontos para decolar",
    "ao ataque",
    "a sorte favorece os ousados",
    "vamos acabar com eles",
    "manda ver",
  ],
  [Language.Ukrainian]: [
    "готові до бою",
    "системи активовано",
    "почати обстріл",
    "готові до старту",
    "в атаку",
    "доля прихильна до сміливих",
    "нумо до справи",
    "ведіть їх сюди",
  ],
  [Language.Arabic]: [
    "جاهزون للقتال",
    "الأنظمة جاهزة",
    "ابدأ القصف",
    "مستعدون للانطلاق",
    "إلى الهجوم",
    "الحظ حليف الجريء",
    "هاتوا ما عندكم",
    "في خدمتكم",
  ],
  [Language.Dutch]: [
    "klaar voor de strijd",
    "systemen actief",
    "begin het bombardement",
    "klaar voor vertrek",
    "ten aanval",
    "het geluk is met de dapperen",
    "laat ze maar komen",
    "geef het bevel",
  ],
  [Language.Swedish]: [
    "redo för strid",
    "system aktiva",
    "påbörja bombardemang",
    "klara för start",
    "till attack",
    "lyckan står den djärve bi",
    "kom an då",
    "ge order",
  ],
  [Language.Russian]: [
    "готов к бою",
    "системы готовы",
    "начать гонку",
    "готов к старту",
    "вперёд",
    "удача любит смелых",
    "пусть начнётся игра",
    "жду команды",
  ],
  [Language.Romanian]: [
    "gata de luptă",
    "sistemele sunt pregătite",
    "începe cursa",
    "gata de start",
    "la atac",
    "norocul îi ajută pe cei curajoși",
    "să înceapă jocul",
    "aștept comanda",
  ],
  [Language.Indonesian]: [
    "siap bertanding",
    "sistem siap",
    "mulai balapan",
    "siap berangkat",
    "ayo mulai",
    "keberuntungan berpihak pada yang berani",
    "permainan dimulai",
    "menunggu perintah",
  ],
  [Language.Polish]: [
    "gotowi do wyścigu",
    "systemy gotowe",
    "rozpocznij wyścig",
    "gotowi do startu",
    "do dzieła",
    "szczęście sprzyja odważnym",
    "niech zacznie się gra",
    "czekam na rozkaz",
  ],
  [Language.Czech]: [
    "připraven k závodu",
    "systémy připraveny",
    "zahájit závod",
    "připraven ke startu",
    "do toho",
    "štěstí přeje odvážným",
    "ať hra začne",
    "čekám na povel",
  ],
  [Language.Turkish]: [
    "savaşa hazır",
    "sistemler hazır",
    "bombardımanı başlat",
    "kalkışa hazır",
    "saldırıya",
    "talih cesurdan yanadır",
    "gelsinler bakalım",
    "emrinizdeyim",
  ],
};

export function getMaxPlayerCount(gameTypeTag: string): number {
  switch (gameTypeTag) {
    case "Practice":
      return 1;
    case "Public":
      return 3;
    case "Private":
      return 6;
    default:
      return 3;
  }
}

export function getRandomStartupPhrase(gameModeTag: string): string {
  const language = getLanguageFromMode(gameModeTag);
  const phrases =
    languageStartupPhrases[language] ||
    languageStartupPhrases[Language.English];
  const randomIndex = Math.floor(Math.random() * phrases.length);
  return phrases[randomIndex];
}
