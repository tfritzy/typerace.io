import { type Plugin } from 'vite';
import * as fs from 'fs';
import * as path from 'path';

interface LanguagePage {
    slug: string;
    htmlLang: string;
    title: string;
    description: string;
    shareDescription: string;
    keywords: string;
    nativeName: string;
    language: string;
    flag: string;
    noscriptHeading: string;
    noscriptContent: string;
    tagline: string;
}

const languagePages: LanguagePage[] = [
    { slug: "es", htmlLang: "es", title: "TypeRace.io | Una plataforma moderna y auténtica de carreras de mecanografía", description: "Compite contra tus amigos y otros jugadores de todo el mundo en competiciones de mecanografía en tiempo real.", shareDescription: "Carreras de mecanografía contra amigos y rivales", keywords: "juego de mecanografía, test de mecanografía, velocidad de escritura, mecanografía multijugador, carrera de mecanografía, prueba de velocidad, palabras por minuto", nativeName: "Español", language: "Spanish", flag: "🇪🇸", noscriptHeading: "TypeRace.io | Una plataforma moderna y auténtica de carreras de mecanografía", noscriptContent: "Compite en carreras de mecanografía multijugador en tiempo real. Elige entre varios idiomas como inglés, español, francés, alemán, italiano, portugués, ucraniano, árabe, neerlandés, sueco y turco. Practica tu velocidad de escritura en partidas públicas, salas privadas o modo práctica.", tagline: "Carreras de mecanografía multijugador" },
    { slug: "fr", htmlLang: "fr", title: "TypeRace.io | Une véritable plateforme moderne de course de frappe", description: "Affrontez vos amis et d’autres joueurs du monde entier dans des compétitions de frappe en temps réel.", shareDescription: "Courses de frappe entre amis et rivaux", keywords: "jeu de dactylographie, test de frappe, vitesse de frappe, frappe multijoueur, course de frappe, test de vitesse, mots par minute", nativeName: "Français", language: "French", flag: "🇫🇷", noscriptHeading: "TypeRace.io | Une véritable plateforme moderne de course de frappe", noscriptContent: "Participez à des courses de frappe multijoueurs en temps réel. Choisissez parmi plusieurs langues dont l'anglais, l'espagnol, le français, l'allemand, l'italien, le portugais, l'ukrainien, l'arabe, le néerlandais, le suédois et le turc. Entraînez votre vitesse de frappe en parties publiques, salons privés ou mode entraînement.", tagline: "Courses de dactylographie multijoueur" },
    { slug: "de", htmlLang: "de", title: "TypeRace.io | Eine echte, moderne Plattform für Tipprennen", description: "Tritt in Echtzeit-Tippwettbewerben gegen Freunde und andere Spieler aus aller Welt an.", shareDescription: "Tipprennen gegen Freunde und Rivalen", keywords: "Tippspiel, Tipptest, Tippgeschwindigkeit, Mehrspieler-Tippen, Tippwettbewerb, Schreibgeschwindigkeit, Wörter pro Minute", nativeName: "Deutsch", language: "German", flag: "🇩🇪", noscriptHeading: "TypeRace.io | Eine echte, moderne Plattform für Tipprennen", noscriptContent: "Nimm an Echtzeit-Tippwettbewerben im Mehrspielermodus teil. Wähle aus verschiedenen Sprachen wie Englisch, Spanisch, Französisch, Deutsch, Italienisch, Portugiesisch, Ukrainisch, Arabisch, Niederländisch, Schwedisch und Türkisch. Übe deine Tippgeschwindigkeit in öffentlichen Spielen, privaten Lobbys oder im Übungsmodus.", tagline: "Multiplayer-Tippwettbewerbe" },
    { slug: "it", htmlLang: "it", title: "TypeRace.io | Una vera e moderna piattaforma per gare di battitura", description: "Sfida i tuoi amici e altri giocatori da tutto il mondo in gare di battitura in tempo reale.", shareDescription: "Gare di battitura contro amici e avversari", keywords: "gioco di digitazione, test di digitazione, velocità di battitura, digitazione multiplayer, gara di digitazione, test velocità di battitura, parole al minuto", nativeName: "Italiano", language: "Italian", flag: "🇮🇹", noscriptHeading: "TypeRace.io | Una vera e moderna piattaforma per gare di battitura", noscriptContent: "Gareggia in gare di digitazione multigiocatore in tempo reale. Scegli tra diverse lingue tra cui inglese, spagnolo, francese, tedesco, italiano, portoghese, ucraino, arabo, olandese, svedese e turco. Allenati nella velocità di battitura in partite pubbliche, lobby private o modalità pratica.", tagline: "Gare di digitazione multiplayer" },
    { slug: "pt", htmlLang: "pt", title: "TypeRace.io | Uma plataforma real e moderna de corridas de digitação", description: "Compita contra seus amigos e outros jogadores do mundo todo em competições de digitação em tempo real.", shareDescription: "Corridas de digitação contra amigos e adversários", keywords: "jogo de digitação, teste de digitação, velocidade de digitação, digitação multijogador, corrida de digitação, teste de velocidade, palavras por minuto", nativeName: "Português", language: "Portuguese", flag: "🇵🇹", noscriptHeading: "TypeRace.io | Uma plataforma real e moderna de corridas de digitação", noscriptContent: "Participe de corridas de digitação multijogador em tempo real. Escolha entre vários idiomas como inglês, espanhol, francês, alemão, italiano, português, ucraniano, árabe, holandês, sueco e turco. Pratique sua velocidade de digitação em partidas públicas, salas privadas ou modo prática.", tagline: "Corridas de digitação multijogador" },
    { slug: "uk", htmlLang: "uk", title: "TypeRace.io | Справжня сучасна платформа для перегонів із набору тексту", description: "Змагайтеся з друзями та іншими гравцями з усього світу в турнірах зі швидкісного набору тексту в реальному часі.", shareDescription: "Перегони з набору тексту проти друзів і суперників", keywords: "гра на швидкість друку, тест швидкості друку, швидкість друку, багатокористувацький друк, змагання з друку, тренажер друку, слів за хвилину", nativeName: "Українська", language: "Ukrainian", flag: "🇺🇦", noscriptHeading: "TypeRace.io | Справжня сучасна платформа для перегонів із набору тексту", noscriptContent: "Беріть участь у багатокористувацьких змаганнях з друку в реальному часі. Обирайте з різних мов, включаючи англійську, іспанську, французьку, німецьку, італійську, португальську, українську, арабську, нідерландську, шведську та турецьку. Тренуйте швидкість друку в публічних матчах, приватних лобі або режимі тренування.", tagline: "Багатокористувацькі змагання з друку" },
    { slug: "nl", htmlLang: "nl", title: "TypeRace.io | Een echt, modern platform voor typeraces", description: "Neem het in realtime typewedstrijden op tegen vrienden en andere spelers van over de hele wereld.", shareDescription: "Typewedstrijden tegen vrienden en rivalen", keywords: "typspel, typtest, typsnelheid, multiplayer typen, typwedstrijd, typsnelheidstest, woorden per minuut", nativeName: "Nederlands", language: "Dutch", flag: "🇳🇱", noscriptHeading: "TypeRace.io | Een echt, modern platform voor typeraces", noscriptContent: "Neem deel aan real-time multiplayer typwedstrijden. Kies uit meerdere talen waaronder Engels, Spaans, Frans, Duits, Italiaans, Portugees, Oekraïens, Arabisch, Nederlands, Zweeds en Turks. Oefen je typsnelheid in openbare wedstrijden, privélobby's of oefenmodus.", tagline: "Multiplayer typwedstrijden" },
    { slug: "ru", htmlLang: "ru", title: "TypeRace.io | Настоящая современная платформа для гонок на скорость набора текста", description: "Соревнуйтесь с друзьями и другими игроками со всего мира в гонках на скорость печати в реальном времени.", shareDescription: "Гонки на скорость печати с друзьями и соперниками", keywords: "игра на скорость печати, тест скорости печати, скорость набора, многопользовательская печать, гонка печати, тренажер печати, слов в минуту", nativeName: "Русский", language: "Russian", flag: "🇷🇺", noscriptHeading: "TypeRace.io | Настоящая современная платформа для гонок на скорость набора текста", noscriptContent: "Участвуйте в многопользовательских гонках печати в реальном времени. Тренируйте скорость набора в публичных матчах, приватных лобби или режиме тренировки, используя случайные русские слова и цитаты.", tagline: "Многопользовательские гонки печати" },
    { slug: "ro", htmlLang: "ro", title: "TypeRace.io | O platformă reală și modernă pentru curse de tastare", description: "Concurează cu prietenii și cu alți jucători din întreaga lume în competiții de tastare în timp real.", shareDescription: "Curse de tastare împotriva prietenilor și rivalilor", keywords: "joc de tastare, test de tastare, viteză de tastare, tastare multiplayer, cursă de tastare, test de viteză, cuvinte pe minut", nativeName: "Română", language: "Romanian", flag: "🇷🇴", noscriptHeading: "TypeRace.io | O platformă reală și modernă pentru curse de tastare", noscriptContent: "Participă la curse de tastare multiplayer în timp real. Exersează-ți viteza în meciuri publice, camere private sau modul de antrenament, folosind cuvinte și citate în limba română.", tagline: "Curse de tastare multiplayer" },
    { slug: "id", htmlLang: "id", title: "TypeRace.io | Platform balap mengetik modern yang sesungguhnya", description: "Berlomba melawan teman dan pemain lain dari seluruh dunia dalam kompetisi mengetik waktu nyata.", shareDescription: "Balapan mengetik melawan teman dan lawan", keywords: "permainan mengetik, tes mengetik, kecepatan mengetik, mengetik multipemain, balapan mengetik, tes kecepatan, kata per menit", nativeName: "Bahasa Indonesia", language: "Indonesian", flag: "🇮🇩", noscriptHeading: "TypeRace.io | Platform balap mengetik modern yang sesungguhnya", noscriptContent: "Ikuti balapan mengetik multipemain waktu nyata. Latih kecepatan Anda dalam pertandingan publik, ruang pribadi, atau mode latihan dengan kata dan kutipan bahasa Indonesia.", tagline: "Balapan mengetik multipemain" },
    { slug: "pl", htmlLang: "pl", title: "TypeRace.io | Prawdziwa, nowoczesna platforma do wyścigów w pisaniu na klawiaturze", description: "Rywalizuj ze znajomymi i innymi graczami z całego świata w konkursach szybkiego pisania rozgrywanych w czasie rzeczywistym.", shareDescription: "Wyścigi w pisaniu ze znajomymi i rywalami", keywords: "gra w pisanie, test pisania, szybkość pisania, pisanie wieloosobowe, wyścig pisania, test szybkości, słowa na minutę", nativeName: "Polski", language: "Polish", flag: "🇵🇱", noscriptHeading: "TypeRace.io | Prawdziwa, nowoczesna platforma do wyścigów w pisaniu na klawiaturze", noscriptContent: "Bierz udział w wieloosobowych wyścigach pisania na żywo. Ćwicz szybkość w meczach publicznych, prywatnych pokojach lub trybie treningowym, używając polskich słów i cytatów.", tagline: "Wieloosobowe wyścigi pisania" },
    { slug: "cs", htmlLang: "cs", title: "TypeRace.io | Skutečná moderní platforma pro závody v psaní", description: "Poměřte se s přáteli a dalšími hráči z celého světa v závodech v psaní na klávesnici v reálném čase.", shareDescription: "Závody v psaní proti přátelům i soupeřům", keywords: "hra na psaní, test psaní, rychlost psaní, psaní pro více hráčů, závod v psaní, trénink psaní, slov za minutu", nativeName: "Čeština", language: "Czech", flag: "🇨🇿", noscriptHeading: "TypeRace.io | Skutečná moderní platforma pro závody v psaní", noscriptContent: "Zúčastněte se závodů v psaní pro více hráčů v reálném čase. Procvičujte rychlost psaní ve veřejných zápasech, soukromých lobby nebo tréninkovém režimu pomocí náhodných českých slov a citátů.", tagline: "Závody v psaní pro více hráčů" },
    { slug: "sv", htmlLang: "sv", title: "TypeRace.io | En riktig, modern plattform för skrivrace", description: "Tävla mot vänner och andra spelare från hela världen i skrivtävlingar i realtid.", shareDescription: "Skrivrace mot vänner och rivaler", keywords: "skrivspel, skrivtest, skrivhastighet, multiplayer-skrivning, skrivtävling, skriv snabbare, ord per minut", nativeName: "Svenska", language: "Swedish", flag: "🇸🇪", noscriptHeading: "TypeRace.io | En riktig, modern plattform för skrivrace", noscriptContent: "Delta i skrivtävlingar i realtid med flera spelare. Välj bland flera språk inklusive engelska, spanska, franska, tyska, italienska, portugisiska, ukrainska, arabiska, nederländska, svenska och turkiska. Öva din skrivhastighet i offentliga matcher, privata lobbyer eller övningsläge.", tagline: "Multiplayer-skrivtävlingar" },
    { slug: "tr", htmlLang: "tr", title: "TypeRace.io | Gerçek ve modern bir yazma yarışı platformu", description: "Arkadaşlarınızla ve dünyanın dört bir yanından diğer oyuncularla gerçek zamanlı yazma yarışlarında rekabet edin.", shareDescription: "Arkadaşlar ve rakiplerle yazma yarışları", keywords: "yazma oyunu, yazma testi, yazma hızı, çok oyunculu yazma, yazma yarışı, hız testi, dakikada kelime", nativeName: "Türkçe", language: "Turkish", flag: "🇹🇷", noscriptHeading: "TypeRace.io | Gerçek ve modern bir yazma yarışı platformu", noscriptContent: "Gerçek zamanlı çok oyunculu yazma yarışlarına katılın. İngilizce, İspanyolca, Fransızca, Almanca, İtalyanca, Portekizce, Ukraynaca, Arapça, Felemenkçe, İsveççe ve Türkçe dahil olmak üzere birçok dil arasından seçim yapın. Açık maçlarda, özel lobilerde veya alıştırma modunda yazma hızınızı geliştirin.", tagline: "Çok oyunculu yazma yarışları" },
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

    // Vite passes the already transformed base page to closeBundle, so remove
    // its canonical and alternate links before adding the localized set.
    html = html.replace(/\s*<link rel="canonical" href="[^"]+" \/>/g, '');
    html = html.replace(/\s*<link rel="alternate" hreflang="[^"]+" href="[^"]+" \/>/g, '');

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
        `<meta property="og:title" content="TypeRace.io" />`
    );
    html = html.replace(
        /<meta property="og:description" content=".*?" \/>/,
        `<meta property="og:description" content="${lang.shareDescription}" />`
    );

    html = html.replace(
        /<meta property="twitter:url" content=".*?" \/>/,
        `<meta property="twitter:url" content="https://typerace.io/${lang.slug}/" />`
    );
    html = html.replace(
        /<meta property="twitter:title" content=".*?" \/>/,
        `<meta property="twitter:title" content="TypeRace.io" />`
    );
    html = html.replace(
        /<meta property="twitter:description" content=".*?" \/>/,
        `<meta property="twitter:description" content="${lang.shareDescription}" />`
    );

    html = html.replace(
        /"url": "https:\/\/typerace\.io"/,
        `"url": "https://typerace.io/${lang.slug}"`
    );

    html = html.replace(
        /"description": "Race against friends and other players around the world in real-time typing competitions\."/,
        `"description": "${lang.description}"`
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
