import { useTranslations } from "next-intl";
import { Button } from "@olnktr/ui";
import { Link } from "~/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <Button asChild variant="outline">
        <Link href="/">{t("back")}</Link>
      </Button>
    </main>
  );
}
