import type { Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TRPCReactProvider>{children}</TRPCReactProvider>;
}
