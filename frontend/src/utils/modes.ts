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
    "glhf",
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
    "glhf",
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
    "glhf",
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
    "glhf",
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
    "glhf",
    "prontos para o combate",
    "sistemas ativos",
    "iniciar bombardeio",
    "prontos para decolar",
    "ao ataque",
    "a sorte favorece os ousados",
    "vamos acabar com eles",
    "manda ver",
  ],
  [Language.Japanese]: [
    "glhf",
    "戦闘準備完了",
    "システム稼働",
    "砲撃開始",
    "発進準備よし",
    "突撃",
    "幸運は勇者に味方する",
    "かかってこい",
    "任せろ",
  ],
  [Language.Korean]: [
    "glhf",
    "전투 준비 완료",
    "시스템 가동",
    "포격 개시",
    "출격 준비 완료",
    "돌격",
    "행운은 용감한 자의 편",
    "덤벼라",
    "명령만 내려라",
  ],
  [Language.Chinese]: [
    "glhf",
    "战斗准备完毕",
    "系统就绪",
    "开始炮击",
    "准备出击",
    "发起进攻",
    "天助勇者",
    "放马过来",
    "听候命令",
  ],
  [Language.Ukrainian]: [
    "glhf",
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
    "glhf",
    "جاهزون للقتال",
    "الأنظمة جاهزة",
    "ابدأ القصف",
    "مستعدون للانطلاق",
    "إلى الهجوم",
    "الحظ حليف الجريء",
    "هاتوا ما عندكم",
    "في خدمتكم",
  ],
  [Language.Hindi]: [
    "glhf",
    "युद्ध के लिए तैयार",
    "तंत्र सक्रिय",
    "गोलाबारी शुरू",
    "उड़ान भरने को तैयार",
    "हमला बोलो",
    "साहसी का साथ देती है किस्मत",
    "आ जाओ सामने",
    "आदेश दीजिए",
  ],
  [Language.Dutch]: [
    "glhf",
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
    "glhf",
    "redo för strid",
    "system aktiva",
    "påbörja bombardemang",
    "klara för start",
    "till attack",
    "lyckan står den djärve bi",
    "kom an då",
    "ge order",
  ],
  [Language.Turkish]: [
    "glhf",
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
