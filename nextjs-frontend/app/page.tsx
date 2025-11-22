import type { Metadata } from "next";
import ClientWrapper from "@/components/ClientWrapper";

export const metadata: Metadata = {
  title: "TypeRace.io - Competitive Multiplayer Typing Game",
  description: "Race against players worldwide in real-time typing competitions. Improve your typing speed and accuracy with TypeRace.io's multiplayer typing game. Practice in multiple languages including English, Spanish, French, German, Japanese, and more.",
  keywords: ["typing game", "typing speed test", "multiplayer typing", "typing race", "improve typing speed", "typing practice", "competitive typing", "online typing game"],
  openGraph: {
    title: "TypeRace.io - Competitive Multiplayer Typing Game",
    description: "Race against players worldwide in real-time typing competitions. Test and improve your typing speed.",
    type: "website",
    url: "https://typerace.io",
  },
  twitter: {
    card: "summary_large_image",
    title: "TypeRace.io - Competitive Multiplayer Typing Game",
    description: "Race against players worldwide in real-time typing competitions. Test and improve your typing speed.",
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "TypeRace.io",
    "applicationCategory": "Game",
    "description": "Multiplayer competitive typing game where players race against each other in real-time typing competitions",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Real-time multiplayer typing races",
      "Multiple language support",
      "Public and private game modes",
      "Practice mode",
      "Player statistics and progress tracking"
    ],
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "url": "https://typerace.io"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <h1 className="sr-only">TypeRace.io - Multiplayer Typing Speed Competition</h1>
        <p className="sr-only">
          Compete in real-time multiplayer typing races. Choose from multiple languages including 
          English, Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese, Ukrainian, 
          Arabic, Hindi, Dutch, Swedish, and Turkish. Practice your typing speed in public matches, 
          private lobbies, or solo practice mode.
        </p>
        <ClientWrapper />
      </main>
    </>
  );
}
