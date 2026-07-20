import { randomBytes, randomUUID } from "node:crypto";
import { resolveTxt } from "node:dns/promises";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { env } from "~/env";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { hasProAccess } from "~/server/entitlements";

const domainSchema = z.string().trim().toLowerCase().max(253).regex(/^(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/);

async function requirePro(ctx: { db: typeof import("~/server/db").db; session: { user: { id: string } } }) {
  const subscription = await ctx.db.subscription.findUnique({ where: { userId: ctx.session.user.id } });
  if (!hasProAccess(subscription)) throw new TRPCError({ code: "FORBIDDEN", message: "Bu özellik Pro planında kullanılabilir." });
}

function storageConfig() {
  if (!env.STORAGE_ENDPOINT || !env.STORAGE_BUCKET || !env.STORAGE_ACCESS_KEY_ID || !env.STORAGE_SECRET_ACCESS_KEY || !env.STORAGE_PUBLIC_URL) return null;
  return { endpoint: env.STORAGE_ENDPOINT, bucket: env.STORAGE_BUCKET, publicUrl: env.STORAGE_PUBLIC_URL.replace(/\/$/, ""), client: new S3Client({ endpoint: env.STORAGE_ENDPOINT, region: env.STORAGE_REGION ?? "auto", forcePathStyle: true, credentials: { accessKeyId: env.STORAGE_ACCESS_KEY_ID, secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY } }) };
}

export const customizationRouter = createTRPCRouter({
  domainOverview: protectedProcedure.query(async ({ ctx }) => {
    const [subscription, domains] = await Promise.all([ctx.db.subscription.findUnique({ where: { userId: ctx.session.user.id } }), ctx.db.customDomain.findMany({ where: { userId: ctx.session.user.id }, orderBy: { createdAt: "desc" } })]);
    return { hasPro: hasProAccess(subscription), domains };
  }),
  addDomain: protectedProcedure.input(z.object({ domain: domainSchema })).mutation(async ({ ctx, input }) => {
    await requirePro(ctx);
    const token = randomBytes(24).toString("hex");
    try {
      return await ctx.db.customDomain.create({ data: { userId: ctx.session.user.id, domain: input.domain, domainNormalized: input.domain, verificationToken: token } });
    } catch { throw new TRPCError({ code: "CONFLICT", message: "Bu alan adı zaten kullanılıyor." }); }
  }),
  verifyDomain: protectedProcedure.input(z.object({ id: z.cuid2() })).mutation(async ({ ctx, input }) => {
    await requirePro(ctx);
    const domain = await ctx.db.customDomain.findFirst({ where: { id: input.id, userId: ctx.session.user.id } });
    if (!domain) throw new TRPCError({ code: "NOT_FOUND" });
    let verified = false;
    try { const records = await resolveTxt(`_olnk.${domain.domainNormalized}`); verified = records.some((parts) => parts.join("") === `olnk-verification=${domain.verificationToken}`); } catch { verified = false; }
    const updated = await ctx.db.customDomain.update({ where: { id: domain.id }, data: { status: verified ? "VERIFIED" : "FAILED", verifiedAt: verified ? new Date() : null, lastCheckedAt: new Date() } });
    if (!verified) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Doğrulama kaydı henüz görünmüyor. DNS yayılımından sonra tekrar dene." });
    return updated;
  }),
  removeDomain: protectedProcedure.input(z.object({ id: z.cuid2() })).mutation(async ({ ctx, input }) => {
    await ctx.db.customDomain.deleteMany({ where: { id: input.id, userId: ctx.session.user.id } });
    return { ok: true };
  }),
  uploadStatus: protectedProcedure.query(() => ({ available: Boolean(storageConfig()) })),
  createUpload: protectedProcedure.input(z.object({ purpose: z.enum(["avatar", "background"]), fileName: z.string().max(180), mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"]), sizeBytes: z.number().int().positive().max(25 * 1024 * 1024) })).mutation(async ({ ctx, input }) => {
    const storage = storageConfig();
    if (!storage) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Dosya yükleme şu anda yapılandırılmamış." });
    if (input.purpose === "background" || input.mimeType.startsWith("video/")) await requirePro(ctx);
    if (input.purpose === "avatar" && input.mimeType.startsWith("video/")) throw new TRPCError({ code: "BAD_REQUEST", message: "Avatar için görsel dosyası seçin." });
    const extension = input.fileName.split(".").at(-1)?.replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
    const objectKey = `users/${ctx.session.user.id}/${input.purpose}/${randomUUID()}.${extension}`;
    const publicUrl = `${storage.publicUrl}/${objectKey}`;
    const uploadUrl = await getSignedUrl(storage.client, new PutObjectCommand({ Bucket: storage.bucket, Key: objectKey, ContentType: input.mimeType, ContentLength: input.sizeBytes }), { expiresIn: 300 });
    await ctx.db.uploadedAsset.create({ data: { userId: ctx.session.user.id, objectKey, publicUrl, mimeType: input.mimeType, sizeBytes: input.sizeBytes } });
    return { uploadUrl, publicUrl, headers: { "content-type": input.mimeType } };
  }),
});
