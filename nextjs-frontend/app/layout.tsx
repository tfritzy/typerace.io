import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/firebase/AuthContext";
import { SpacetimeDBClientProvider } from "@/lib/providers/SpacetimeDBProvider";

export const metadata: Metadata = {
  title: "TypeRace.io",
  description: "Real-time competitive typing game",
  icons: {
    icon: [
      { url: "/favicons/favicon.ico" },
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/favicons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SpacetimeDBClientProvider>
            {children}
          </SpacetimeDBClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
