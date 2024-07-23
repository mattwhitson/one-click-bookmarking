import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Poppins } from "next/font/google";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";
import { ModalProvider } from "@/components/providers/modal-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { SessionProvider } from "next-auth/react";
import { Footer } from "@/components/footer";

const font = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "One Click Bookmarking",
  description:
    "The one stop shop for all your bookmarking needs! Create, organize, favorite, and share all your favorite webpages in one convenient place.",
  openGraph: {
    title: "One Click Bookmarking",
    description:
      "The one stop shop for all your bookmarking needs! Create, organize, favorite, and share all your favorite webpages in one convenient place.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={font.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SessionProvider>
            <QueryProvider>
              <Header />
              {children}
              <Footer />
              <Toaster />
              <ModalProvider />
            </QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
