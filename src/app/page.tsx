import { ArrowUpRight, BarChart3, GripVertical, Palette, Sparkles } from "lucide-react";
import Link from "next/link";

import { Brand } from "~/components/brand";
import { SiteHeader } from "~/components/site-header";

const demoLinks = ["Son videomu izle", "Haftalık bültenim", "Birlikte çalışalım"];

export default function Home() {
  return (
    <main className="overflow-hidden">
      <SiteHeader />
      <section className="noise-grid relative min-h-[760px] bg-cream pt-28 sm:pt-32">
        <div className="pointer-events-none absolute -left-24 top-40 size-72 rounded-full bg-mint/60 blur-2xl" />
        <div className="pointer-events-none absolute -right-20 top-24 size-80 rounded-full bg-yellow/60 blur-2xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.02fr_.98fr] lg:gap-8 lg:pb-24 lg:pt-16">
          <div className="float-in max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper/80 px-3 py-1.5 text-sm font-semibold backdrop-blur">
              <Sparkles className="size-4 text-orange" aria-hidden="true" />
              İnternetteki yeni adresin
            </div>
            <h1 className="display-serif text-[clamp(3.8rem,9vw,7.7rem)] leading-[.83] font-bold text-ink">
              Tek link.
              <br />
              <span className="relative inline-block text-orange">
                Bütün sen.
                <span className="absolute -right-6 -top-2 size-4 rotate-12 rounded-full bg-yellow sm:-right-8 sm:size-6" />
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-ink/70 sm:text-xl">
              Ürettiklerini, sattıklarını ve anlattıklarını tek bir sade sayfada topla. Dakikalar içinde yayınla, neyin ilgi gördüğünü anında gör.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-ink px-7 text-base font-bold text-paper shadow-[5px_5px_0_#F06432] transition hover:-translate-y-1"
              >
                Ücretsiz sayfanı aç
                <ArrowUpRight className="size-5 transition-transform group-hover:rotate-12" aria-hidden="true" />
              </Link>
              <a href="#nasil" className="inline-flex min-h-14 items-center justify-center rounded-full px-7 font-bold text-ink hover:bg-paper/60">
                Nasıl çalışır?
              </a>
            </div>
            <p className="mt-4 text-sm font-medium text-ink/55">Kredi kartı gerekmez · 2 dakikada hazır</p>
          </div>

          <div className="relative mx-auto w-full max-w-[520px] lg:mr-0">
            <div className="absolute -left-4 top-24 z-20 hidden rotate-[-6deg] rounded-2xl border-2 border-ink bg-mint p-4 shadow-[5px_5px_0_#17211b] sm:block">
              <div className="flex items-center gap-2 text-sm font-black"><BarChart3 className="size-4" /> Bu hafta</div>
              <div className="mt-1 text-3xl font-black">+%38</div>
            </div>
            <div className="absolute -right-3 bottom-20 z-20 rotate-6 rounded-2xl border-2 border-ink bg-yellow px-4 py-3 shadow-[5px_5px_0_#17211b]">
              <div className="flex items-center gap-2 text-sm font-black"><Palette className="size-4" /> Tam senlik</div>
            </div>
            <div className="mx-auto w-[300px] rounded-[3.5rem] border-[9px] border-ink bg-ink p-2 shadow-[0_35px_80px_rgba(23,33,27,.25)] sm:w-[330px]">
              <div className="relative min-h-[610px] overflow-hidden rounded-[2.7rem] bg-[linear-gradient(145deg,#F5F0DE_0%,#F8C95C_100%)] px-5 py-11 text-center">
                <div className="absolute left-1/2 top-3 h-5 w-24 -translate-x-1/2 rounded-full bg-ink" />
                <div className="mx-auto grid size-24 place-items-center rounded-full border-4 border-paper bg-orange text-4xl font-black text-paper shadow-[4px_5px_0_#17211b]">E</div>
                <h2 className="mt-5 text-2xl font-black">Ece Yılmaz</h2>
                <p className="mt-2 text-sm leading-6 text-ink/70">Tasarım, şehir ve güzel fikirler üzerine ✦</p>
                <div className="mt-7 space-y-3">
                  {demoLinks.map((label) => (
                    <div key={label} className="flex items-center rounded-2xl bg-ink px-4 py-4 text-left text-sm font-bold text-paper shadow-[4px_5px_0_rgba(240,100,50,.75)]">
                      <GripVertical className="mr-2 size-4 text-paper/45" />
                      <span className="flex-1">{label}</span>
                      <ArrowUpRight className="size-4" />
                    </div>
                  ))}
                </div>
                <div className="absolute inset-x-0 bottom-7 flex justify-center"><Brand compact /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="ozellikler" className="bg-ink px-5 py-20 text-paper sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
            <div>
              <span className="text-sm font-bold tracking-[.18em] text-yellow uppercase">Bir linkten fazlası</span>
              <h2 className="display-serif mt-4 text-5xl leading-[.95] font-bold sm:text-6xl">Sayfan büyürken sen işine bak.</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["01", "Anında düzenle", "Sürükle, bırak, rengini seç. Değişiklikleri telefon görünümünde anında izle."],
                ["02", "Gerçek veriyi gör", "Hangi bağlantının ne zaman tıklandığını sade grafiklerle takip et."],
                ["03", "Her yerde paylaş", "Kısa adresin ve otomatik QR kodunla ekrandan baskıya her yerde hazırsın."],
                ["04", "Hızlı açılır", "Mobil öncelikli, sunucuda hazırlanan profil sayfaları ziyaretçiyi bekletmez."],
              ].map(([number, title, text]) => (
                <article key={number} className="rounded-3xl border border-paper/15 bg-paper/[.06] p-6">
                  <div className="text-sm font-black text-orange">{number}</div>
                  <h3 className="mt-8 text-xl font-bold">{title}</h3>
                  <p className="mt-3 leading-7 text-paper/60">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="nasil" className="bg-orange px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <span className="rounded-full bg-ink px-3 py-1.5 text-xs font-black tracking-widest text-paper uppercase">olnk.tr/senin-adın</span>
          <h2 className="display-serif mt-7 max-w-4xl text-5xl leading-[.95] font-bold sm:text-7xl">İnsanları doğru yere götüren adresin hazır.</h2>
          <Link href="/register" className="mt-9 inline-flex min-h-14 items-center gap-2 rounded-full bg-paper px-7 font-black text-ink shadow-[5px_5px_0_#17211b] transition hover:-translate-y-1">
            Adını kap <ArrowUpRight className="size-5" />
          </Link>
        </div>
      </section>

      <footer className="bg-paper px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 sm:flex-row">
          <Brand />
          <div className="flex gap-5 text-sm font-semibold text-ink/60">
            <Link href="/privacy">Gizlilik</Link>
            <Link href="/terms">Koşullar</Link>
            <a href="mailto:merhaba@olnk.tr">İletişim</a>
          </div>
          <p className="text-sm text-ink/50">© {new Date().getFullYear()} olnk</p>
        </div>
      </footer>
    </main>
  );
}
