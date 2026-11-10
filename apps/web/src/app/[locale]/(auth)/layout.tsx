import type { ReactNode } from "react";
import { Link } from "~/i18n/navigation";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-6 px-4 py-12">
      <Link href="/" className="text-sm font-semibold">
        OlnkTR
      </Link>
      {children}
    </main>
  );
}
