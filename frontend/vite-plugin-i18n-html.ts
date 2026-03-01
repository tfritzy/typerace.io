import { type Plugin } from 'vite';
import * as fs from 'fs';
import * as path from 'path';

interface LanguagePage {
    slug: string;
    htmlLang: string;
    title: string;
    description: string;
    nativeName: string;
    language: string;
    flag: string;
}

const languagePages: LanguagePage[] = [
    { slug: "es", htmlLang: "es", title: "TypeRace.io - Practica mecanografía compitiendo contra personas reales", description: "Compite contra jugadores de todo el mundo en carreras de mecanografía en tiempo real. Mejora tu velocidad de escritura.", nativeName: "Español", language: "Spanish", flag: "🇪🇸" },
    { slug: "fr", htmlLang: "fr", title: "TypeRace.io - Entraînez-vous à taper en faisant la course contre de vraies personnes", description: "Affrontez des joueurs du monde entier dans des compétitions de frappe en temps réel. Améliorez votre vitesse de frappe.", nativeName: "Français", language: "French", flag: "🇫🇷" },
    { slug: "de", htmlLang: "de", title: "TypeRace.io - Übe Tippen im Wettrennen gegen echte Menschen", description: "Tritt gegen Spieler weltweit in Echtzeit-Tippwettbewerben an. Verbessere deine Tippgeschwindigkeit.", nativeName: "Deutsch", language: "German", flag: "🇩🇪" },
    { slug: "it", htmlLang: "it", title: "TypeRace.io - Pratica la digitazione gareggiando contro persone reali", description: "Gareggia contro giocatori di tutto il mondo in competizioni di digitazione in tempo reale. Migliora la tua velocità di battitura.", nativeName: "Italiano", language: "Italian", flag: "🇮🇹" },
    { slug: "pt", htmlLang: "pt", title: "TypeRace.io - Pratique digitação competindo contra pessoas reais", description: "Compita contra jogadores de todo o mundo em competições de digitação em tempo real. Melhore sua velocidade de digitação.", nativeName: "Português", language: "Portuguese", flag: "🇵🇹" },
    { slug: "ja", htmlLang: "ja", title: "TypeRace.io - リアルタイムタイピングレース", description: "世界中のプレイヤーとリアルタイムのタイピング競争で対戦しましょう。タイピング速度を向上させましょう。", nativeName: "日本語", language: "Japanese", flag: "🇯🇵" },
    { slug: "ko", htmlLang: "ko", title: "TypeRace.io - 실시간 타이핑 레이스", description: "전 세계 플레이어와 실시간 타이핑 대회에서 경쟁하세요. 타이핑 속도를 향상시키세요.", nativeName: "한국어", language: "Korean", flag: "🇰🇷" },
    { slug: "zh", htmlLang: "zh", title: "TypeRace.io - 实时打字竞赛", description: "与全球玩家进行实时打字比赛。提高你的打字速度。", nativeName: "中文", language: "Chinese", flag: "🇨🇳" },
    { slug: "uk", htmlLang: "uk", title: "TypeRace.io - Практикуй друк змагаючись з реальними людьми", description: "Змагайтеся з гравцями з усього світу в змаганнях з друку в реальному часі. Покращуйте швидкість друку.", nativeName: "Українська", language: "Ukrainian", flag: "🇺🇦" },
    { slug: "hi", htmlLang: "hi", title: "TypeRace.io - असली लोगों के खिलाफ टाइपिंग रेस", description: "वास्तविक समय में टाइपिंग प्रतियोगिताओं में दुनिया भर के खिलाड़ियों के खिलाफ प्रतिस्पर्धा करें। अपनी टाइपिंग गति में सुधार करें।", nativeName: "हिन्दी", language: "Hindi", flag: "🇮🇳" },
    { slug: "nl", htmlLang: "nl", title: "TypeRace.io - Oefen typen door te racen tegen echte mensen", description: "Race tegen spelers wereldwijd in real-time typwedstrijden. Verbeter je typsnelheid.", nativeName: "Nederlands", language: "Dutch", flag: "🇳🇱" },
    { slug: "sv", htmlLang: "sv", title: "TypeRace.io - Öva skrivning genom att tävla mot riktiga människor", description: "Tävla mot spelare världen över i skrivtävlingar i realtid. Förbättra din skrivhastighet.", nativeName: "Svenska", language: "Swedish", flag: "🇸🇪" },
    { slug: "tr", htmlLang: "tr", title: "TypeRace.io - Gerçek insanlara karşı yazma yarışı", description: "Dünya genelindeki oyuncularla gerçek zamanlı yazma yarışmalarında yarışın. Yazma hızınızı geliştirin.", nativeName: "Türkçe", language: "Turkish", flag: "🇹🇷" },
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
