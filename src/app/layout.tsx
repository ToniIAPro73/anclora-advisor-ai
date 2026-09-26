import { Inter, JetBrains_Mono } from "next/font/google";
import type { Metadata } from 'next';
import type { ReactNode } from "react";
import { AppPreferencesProvider } from "@/components/providers/AppPreferencesProvider";
import { AppPreferencesScript } from "@/components/providers/AppPreferencesScript";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { ADVISOR_BRAND } from "@/lib/advisor-brand";
import { versionedPublicAsset } from "@/lib/branding/icon-metadata";
import './globals.css';

// ANCLORA_BRANDING_TYPOGRAPHY (Internas): Inter para display/body, JetBrains Mono para monospace.
const sansFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
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
