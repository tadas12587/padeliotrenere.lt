import type { Metadata } from "next";
import { Poppins, Roboto } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import Providers from "@/components/Providers";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "ManoTreniruote.lt | Sporto treneriai Lietuvoje",
    template: "%s | ManoTreniruote.lt",
  },
  description:
    "Rask geriausią sporto trenerį Lietuvoje. Padelis, tenisas, krepšinis ir daugiau. Individualios ir grupinės treniruotės visiems lygiams.",
  keywords: [
    "sporto treneris",
    "padelio treneris",
    "teniso treneris",
    "sporto treniruotės",
    "treneris Lietuva",
    "sporto rezervacija",
  ],
  authors: [{ name: "ManoTreniruote.lt" }],
  openGraph: {
    type: "website",
    locale: "lt_LT",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "ManoTreniruote.lt",
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
    <html lang="lt" className={`${poppins.variable} ${roboto.variable} h-full antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FF5733" />
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
