import { and, desc, eq, gt, isNull, or, schema, type DbExecutor } from "@olnktr/db";
import { errors, systemClock, type Clock, type OwnerRef } from "@olnktr/types";
import {
  ENTITLEMENT_DEFINITIONS,
  mergeEntitlements,
  type BooleanEntitlementKey,
  type EntitlementKey,
  type EntitlementSet,
  type LimitEntitlementKey,
  type PartialEntitlementSet,
} from "@olnktr/validators/entitlements";
import type { SubscriptionStatus } from "@olnktr/validators";
import { ownerWhere } from "../owner";
import { accessSource, type AccessSource } from "../subscriptions/state-machine";

/**
 * Centralized entitlement engine.
 *
 * Resolution for a billing owner (a user or an organization):
 *   1. restrictive catalogue defaults
 *   2. ⊕ the plan of the subscription that currently grants access
 *      (active / trialing / past_due within grace / canceled within paid period),
 *      otherwise the default ("free") plan
 *   3. ⊕ unexpired manual overrides, oldest first
 *
 * Precedence between personal and organization entitlements is deterministic
 * and *resource-scoped*: an action on a resource is governed exclusively by the
 * entitlements of the resource's owner. Personal plans never lift organization
 * limits and organization plans never apply to members' personal resources.
 */
export interface QuotaScope {
  profileId?: string;
}

export type UsageResolver = (
  owner: OwnerRef,
  scope: QuotaScope,
  executor: DbExecutor,
) => Promise<number>;

export interface EntitlementResolution {
  owner: OwnerRef;
  planId: string;
  planKey: string;
  source: AccessSource | "default";
  subscriptionId: string | null;
  subscriptionStatus: SubscriptionStatus | null;
  overridesApplied: number;
  entitlements: EntitlementSet;
}

export interface QuotaStatus {
  key: LimitEntitlementKey;
  limit: number | null;
  used: number;
  /** null = unlimited */
  remaining: number | null;
}

export interface EntitlementService {
  resolve(owner: OwnerRef, executor?: DbExecutor): Promise<EntitlementResolution>;
  getUserEntitlements(userId: string, executor?: DbExecutor): Promise<EntitlementResolution>;
  getOrganizationEntitlements(
    organizationId: string,
    executor?: DbExecutor,
  ): Promise<EntitlementResolution>;
  checkEntitlement(
    owner: OwnerRef,
    key: BooleanEntitlementKey,
    executor?: DbExecutor,
  ): Promise<boolean>;
  assertEntitlement(
    owner: OwnerRef,
    key: BooleanEntitlementKey,
    executor?: DbExecutor,
  ): Promise<void>;
  getRemainingQuota(
    owner: OwnerRef,
    key: LimitEntitlementKey,
    scope?: QuotaScope,
    executor?: DbExecutor,
  ): Promise<QuotaStatus>;
  /**
   * Throws QUOTA_EXCEEDED when adding `increment` would exceed the limit. Call
   * inside the same transaction that performs the insert, after locking the
   * owner/parent row, to prevent concurrent over-allocation.
   */
  assertQuota(
    owner: OwnerRef,
    key: LimitEntitlementKey,
    options?: { scope?: QuotaScope; increment?: number; executor?: DbExecutor },
  ): Promise<QuotaStatus>;
  isBlockTypeAllowed(owner: OwnerRef, blockType: string, executor?: DbExecutor): Promise<boolean>;
  registerUsageResolver(key: LimitEntitlementKey, resolver: UsageResolver): void;
}

export interface EntitlementServiceDeps {
  db: DbExecutor;
  clock?: Clock;
}

export function hasLevel(actual: string, required: string, key: "analytics.level"): boolean {
  const levels = ENTITLEMENT_DEFINITIONS[key].values as readonly string[];
  return levels.indexOf(actual) >= levels.indexOf(required);
}

export function createEntitlementService(deps: EntitlementServiceDeps): EntitlementService {
  const clock = deps.clock ?? systemClock;
  const usageResolvers = new Map<LimitEntitlementKey, UsageResolver>();

  async function loadDefaultPlan(executor: DbExecutor) {
    const [plan] = await executor
      .select({
        id: schema.plans.id,
        key: schema.plans.key,
        entitlements: schema.plans.entitlements,
      })
      .from(schema.plans)
      .where(eq(schema.plans.isDefault, true))
      .limit(1);
    if (!plan) throw errors.internal("No default plan configured — run the database seed");
    return plan;
  }

  async function resolve(
    owner: OwnerRef,
    executor: DbExecutor = deps.db,
  ): Promise<EntitlementResolution> {
    const now = clock.now();
    const candidates = await executor
      .select({
        subscription: schema.subscriptions,
        planKey: schema.plans.key,
        planEntitlements: schema.plans.entitlements,
      })
      .from(schema.subscriptions)
      .innerJoin(schema.plans, eq(schema.plans.id, schema.subscriptions.planId))
      .where(ownerWhere(schema.subscriptions, owner))
      .orderBy(desc(schema.subscriptions.createdAt))
      .limit(10);

    let granted: { row: (typeof candidates)[number]; source: AccessSource } | null = null;
    for (const row of candidates) {
      const source = accessSource(row.subscription, now);
      if (source) {
        granted = { row, source };
        break;
      }
    }

    const overrides = await executor
      .select({ entitlements: schema.entitlementOverrides.entitlements })
      .from(schema.entitlementOverrides)
      .where(
        and(
          ownerWhere(schema.entitlementOverrides, owner),
          or(
            isNull(schema.entitlementOverrides.expiresAt),
            gt(schema.entitlementOverrides.expiresAt, now),
          ),
        ),
      )
      .orderBy(schema.entitlementOverrides.createdAt);

    const overrideLayers: PartialEntitlementSet[] = overrides.map(
      (override) => override.entitlements,
    );

    if (granted) {
      return {
        owner,
        planId: granted.row.subscription.planId,
        planKey: granted.row.planKey,
        source: granted.source,
        subscriptionId: granted.row.subscription.id,
        subscriptionStatus: granted.row.subscription.status,
        overridesApplied: overrideLayers.length,
        entitlements: mergeEntitlements(granted.row.planEntitlements, ...overrideLayers),
      };
    }

    const plan = await loadDefaultPlan(executor);
    const latest = candidates[0]?.subscription ?? null;
    return {
      owner,
      planId: plan.id,
      planKey: plan.key,
      source: "default",
      subscriptionId: latest?.id ?? null,
      subscriptionStatus: latest?.status ?? null,
      overridesApplied: overrideLayers.length,
      entitlements: mergeEntitlements(plan.entitlements, ...overrideLayers),
    };
  }

  async function getRemainingQuota(
    owner: OwnerRef,
    key: LimitEntitlementKey,
    scope: QuotaScope = {},
    executor: DbExecutor = deps.db,
  ): Promise<QuotaStatus> {
    const resolver = usageResolvers.get(key);
    if (!resolver) throw errors.internal(`No usage resolver registered for ${key}`);
    const [resolution, used] = await Promise.all([
      resolve(owner, executor),
      resolver(owner, scope, executor),
    ]);
    const limit = resolution.entitlements[key];
    return { key, limit, used, remaining: limit === null ? null : Math.max(0, limit - used) };
  }

  const service: EntitlementService = {
    resolve,
    getUserEntitlements: (userId, executor) => resolve({ type: "user", userId }, executor),
    getOrganizationEntitlements: (organizationId, executor) =>
      resolve({ type: "organization", organizationId }, executor),

    async checkEntitlement(owner, key, executor) {
      return (await resolve(owner, executor)).entitlements[key];
    },

    async assertEntitlement(owner, key, executor) {
      if (!(await service.checkEntitlement(owner, key, executor)))
        throw errors.entitlementRequired(key);
    },

    getRemainingQuota,

    async assertQuota(owner, key, options = {}) {
      const status = await getRemainingQuota(owner, key, options.scope, options.executor);
      const increment = options.increment ?? 1;
      if (status.limit !== null && status.used + increment > status.limit) {
        throw errors.quotaExceeded(key, status.limit);
      }
      return status;
    },

    async isBlockTypeAllowed(owner, blockType, executor) {
      const allowed = (await resolve(owner, executor)).entitlements["blocks.available_types"];
      return allowed.includes("*") || allowed.includes(blockType);
    },

    registerUsageResolver(key, resolver) {
      usageResolvers.set(key, resolver);
    },
  };
  return service;
}

export type { EntitlementKey };
