import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIA Piauí - Hub de Ferramentas de IA",
  description: "Descubra, avalie e compartilhe as melhores ferramentas de Inteligência Artificial disponíveis no mercado.",
  keywords: ["IA", "Inteligência Artificial", "Ferramentas de IA", "SIA Piauí", "AI Tools"],
  authors: [{ name: "SIA Piauí Team" }],
  openGraph: {
    title: "SIA Piauí - Hub de Ferramentas de IA",
    description: "Descubra, avalie e compartilhe as melhores ferramentas de Inteligência Artificial",
    url: "https://sia-piaui.vercel.app",
    siteName: "SIA Piauí",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SIA Piauí - Hub de Ferramentas de IA",
    description: "Descubra, avalie e compartilhe as melhores ferramentas de Inteligência Artificial",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
