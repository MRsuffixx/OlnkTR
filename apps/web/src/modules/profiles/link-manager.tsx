"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert, Badge, Button, Input } from "@olnktr/ui";
import { publicHttpUrlSchema } from "@olnktr/validators";
import { FormField } from "~/components/form-field";
import { errorKey } from "~/lib/errors";
import { useTRPC } from "~/lib/trpc/client";

const schema = z.object({ title: z.string().trim().min(1).max(120), url: publicHttpUrlSchema });

/** Minimal link management (no visual editor in this phase). */
export function LinkManager({ profileId }: { profileId: string }) {
  const t = useTranslations();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const linksQuery = useQuery(trpc.links.list.queryOptions({ profileId }));
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: trpc.links.list.queryKey({ profileId }) });
  const onError = (mutationError: unknown) => setError(t(`errors.${errorKey(mutationError)}`));
  const create = useMutation(
    trpc.links.create.mutationOptions({
      onSuccess: () => {
        form.reset();
        void invalidate();
      },
      onError,
    }),
  );
  const update = useMutation(trpc.links.update.mutationOptions({ onSuccess: invalidate, onError }));
  const remove = useMutation(trpc.links.delete.mutationOptions({ onSuccess: invalidate, onError }));
  const reorder = useMutation(
    trpc.links.reorder.mutationOptions({ onSuccess: invalidate, onError }),
  );
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", url: "" },
  });

  const links = linksQuery.data ?? [];
  const move = (index: number, delta: number) => {
    const ids = links.map((link) => link.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(index + delta, 0, moved!);
    reorder.mutate({ profileId, orderedIds: ids });
  };

  return (
    <div className="grid gap-6">
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {links.length === 0 && !linksQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">{t("profile.noLinks")}</p>
      ) : null}
      <ul className="grid gap-2" data-testid="link-list">
        {links.map((link, index) => (
          <li
            key={link.id}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-3"
          >
            <div className="grid min-w-0 flex-1 gap-0.5">
              <span className="truncate font-medium">{link.title}</span>
              <span className="truncate text-xs text-muted-foreground">{link.url}</span>
            </div>
            <Badge variant="outline">{t("profile.clickCount", { count: link.clickCount })}</Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => update.mutate({ linkId: link.id, isActive: !link.isActive })}
            >
              {link.isActive ? t("profile.active") : t("profile.inactive")}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="up"
              disabled={index === 0}
              onClick={() => move(index, -1)}
            >
              <ArrowUp />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="down"
              disabled={index === links.length - 1}
              onClick={() => move(index, 1)}
            >
              <ArrowDown />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label={t("common.delete")}
              onClick={() => remove.mutate({ linkId: link.id })}
            >
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>
      <form
        className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        noValidate
        onSubmit={form.handleSubmit((values) => {
          setError(null);
          create.mutate({ profileId, ...values });
        })}
      >
        <FormField
          id="link-title"
          label={t("profile.linkTitle")}
          error={form.formState.errors.title && t("validation.required")}
        >
          <Input id="link-title" {...form.register("title")} />
        </FormField>
        <FormField
          id="link-url"
          label={t("profile.linkUrl")}
          error={form.formState.errors.url && t("validation.url")}
        >
          <Input id="link-url" type="url" placeholder="https://" {...form.register("url")} />
        </FormField>
        <Button type="submit" disabled={create.isPending}>
          {t("profile.addLink")}
        </Button>
      </form>
    </div>
  );
}
