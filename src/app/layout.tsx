// hardware/src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DynamicFavicon } from "@/components/DynamicFavicon";
import { DynamicSEO } from "@/components/DynamicSEO";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  // Domain bazını mutlaka buraya koy
  metadataBase: new URL("https://donanimpuani.com"),

  title: "Donanım Puanı - Donanım İnceleme ve Karşılaştırma Sitesi",
  description:
    "En güncel donanım incelemeleri, karşılaştırmaları ve rehberleri. Router, modem, ağ ekipmanları hakkında detaylı analizler.",
  keywords:
    "donanım inceleme, router, modem, wifi, ağ ekipmanları, karşılaştırma, donanım puanı",

  authors: [{ name: "Donanım Puanı Ekibi" }],
  creator: "Donanım Puanı",
  publisher: "Donanım Puanı",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://donanimpuani.com",
    siteName: "Donanım Puanı",
    title: "Donanım Puanı - Donanım İnceleme ve Karşılaştırma Sitesi",
    description:
      "En güncel donanım incelemeleri, karşılaştırmaları ve rehberleri. Router, modem, ağ ekipmanları hakkında detaylı analizler.",
    images: [
      {
        // public/og-image.jpg dosyasına karşılık gelir
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Donanım Puanı",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Donanım Puanı - Donanım İnceleme ve Karşılaştırma Sitesi",
    description:
      "En güncel donanım incelemeleri, karşılaştırmaları ve rehberleri.",
    images: ["/og-image.jpg"],
  },

  verification: {
    // Buraya gerçek Search Console code’unu koyman lazım
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <DynamicFavicon />
          <DynamicSEO />
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
        {/* made by byiyuel */}
      </body>
    </html>
  );
}
