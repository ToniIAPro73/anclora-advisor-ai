import localFont from "next/font/local";
import type { Metadata } from 'next';
import type { ReactNode } from "react";
import { AppPreferencesProvider } from "@/components/providers/AppPreferencesProvider";
import { AppPreferencesScript } from "@/components/providers/AppPreferencesScript";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { ADVISOR_BRAND } from "@/lib/advisor-brand";
import { versionedPublicAsset } from "@/lib/branding/icon-metadata";
import './globals.css';

// ANCLORA_BRANDING_TYPOGRAPHY (Internas): Inter para display/body, JetBrains Mono para monospace.
// Fuentes autoalojadas (subset latin): el build no depende de la red de Google Fonts.
const sansFont = localFont({
  src: "./fonts/Inter-latin.woff2",
  weight: "400 700",
  variable: "--font-sans",
  display: "swap",
});

const monoFont = localFont({
  src: "./fonts/JetBrainsMono-latin.woff2",
  weight: "400 500",
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: ADVISOR_BRAND.name,
  description: ADVISOR_BRAND.description,
  icons: {
    icon: [
      { url: versionedPublicAsset(ADVISOR_BRAND.faviconPath), sizes: 'any' },
      { url: versionedPublicAsset(ADVISOR_BRAND.faviconPng32), type: 'image/png', sizes: '32x32' },
      { url: versionedPublicAsset(ADVISOR_BRAND.faviconPng192), type: 'image/png', sizes: '192x192' },
    ],
    apple: [{ url: versionedPublicAsset(ADVISOR_BRAND.appleTouchIcon), sizes: '180x180', type: 'image/png' }],
    shortcut: [versionedPublicAsset(ADVISOR_BRAND.faviconPath)],
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${sansFont.variable} ${monoFont.variable}`}>
        <AppPreferencesScript />
        <AppPreferencesProvider>
          {children}
          <CookieConsent />
        </AppPreferencesProvider>
      </body>
    </html>
  );
}
