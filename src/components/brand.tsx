import Link from "next/link";

export function Brand({
  href = "/",
  compact = false,
}: {
  href?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className="text-ink inline-flex items-center gap-2 font-black tracking-[-0.04em]"
    >
      <span
        aria-hidden="true"
        className="bg-orange text-paper relative grid size-8 place-items-center rounded-[11px] shadow-[3px_3px_0_#17211b]"
      >
        O
      </span>
      {!compact && <span className="text-[1.35rem]">olnk</span>}
      <span className="sr-only">olnk ana sayfa</span>
    </Link>
  );
}
