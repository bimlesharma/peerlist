import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CursorProvider } from "@/contexts/CursorContext";
import { GlobalCursorEffect } from "@/components/GlobalCursorEffect";
import { GlobalLoadingIndicator } from "@/components/GlobalLoadingIndicator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ListPeers | Academic Analytics Platform",
  description: "Privacy-first, consent-driven academic analytics platform for students",
  robots: "noindex, nofollow", // No SEO indexing as per PRD
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CursorProvider>
          <GlobalCursorEffect />
          <GlobalLoadingIndicator />
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </CursorProvider>
      </body>
    </html>
  );
}
