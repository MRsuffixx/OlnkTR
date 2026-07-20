import "~/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={geist.variable}>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
