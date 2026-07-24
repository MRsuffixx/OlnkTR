import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export function AdminPagination({
  page,
  pageCount,
  href,
}: {
  page: number;
  pageCount: number;
  href: (page: number) => string;
}) {
  if (pageCount <= 1) return null;
  return (
    <nav
      className="mt-6 flex items-center justify-between gap-3"
      aria-label="Sayfalama"
    >
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          className="border-ink/15 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold"
        >
          <ChevronLeft className="size-4" /> Önceki
        </Link>
      ) : (
        <span />
      )}
      <span className="text-ink/70 text-sm">
        {page} / {pageCount}
      </span>
      {page < pageCount ? (
        <Link
          href={href(page + 1)}
          className="border-ink/15 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold"
        >
          Sonraki <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
