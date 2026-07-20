import "~/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://olnk.tr"),
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
  },
  twitter: { card: "summary_large_image" },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={geist.variable}>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
