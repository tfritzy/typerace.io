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
    tagline: string;
}

const languagePages: LanguagePage[] = [
    { slug: "es", htmlLang: "es", title: "TypeRace.io | Batallas de mecanografía trepidantes y medidor de PPM", description: "Compite contra jugadores de todo el mundo en carreras de mecanografía en tiempo real. Mejora tu velocidad de escritura.", keywords: "juego de mecanografía, test de mecanografía, velocidad de escritura, mecanografía multijugador, carrera de mecanografía, prueba de velocidad, palabras por minuto", nativeName: "Español", language: "Spanish", flag: "🇪🇸", noscriptHeading: "TypeRace.io | Batallas de mecanografía trepidantes y medidor de PPM", noscriptContent: "Compite en carreras de mecanografía multijugador en tiempo real. Elige entre varios idiomas como inglés, español, francés, alemán, italiano, portugués, ucraniano, árabe, neerlandés, sueco y turco. Practica tu velocidad de escritura en partidas públicas, salas privadas o modo práctica.", jsonLdDescription: "Juego competitivo de mecanografía multijugador donde los jugadores compiten entre sí en carreras de escritura en tiempo real", tagline: "Carreras de mecanografía multijugador" },
    { slug: "fr", htmlLang: "fr", title: "TypeRace.io | Duels de frappe effrénés et suivi MPM", description: "Affrontez des joueurs du monde entier dans des compétitions de frappe en temps réel. Améliorez votre vitesse de frappe.", keywords: "jeu de dactylographie, test de frappe, vitesse de frappe, frappe multijoueur, course de frappe, test de vitesse, mots par minute", nativeName: "Français", language: "French", flag: "🇫🇷", noscriptHeading: "TypeRace.io | Duels de frappe effrénés et suivi MPM", noscriptContent: "Participez à des courses de frappe multijoueurs en temps réel. Choisissez parmi plusieurs langues dont l'anglais, l'espagnol, le français, l'allemand, l'italien, le portugais, l'ukrainien, l'arabe, le néerlandais, le suédois et le turc. Entraînez votre vitesse de frappe en parties publiques, salons privés ou mode entraînement.", jsonLdDescription: "Jeu de frappe compétitif multijoueur où les joueurs s'affrontent dans des courses de frappe en temps réel", tagline: "Courses de dactylographie multijoueur" },
    { slug: "de", htmlLang: "de", title: "TypeRace.io | Rasante Tippduelle und WPM-Tracker", description: "Tritt gegen Spieler weltweit in Echtzeit-Tippwettbewerben an. Verbessere deine Tippgeschwindigkeit.", keywords: "Tippspiel, Tipptest, Tippgeschwindigkeit, Mehrspieler-Tippen, Tippwettbewerb, Schreibgeschwindigkeit, Wörter pro Minute", nativeName: "Deutsch", language: "German", flag: "🇩🇪", noscriptHeading: "TypeRace.io | Rasante Tippduelle und WPM-Tracker", noscriptContent: "Nimm an Echtzeit-Tippwettbewerben im Mehrspielermodus teil. Wähle aus verschiedenen Sprachen wie Englisch, Spanisch, Französisch, Deutsch, Italienisch, Portugiesisch, Ukrainisch, Arabisch, Niederländisch, Schwedisch und Türkisch. Übe deine Tippgeschwindigkeit in öffentlichen Spielen, privaten Lobbys oder im Übungsmodus.", jsonLdDescription: "Kompetitives Mehrspieler-Tippspiel, bei dem Spieler in Echtzeit-Tippwettbewerben gegeneinander antreten", tagline: "Multiplayer-Tippwettbewerbe" },
    { slug: "it", htmlLang: "it", title: "TypeRace.io | Sfide di digitazione ad alto ritmo e tracker PPM", description: "Gareggia contro giocatori di tutto il mondo in competizioni di digitazione in tempo reale. Migliora la tua velocità di battitura.", keywords: "gioco di digitazione, test di digitazione, velocità di battitura, digitazione multiplayer, gara di digitazione, test velocità di battitura, parole al minuto", nativeName: "Italiano", language: "Italian", flag: "🇮🇹", noscriptHeading: "TypeRace.io | Sfide di digitazione ad alto ritmo e tracker PPM", noscriptContent: "Gareggia in gare di digitazione multigiocatore in tempo reale. Scegli tra diverse lingue tra cui inglese, spagnolo, francese, tedesco, italiano, portoghese, ucraino, arabo, olandese, svedese e turco. Allenati nella velocità di battitura in partite pubbliche, lobby private o modalità pratica.", jsonLdDescription: "Gioco competitivo di digitazione multigiocatore in cui i giocatori gareggiano in tempo reale", tagline: "Gare di digitazione multiplayer" },
    { slug: "pt", htmlLang: "pt", title: "TypeRace.io | Batalhas de digitação em ritmo acelerado e rastreador de PPM", description: "Compita contra jogadores de todo o mundo em competições de digitação em tempo real. Melhore sua velocidade de digitação.", keywords: "jogo de digitação, teste de digitação, velocidade de digitação, digitação multijogador, corrida de digitação, teste de velocidade, palavras por minuto", nativeName: "Português", language: "Portuguese", flag: "🇵🇹", noscriptHeading: "TypeRace.io | Batalhas de digitação em ritmo acelerado e rastreador de PPM", noscriptContent: "Participe de corridas de digitação multijogador em tempo real. Escolha entre vários idiomas como inglês, espanhol, francês, alemão, italiano, português, ucraniano, árabe, holandês, sueco e turco. Pratique sua velocidade de digitação em partidas públicas, salas privadas ou modo prática.", jsonLdDescription: "Jogo competitivo de digitação multijogador onde os jogadores competem em corridas de digitação em tempo real", tagline: "Corridas de digitação multijogador" },
    { slug: "uk", htmlLang: "uk", title: "TypeRace.io | Динамічні батли з друку та трекер швидкості друку", description: "Змагайтеся з гравцями з усього світу в змаганнях з друку в реальному часі. Покращуйте швидкість друку.", keywords: "гра на швидкість друку, тест швидкості друку, швидкість друку, багатокористувацький друк, змагання з друку, тренажер друку, слів за хвилину", nativeName: "Українська", language: "Ukrainian", flag: "🇺🇦", noscriptHeading: "TypeRace.io | Динамічні батли з друку та трекер швидкості друку", noscriptContent: "Беріть участь у багатокористувацьких змаганнях з друку в реальному часі. Обирайте з різних мов, включаючи англійську, іспанську, французьку, німецьку, італійську, португальську, українську, арабську, нідерландську, шведську та турецьку. Тренуйте швидкість друку в публічних матчах, приватних лобі або режимі тренування.", jsonLdDescription: "Багатокористувацька змагальна гра з друку, де гравці змагаються в реальному часі", tagline: "Багатокористувацькі змагання з друку" },
    { slug: "nl", htmlLang: "nl", title: "TypeRace.io | Snelle typegevechten en WPM-tracker", description: "Race tegen spelers wereldwijd in real-time typwedstrijden. Verbeter je typsnelheid.", keywords: "typspel, typtest, typsnelheid, multiplayer typen, typwedstrijd, typsnelheidstest, woorden per minuut", nativeName: "Nederlands", language: "Dutch", flag: "🇳🇱", noscriptHeading: "TypeRace.io | Snelle typegevechten en WPM-tracker", noscriptContent: "Neem deel aan real-time multiplayer typwedstrijden. Kies uit meerdere talen waaronder Engels, Spaans, Frans, Duits, Italiaans, Portugees, Oekraïens, Arabisch, Nederlands, Zweeds en Turks. Oefen je typsnelheid in openbare wedstrijden, privélobby's of oefenmodus.", jsonLdDescription: "Competitief multiplayer typspel waarbij spelers in real-time typwedstrijden tegen elkaar racen", tagline: "Multiplayer typwedstrijden" },
    { slug: "ru", htmlLang: "ru", title: "TypeRace.io | Динамичные гонки печати и трекер скорости", description: "Соревнуйтесь с игроками со всего мира в гонках печати в реальном времени. Улучшайте скорость и точность набора текста.", keywords: "игра на скорость печати, тест скорости печати, скорость набора, многопользовательская печать, гонка печати, тренажер печати, слов в минуту", nativeName: "Русский", language: "Russian", flag: "🇷🇺", noscriptHeading: "TypeRace.io | Динамичные гонки печати и трекер скорости", noscriptContent: "Участвуйте в многопользовательских гонках печати в реальном времени. Тренируйте скорость набора в публичных матчах, приватных лобби или режиме тренировки, используя случайные русские слова и цитаты.", jsonLdDescription: "Многопользовательская соревновательная игра, в которой игроки участвуют в гонках печати в реальном времени", tagline: "Многопользовательские гонки печати" },
    { slug: "sv", htmlLang: "sv", title: "TypeRace.io | Snabba skrivdueller och WPM-spårare", description: "Tävla mot spelare världen över i skrivtävlingar i realtid. Förbättra din skrivhastighet.", keywords: "skrivspel, skrivtest, skrivhastighet, multiplayer-skrivning, skrivtävling, skriv snabbare, ord per minut", nativeName: "Svenska", language: "Swedish", flag: "🇸🇪", noscriptHeading: "TypeRace.io | Snabba skrivdueller och WPM-spårare", noscriptContent: "Delta i skrivtävlingar i realtid med flera spelare. Välj bland flera språk inklusive engelska, spanska, franska, tyska, italienska, portugisiska, ukrainska, arabiska, nederländska, svenska och turkiska. Öva din skrivhastighet i offentliga matcher, privata lobbyer eller övningsläge.", jsonLdDescription: "Kompetitivt skrivspel för flera spelare där spelarna tävlar mot varandra i skrivtävlingar i realtid", tagline: "Multiplayer-skrivtävlingar" },
    { slug: "tr", htmlLang: "tr", title: "TypeRace.io | Hızlı tempolu yazma düelloları ve WPM takipçisi", description: "Dünya genelindeki oyuncularla gerçek zamanlı yazma yarışmalarında yarışın. Yazma hızınızı geliştirin.", keywords: "yazma oyunu, yazma testi, yazma hızı, çok oyunculu yazma, yazma yarışı, hız testi, dakikada kelime", nativeName: "Türkçe", language: "Turkish", flag: "🇹🇷", noscriptHeading: "TypeRace.io | Hızlı tempolu yazma düelloları ve WPM takipçisi", noscriptContent: "Gerçek zamanlı çok oyunculu yazma yarışlarına katılın. İngilizce, İspanyolca, Fransızca, Almanca, İtalyanca, Portekizce, Ukraynaca, Arapça, Felemenkçe, İsveççe ve Türkçe dahil olmak üzere birçok dil arasından seçim yapın. Açık maçlarda, özel lobilerde veya alıştırma modunda yazma hızınızı geliştirin.", jsonLdDescription: "Oyuncuların gerçek zamanlı yazma yarışmalarında birbirleriyle yarıştığı çok oyunculu rekabetçi yazma oyunu", tagline: "Çok oyunculu yazma yarışları" },
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
        /<h1 class="sr-only">.*?<\/h1>/,
        `<h1 class="sr-only">${lang.tagline}</h1>`
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
