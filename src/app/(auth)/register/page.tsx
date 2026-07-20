import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "~/components/auth/auth-form";
import { auth } from "~/server/auth";
import { authMethods } from "~/server/auth/config";

export const metadata = { title: "Ücretsiz hesap aç" };

export default async function RegisterPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <>
      <p className="text-orange-ink text-sm font-black tracking-[.16em] uppercase">
        Ücretsiz başla
      </p>
      <h1 className="display-serif mt-3 text-5xl font-bold">
        Adresini seç, kendini anlat.
      </h1>
      <p className="text-ink/70 mt-4 mb-8 leading-7">
        Kullanıcı adın herkese açık profil adresin olacak. Sonradan ayarlardan
        değiştirebilirsin.
      </p>
      <AuthForm mode="register" {...authMethods} />
      <p className="text-ink/70 mt-7 text-center text-sm">
        Zaten hesabın var mı?{" "}
        <Link
          href="/login"
          className="text-ink font-black underline decoration-2 underline-offset-4"
        >
          Giriş yap
        </Link>
      </p>
    </>
  );
}
