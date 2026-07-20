import { redirect } from "next/navigation";

import { Brand } from "~/components/brand";
import { OnboardingForm } from "~/components/auth/onboarding-form";
import { auth } from "~/server/auth";

export const metadata = { title: "Profil adresini seç" };

export default async function OnboardingPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.username) redirect("/dashboard");

  return (
    <main className="noise-grid bg-cream flex min-h-screen items-center justify-center px-5 py-12">
      <div className="border-ink bg-paper w-full max-w-lg rounded-[2rem] border-2 p-6 shadow-[8px_8px_0_#F8C95C] sm:p-10">
        <Brand />
        <p className="text-orange mt-10 text-sm font-black tracking-[.14em] uppercase">
          Son bir adım
        </p>
        <h1 className="display-serif mt-3 text-5xl font-bold">
          Sana nasıl seslenelim?
        </h1>
        <p className="text-ink/60 mt-4 leading-7">
          Kayıt sırasında seçtiğin ad artık uygun değilse yeni bir profil adresi
          seçebilirsin.
        </p>
        <OnboardingForm />
      </div>
    </main>
  );
}
