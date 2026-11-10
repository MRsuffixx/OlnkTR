import type { BillingService, EntitlementService, PaymentProviderRegistry } from "@olnktr/billing";
import type { Database } from "@olnktr/db";
import type { JobProducer } from "@olnktr/jobs";
import type { Logger } from "@olnktr/observability";
import type { ObjectStorage } from "@olnktr/storage";
import type { Clock } from "@olnktr/types";

/** Infrastructure dependencies injected into every domain module (composition root: createCore). */
export interface CoreConfig {
  appUrl: string;
  accountDeletionGraceDays: number;
  mediaMaxUploadBytes: number;
  analyticsHistoryFallbackDays?: number;
}

export interface CoreDeps {
  db: Database;
  jobs: JobProducer;
  storage: ObjectStorage;
  logger: Logger;
  clock: Clock;
  config: CoreConfig;
  entitlements: EntitlementService;
  billing: BillingService;
  providers: PaymentProviderRegistry;
}
