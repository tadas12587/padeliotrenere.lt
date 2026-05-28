import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import Providers from "@/components/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Padelio Treneris | Profesionalios padelio treniruotės",
    template: "%s | Padelio Treneris",
  },
  description:
    "Profesionalus padelio treneris Lietuvoje. Individualios ir grupinės treniruotės visiems lygiams. Rezervuok savo laiką dabar!",
  keywords: [
    "padelis",
    "padelio treneris",
    "padelio treniruotės",
    "padelis Lietuva",
    "padelio rezervacija",
  ],
  authors: [{ name: "Padelio Treneris" }],
  openGraph: {
    type: "website",
    locale: "lt_LT",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Padelio Treneris",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lt" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#e94560" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <Providers>
          <ServiceWorkerRegistration />
          {children}
        </Providers>
      </body>
    </html>
  );
}
