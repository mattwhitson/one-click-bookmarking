import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Poppins } from "next/font/google";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/sonner";

const font = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

import "./globals.css";
import { ModalProvider } from "@/components/providers/modal-provider";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={font.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          {children}
          <Toaster />
          <ModalProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
