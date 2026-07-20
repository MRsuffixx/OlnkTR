import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Brand } from "~/components/brand";

export default function NotFound() {
  return <main className="noise-grid grid min-h-screen place-items-center bg-cream px-5"><div className="max-w-lg text-center"><div className="flex justify-center"><Brand /></div><div className="display-serif mt-10 text-[8rem] leading-none font-bold text-orange">404</div><h1 className="display-serif -mt-3 text-4xl font-bold">Bu adres burada değil.</h1><p className="mx-auto mt-4 max-w-md leading-7 text-ink/60">Bağlantı değişmiş, kaldırılmış veya henüz alınmamış olabilir.</p><Link href="/" className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-5 font-black text-paper shadow-[4px_4px_0_#F06432]"><ArrowLeft className="size-4" /> Ana sayfaya dön</Link></div></main>;
}
