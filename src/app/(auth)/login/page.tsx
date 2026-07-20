import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "~/components/auth/auth-form";
import { auth } from "~/server/auth";
import { authMethods } from "~/server/auth/config";

export const metadata = { title: "Giriş yap" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (session) redirect("/dashboard");
  const { status } = await searchParams;

  return (
    <>
      <p className="text-sm font-black tracking-[.16em] text-orange uppercase">Tekrar merhaba</p>
      <h1 className="display-serif mt-3 text-5xl font-bold">Sayfan seni bekliyor.</h1>
      <p className="mt-4 mb-8 leading-7 text-ink/60">Şifre yok. E-postana güvenli bir giriş bağlantısı göndeririz.</p>
      <AuthForm mode="login" {...authMethods} emailSent={status === "email-sent"} />
      <p className="mt-7 text-center text-sm text-ink/60">
        Henüz hesabın yok mu?{" "}
        <Link href="/register" className="font-black text-ink underline decoration-2 underline-offset-4">Ücretsiz aç</Link>
      </p>
    </>
  );
}
