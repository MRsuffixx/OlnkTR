import "~/styles/globals.css";

import type { Metadata } from "next";
import {
  Bebas_Neue,
  DM_Serif_Display,
  Fraunces,
  Geist,
  Inter,
  Lora,
  Manrope,
  Montserrat,
  Playfair_Display,
  Roboto_Mono,
  Space_Grotesk,
} from "next/font/google";

import { getAppOrigin } from "~/lib/app-url";

export const metadata: Metadata = {
  metadataBase: new URL(getAppOrigin()),
  title: { default: "olnk — Tek link, bütün sen", template: "%s · olnk" },
  description:
    "Bütün içeriklerini tek, sana ait bir bağlantıda buluştur. Hızlı, sade ve Türkçe link sayfan.",
  applicationName: "olnk",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "olnk",
    title: "olnk — Tek link, bütün sen",
    description: "Bütün içeriklerini tek, sana ait bir bağlantıda buluştur.",
    images: [
      {
        url: "/og.png",
        width: 1728,
        height: 910,
        alt: "Tek link. Bütün sen. — olnk",
      },
    ],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});
const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
});
const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="tr"
      className={[
        geist.variable,
        fraunces.variable,
        manrope.variable,
        spaceGrotesk.variable,
        playfair.variable,
        dmSerif.variable,
        bebas.variable,
        inter.variable,
        montserrat.variable,
        lora.variable,
        robotoMono.variable,
      ].join(" ")}
    >
      <body>{children}</body>
    </html>
  );
}
