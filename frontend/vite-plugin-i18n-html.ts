import { type Plugin } from 'vite';
import * as fs from 'fs';
import * as path from 'path';

interface LanguagePage {
    slug: string;
    htmlLang: string;
    title: string;
    description: string;
    keywords: string;
    nativeName: string;
    language: string;
    flag: string;
    noscriptHeading: string;
    noscriptContent: string;
    jsonLdDescription: string;
}

const languagePages: LanguagePage[] = [
    { slug: "es", htmlLang: "es", title: "TypeRace.io - Carrera de mecanografía", description: "Compite contra jugadores de todo el mundo en carreras de mecanografía en tiempo real. Mejora tu velocidad de escritura.", keywords: "juego de mecanografía, test de mecanografía, velocidad de escritura, mecanografía multijugador, carrera de mecanografía, prueba de velocidad, palabras por minuto", nativeName: "Español", language: "Spanish", flag: "🇪🇸", noscriptHeading: "typerace.io - Mecanografía PvP", noscriptContent: "Compite en carreras de mecanografía multijugador en tiempo real. Elige entre varios idiomas como inglés, español, francés, alemán, italiano, portugués, japonés, coreano, chino, ucraniano, árabe, hindi, neerlandés, sueco y turco. Practica tu velocidad de escritura en partidas públicas, salas privadas o modo práctica.", jsonLdDescription: "Juego competitivo de mecanografía multijugador donde los jugadores compiten entre sí en carreras de escritura en tiempo real" },
    { slug: "fr", htmlLang: "fr", title: "TypeRace.io - Course de dactylographie", description: "Affrontez des joueurs du monde entier dans des compétitions de frappe en temps réel. Améliorez votre vitesse de frappe.", keywords: "jeu de dactylographie, test de frappe, vitesse de frappe, frappe multijoueur, course de frappe, test de vitesse, mots par minute", nativeName: "Français", language: "French", flag: "🇫🇷", noscriptHeading: "typerace.io - Frappe PvP", noscriptContent: "Participez à des courses de frappe multijoueurs en temps réel. Choisissez parmi plusieurs langues dont l'anglais, l'espagnol, le français, l'allemand, l'italien, le portugais, le japonais, le coréen, le chinois, l'ukrainien, l'arabe, l'hindi, le néerlandais, le suédois et le turc. Entraînez votre vitesse de frappe en parties publiques, salons privés ou mode entraînement.", jsonLdDescription: "Jeu de frappe compétitif multijoueur où les joueurs s'affrontent dans des courses de frappe en temps réel" },
    { slug: "de", htmlLang: "de", title: "TypeRace.io - Tippwettbewerb", description: "Tritt gegen Spieler weltweit in Echtzeit-Tippwettbewerben an. Verbessere deine Tippgeschwindigkeit.", keywords: "Tippspiel, Tipptest, Tippgeschwindigkeit, Mehrspieler-Tippen, Tippwettbewerb, Schreibgeschwindigkeit, Wörter pro Minute", nativeName: "Deutsch", language: "German", flag: "🇩🇪", noscriptHeading: "typerace.io - PvP-Tippen", noscriptContent: "Nimm an Echtzeit-Tippwettbewerben im Mehrspielermodus teil. Wähle aus verschiedenen Sprachen wie Englisch, Spanisch, Französisch, Deutsch, Italienisch, Portugiesisch, Japanisch, Koreanisch, Chinesisch, Ukrainisch, Arabisch, Hindi, Niederländisch, Schwedisch und Türkisch. Übe deine Tippgeschwindigkeit in öffentlichen Spielen, privaten Lobbys oder im Übungsmodus.", jsonLdDescription: "Kompetitives Mehrspieler-Tippspiel, bei dem Spieler in Echtzeit-Tippwettbewerben gegeneinander antreten" },
    { slug: "it", htmlLang: "it", title: "TypeRace.io - Gara di digitazione", description: "Gareggia contro giocatori di tutto il mondo in competizioni di digitazione in tempo reale. Migliora la tua velocità di battitura.", keywords: "gioco di digitazione, test di digitazione, velocità di battitura, digitazione multiplayer, gara di digitazione, test velocità di battitura, parole al minuto", nativeName: "Italiano", language: "Italian", flag: "🇮🇹", noscriptHeading: "typerace.io - Digitazione PvP", noscriptContent: "Gareggia in gare di digitazione multigiocatore in tempo reale. Scegli tra diverse lingue tra cui inglese, spagnolo, francese, tedesco, italiano, portoghese, giapponese, coreano, cinese, ucraino, arabo, hindi, olandese, svedese e turco. Allenati nella velocità di battitura in partite pubbliche, lobby private o modalità pratica.", jsonLdDescription: "Gioco competitivo di digitazione multigiocatore in cui i giocatori gareggiano in tempo reale" },
    { slug: "pt", htmlLang: "pt", title: "TypeRace.io - Corrida de digitação", description: "Compita contra jogadores de todo o mundo em competições de digitação em tempo real. Melhore sua velocidade de digitação.", keywords: "jogo de digitação, teste de digitação, velocidade de digitação, digitação multijogador, corrida de digitação, teste de velocidade, palavras por minuto", nativeName: "Português", language: "Portuguese", flag: "🇵🇹", noscriptHeading: "typerace.io - Digitação PvP", noscriptContent: "Participe de corridas de digitação multijogador em tempo real. Escolha entre vários idiomas como inglês, espanhol, francês, alemão, italiano, português, japonês, coreano, chinês, ucraniano, árabe, hindi, holandês, sueco e turco. Pratique sua velocidade de digitação em partidas públicas, salas privadas ou modo prática.", jsonLdDescription: "Jogo competitivo de digitação multijogador onde os jogadores competem em corridas de digitação em tempo real" },
    { slug: "ja", htmlLang: "ja", title: "TypeRace.io - タイピングレース", description: "世界中のプレイヤーとリアルタイムのタイピング競争で対戦しましょう。タイピング速度を向上させましょう。", keywords: "タイピングゲーム, タイピング練習, タイピング速度, タイピングテスト, タイピングレース, 早打ち, タイピング対戦", nativeName: "日本語", language: "Japanese", flag: "🇯🇵", noscriptHeading: "typerace.io - PvPタイピング", noscriptContent: "リアルタイムのマルチプレイヤータイピングレースに参加しましょう。英語、スペイン語、フランス語、ドイツ語、イタリア語、ポルトガル語、日本語、韓国語、中国語、ウクライナ語、アラビア語、ヒンディー語、オランダ語、スウェーデン語、トルコ語など、複数の言語から選べます。パブリックマッチ、プライベートロビー、練習モードでタイピング速度を鍛えましょう。", jsonLdDescription: "プレイヤーがリアルタイムのタイピング競争で対戦するマルチプレイヤー対戦タイピングゲーム" },
    { slug: "ko", htmlLang: "ko", title: "TypeRace.io - 타이핑 레이스", description: "전 세계 플레이어와 실시간 타이핑 대회에서 경쟁하세요. 타이핑 속도를 향상시키세요.", keywords: "타이핑 게임, 타자 연습, 타이핑 속도, 타이핑 테스트, 타자 시합, 타자 속도 측정, 분당 타수", nativeName: "한국어", language: "Korean", flag: "🇰🇷", noscriptHeading: "typerace.io - PvP 타이핑", noscriptContent: "실시간 멀티플레이어 타이핑 레이스에 참여하세요. 영어, 스페인어, 프랑스어, 독일어, 이탈리아어, 포르투갈어, 일본어, 한국어, 중국어, 우크라이나어, 아랍어, 힌디어, 네덜란드어, 스웨덴어, 터키어 등 다양한 언어를 선택할 수 있습니다. 공개 매치, 비공개 로비, 연습 모드에서 타이핑 속도를 연습하세요.", jsonLdDescription: "플레이어가 실시간 타이핑 대회에서 경쟁하는 멀티플레이어 경쟁 타이핑 게임" },
    { slug: "zh", htmlLang: "zh", title: "TypeRace.io - 打字竞赛", description: "与全球玩家进行实时打字比赛。提高你的打字速度。", keywords: "打字游戏, 打字测试, 打字速度, 多人打字, 打字比赛, 打字练习, 每分钟字数", nativeName: "中文", language: "Chinese", flag: "🇨🇳", noscriptHeading: "typerace.io - PvP打字", noscriptContent: "参加实时多人打字竞赛。可选择多种语言，包括英语、西班牙语、法语、德语、意大利语、葡萄牙语、日语、韩语、中文、乌克兰语、阿拉伯语、印地语、荷兰语、瑞典语和土耳其语。在公开比赛、私人房间或练习模式中练习打字速度。", jsonLdDescription: "多人竞技打字游戏，玩家在实时打字比赛中相互竞争" },
    { slug: "uk", htmlLang: "uk", title: "TypeRace.io - Змагання з друку", description: "Змагайтеся з гравцями з усього світу в змаганнях з друку в реальному часі. Покращуйте швидкість друку.", keywords: "гра на швидкість друку, тест швидкості друку, швидкість друку, багатокористувацький друк, змагання з друку, тренажер друку, слів за хвилину", nativeName: "Українська", language: "Ukrainian", flag: "🇺🇦", noscriptHeading: "typerace.io - PvP друк", noscriptContent: "Беріть участь у багатокористувацьких змаганнях з друку в реальному часі. Обирайте з різних мов, включаючи англійську, іспанську, французьку, німецьку, італійську, португальську, японську, корейську, китайську, українську, арабську, гінді, нідерландську, шведську та турецьку. Тренуйте швидкість друку в публічних матчах, приватних лобі або режимі тренування.", jsonLdDescription: "Багатокористувацька змагальна гра з друку, де гравці змагаються в реальному часі" },
    { slug: "hi", htmlLang: "hi", title: "TypeRace.io - टाइपिंग रेस", description: "वास्तविक समय में टाइपिंग प्रतियोगिताओं में दुनिया भर के खिलाड़ियों के खिलाफ प्रतिस्पर्धा करें। अपनी टाइपिंग गति में सुधार करें।", keywords: "टाइपिंग गेम, टाइपिंग टेस्ट, टाइपिंग स्पीड, मल्टीप्लेयर टाइपिंग, टाइपिंग रेस, टाइपिंग प्रैक्टिस, प्रति मिनट शब्द", nativeName: "हिन्दी", language: "Hindi", flag: "🇮🇳", noscriptHeading: "typerace.io - PvP टाइपिंग", noscriptContent: "रीयल-टाइम मल्टीप्लेयर टाइपिंग रेस में भाग लें। अंग्रेज़ी, स्पेनिश, फ़्रेंच, जर्मन, इतालवी, पुर्तगाली, जापानी, कोरियाई, चीनी, यूक्रेनी, अरबी, हिन्दी, डच, स्वीडिश और तुर्की सहित कई भाषाओं में से चुनें। सार्वजनिक मैच, निजी लॉबी या अभ्यास मोड में अपनी टाइपिंग गति का अभ्यास करें।", jsonLdDescription: "मल्टीप्लेयर प्रतिस्पर्धी टाइपिंग गेम जहाँ खिलाड़ी रीयल-टाइम टाइपिंग प्रतियोगिताओं में प्रतिस्पर्धा करते हैं" },
    { slug: "nl", htmlLang: "nl", title: "TypeRace.io - Typwedstrijd", description: "Race tegen spelers wereldwijd in real-time typwedstrijden. Verbeter je typsnelheid.", keywords: "typspel, typtest, typsnelheid, multiplayer typen, typwedstrijd, typsnelheidstest, woorden per minuut", nativeName: "Nederlands", language: "Dutch", flag: "🇳🇱", noscriptHeading: "typerace.io - PvP typen", noscriptContent: "Neem deel aan real-time multiplayer typwedstrijden. Kies uit meerdere talen waaronder Engels, Spaans, Frans, Duits, Italiaans, Portugees, Japans, Koreaans, Chinees, Oekraïens, Arabisch, Hindi, Nederlands, Zweeds en Turks. Oefen je typsnelheid in openbare wedstrijden, privélobby's of oefenmodus.", jsonLdDescription: "Competitief multiplayer typspel waarbij spelers in real-time typwedstrijden tegen elkaar racen" },
    { slug: "sv", htmlLang: "sv", title: "TypeRace.io - Skrivtävling", description: "Tävla mot spelare världen över i skrivtävlingar i realtid. Förbättra din skrivhastighet.", keywords: "skrivspel, skrivtest, skrivhastighet, multiplayer-skrivning, skrivtävling, skriv snabbare, ord per minut", nativeName: "Svenska", language: "Swedish", flag: "🇸🇪", noscriptHeading: "typerace.io - PvP-skrivning", noscriptContent: "Delta i skrivtävlingar i realtid med flera spelare. Välj bland flera språk inklusive engelska, spanska, franska, tyska, italienska, portugisiska, japanska, koreanska, kinesiska, ukrainska, arabiska, hindi, nederländska, svenska och turkiska. Öva din skrivhastighet i offentliga matcher, privata lobbyer eller övningsläge.", jsonLdDescription: "Kompetitivt skrivspel för flera spelare där spelarna tävlar mot varandra i skrivtävlingar i realtid" },
    { slug: "tr", htmlLang: "tr", title: "TypeRace.io - Yazma yarışı", description: "Dünya genelindeki oyuncularla gerçek zamanlı yazma yarışmalarında yarışın. Yazma hızınızı geliştirin.", keywords: "yazma oyunu, yazma testi, yazma hızı, çok oyunculu yazma, yazma yarışı, hız testi, dakikada kelime", nativeName: "Türkçe", language: "Turkish", flag: "🇹🇷", noscriptHeading: "typerace.io - PvP Yazma", noscriptContent: "Gerçek zamanlı çok oyunculu yazma yarışlarına katılın. İngilizce, İspanyolca, Fransızca, Almanca, İtalyanca, Portekizce, Japonca, Korece, Çince, Ukraynaca, Arapça, Hintçe, Felemenkçe, İsveççe ve Türkçe dahil olmak üzere birçok dil arasından seçim yapın. Açık maçlarda, özel lobilerde veya alıştırma modunda yazma hızınızı geliştirin.", jsonLdDescription: "Oyuncuların gerçek zamanlı yazma yarışmalarında birbirleriyle yarıştığı çok oyunculu rekabetçi yazma oyunu" },
];

function buildHreflangTags(): string {
    const tags = [`    <link rel="alternate" hreflang="en" href="https://typerace.io/" />`];
    for (const lang of languagePages) {
        tags.push(`    <link rel="alternate" hreflang="${lang.htmlLang}" href="https://typerace.io/${lang.slug}/" />`);
    }
    tags.push(`    <link rel="alternate" hreflang="x-default" href="https://typerace.io/" />`);
    return tags.join('\n');
}

function generateLanguageHtml(baseHtml: string, lang: LanguagePage): string {
    const hreflangTags = buildHreflangTags();

    let html = baseHtml;

    html = html.replace('<html lang="en">', `<html lang="${lang.htmlLang}">`);

    html = html.replace(
        /<title>.*?<\/title>/,
        `<title>${lang.title}</title>`
    );
    html = html.replace(
        /<meta name="description" content=".*?" \/>/,
        `<meta name="description" content="${lang.description}" />`
    );
    html = html.replace(
        /<meta name="keywords" content=".*?" \/>/,
        `<meta name="keywords" content="${lang.keywords}" />`
    );

    html = html.replace(
        /<meta property="og:url" content=".*?" \/>/,
        `<meta property="og:url" content="https://typerace.io/${lang.slug}/" />`
    );
    html = html.replace(
        /<meta property="og:title" content=".*?" \/>/,
        `<meta property="og:title" content="${lang.title}" />`
    );
    html = html.replace(
        /<meta property="og:description" content=".*?" \/>/,
        `<meta property="og:description" content="${lang.description}" />`
    );

    html = html.replace(
        /<meta property="twitter:url" content=".*?" \/>/,
        `<meta property="twitter:url" content="https://typerace.io/${lang.slug}/" />`
    );
    html = html.replace(
        /<meta property="twitter:title" content=".*?" \/>/,
        `<meta property="twitter:title" content="${lang.title}" />`
    );
    html = html.replace(
        /<meta property="twitter:description" content=".*?" \/>/,
        `<meta property="twitter:description" content="${lang.description}" />`
    );

    html = html.replace(
        /"url": "https:\/\/typerace\.io"/,
        `"url": "https://typerace.io/${lang.slug}"`
    );

    html = html.replace(
        /"description": "Multiplayer competitive typing game where players race against each other in real-time typing competitions"/,
        `"description": "${lang.jsonLdDescription}"`
    );

    html = html.replace(
        /<noscript>\s*<h1>.*?<\/h1>\s*<p>\s*[\s\S]*?<\/p>\s*<\/noscript>/,
        `<noscript>\n      <h1>${lang.noscriptHeading}</h1>\n      <p>\n        ${lang.noscriptContent}\n      </p>\n    </noscript>`
    );

    html = html.replace(
        /(<meta name="viewport".*?\/>)/,
        `$1\n    <link rel="canonical" href="https://typerace.io/${lang.slug}/" />\n${hreflangTags}`
    );

    return html;
}

function addHreflangToBase(baseHtml: string): string {
    const hreflangTags = buildHreflangTags();

    return baseHtml.replace(
        /(<meta name="viewport".*?\/>)/,
        `$1\n    <link rel="canonical" href="https://typerace.io/" />\n${hreflangTags}`
    );
}

export default function i18nHtmlPlugin(): Plugin {
    let originalHtml: string;

    return {
        name: 'i18n-html',
        transformIndexHtml: {
            order: 'pre',
            handler(html) {
                originalHtml = html;
                return addHreflangToBase(html);
            },
        },
        closeBundle() {
            const distDir = path.resolve(__dirname, 'dist');
            const baseHtmlPath = path.join(distDir, 'index.html');

            if (!fs.existsSync(baseHtmlPath)) return;

            const builtBaseHtml = fs.readFileSync(baseHtmlPath, 'utf-8');

            for (const lang of languagePages) {
                const langDir = path.join(distDir, lang.slug);
                fs.mkdirSync(langDir, { recursive: true });

                const langHtml = generateLanguageHtml(originalHtml || builtBaseHtml, lang);
                const finalHtml = langHtml.replace(
                    /(<script type="module".*?src=")\/src\/main\.tsx(".*?<\/script>)/,
                    (_match, prefix, suffix) => {
                        const scriptTag = builtBaseHtml.match(/<script type="module"[^>]*src="([^"]*)"[^>]*><\/script>/);
                        return scriptTag ? `<script type="module" crossorigin src="${scriptTag[1]}"></script>` : `${prefix}/src/main.tsx${suffix}`;
                    }
                );
                const withCss = (() => {
                    const cssLink = builtBaseHtml.match(/<link rel="stylesheet" crossorigin href="([^"]*)">/);
                    if (cssLink && !finalHtml.includes(cssLink[1])) {
                        return finalHtml.replace('</head>', `  <link rel="stylesheet" crossorigin href="${cssLink[1]}">\n  </head>`);
                    }
                    return finalHtml;
                })();
                fs.writeFileSync(path.join(langDir, 'index.html'), withCss);
            }
        },
    };
}
