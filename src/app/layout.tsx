import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NOTA MERICAN",
  description: "Addictive educational ranking quiz",
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/icon-192x192.png",
  }
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // App-like feel
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.className} min-h-screen bg-background text-foreground antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
