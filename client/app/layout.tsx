import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  IBM_Plex_Sans,
  Merriweather,
} from "next/font/google";

import "./globals.css";

import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import QueryProvider from "@/components/providers/query-provider";

const merriweatherHeading = Merriweather({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BuildFolio — AI Codebase Intelligence",
    template: "%s | BuildFolio",
  },

  description:
    "Connect your GitHub repositories, index your codebase, and chat with your code using AI-powered repository intelligence.",

  keywords: [
    "BuildFolio",
    "AI codebase assistant",
    "GitHub AI",
    "codebase intelligence",
    "repository chatbot",
    "RAG",
    "AI developer tools",
    "GitHub repository search",
  ],

  authors: [
    {
      name: "BuildFolio",
    },
  ],

  creator: "BuildFolio",

  applicationName: "BuildFolio",

  generator: "Next.js",

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    title: "BuildFolio — AI Codebase Intelligence",
    description:
      "Understand your GitHub repositories through conversation.",
    siteName: "BuildFolio",
  },

  twitter: {
    card: "summary_large_image",
    title: "BuildFolio — AI Codebase Intelligence",
    description:
      "Connect GitHub, index your codebase, and chat with your code using AI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        "font-sans",
        geistSans.variable,
        geistMono.variable,
        ibmPlexSans.variable,
        merriweatherHeading.variable
      )}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}