import { Brand } from "~/components/brand";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-paper grid min-h-screen lg:grid-cols-[.9fr_1.1fr]">
      <aside className="noise-grid bg-yellow relative hidden overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between">
        <Brand />
        <div className="relative z-10 max-w-xl">
          <div className="border-ink bg-mint mb-6 inline-flex rounded-full border-2 px-4 py-2 text-sm font-black shadow-[3px_3px_0_#17211b]">
            Bugün paylaşmaya başla ✦
          </div>
          <blockquote className="display-serif text-6xl leading-[.98] font-bold">
            “İyi bir link sayfası, internetteki en kısa tanışma.”
          </blockquote>
        </div>
        <div className="text-ink/60 flex gap-3 text-sm font-bold">
          <span>Hızlı</span>
          <span>·</span>
          <span>Güvenli</span>
          <span>·</span>
          <span>Türkçe</span>
        </div>
        <div className="border-orange/70 absolute -top-28 -right-28 size-80 rounded-full border-[48px]" />
        <div className="bg-mint/70 absolute right-20 -bottom-24 size-60 rotate-12 rounded-[4rem]" />
      </aside>
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <Brand />
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
