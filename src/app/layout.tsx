import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "StudyMate.io",
    template: "%s | StudyMate.io",
  },
  metadataBase: new URL("https://studymate-io.vercel.app/"),
  description: "AI-powered education platform. Turn your notes into top grades with instant quizzes, flashcards, and summaries.",
  keywords: ["study", "AI", "education", "flashcards", "quizzes", "summaries", "student", "learning"],
  authors: [{ name: "StudyMate.io Team" }],
  verification: {
    google: "C8uYU-RlcSJhPRmqsQ3hSZAxx-U-T3ZQpi806yOyucU",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://studymate-io.vercel.app/",
    title: "StudyMate.io - AI Study Companion",
    description: "Turn your notes into top grades instantly.",
    siteName: "StudyMate.io",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "StudyMate.io Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StudyMate.io",
    description: "AI-powered education platform.",
    images: ["/logo.png"],
  },
};

import ToastProvider from "@/components/ToastProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          {children}
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
