import type { z } from "zod";

/**
 * Block type registry.
 *
 * Every block type is described by a `BlockDefinition`: a stable type
 * identifier, the current config version, a Zod schema for that version, a
 * default config, its catalogue group, its plan tier, and migrations from older
 * versions. Block rows store `(type, schemaVersion, config JSONB)`; reading a
 * row runs pending migrations and validates the result, so old rows never
 * break new code.
 *
 * Adding a block type = one definition here + one renderer + one editor
 * descriptor in the web app. Existing block types are untouched.
 */
export const BLOCK_GROUPS = ["essential", "media", "community", "business"] as const;
export type BlockGroup = (typeof BLOCK_GROUPS)[number];

/**
 * `basic` types are in the default `blocks.available_types` entitlement (Free
 * plan); `premium` types must be granted by the plan. Plans remain the source
 * of truth — the tier only seeds the default.
 */
export type BlockTier = "basic" | "premium";

export interface BlockDefinition<TSchema extends z.ZodType = z.ZodType> {
  readonly type: string;
  readonly version: number;
  readonly group: BlockGroup;
  readonly tier: BlockTier;
  readonly schema: TSchema;
  /**
   * Starting config for a new block. It may be intentionally incomplete (no
   * image chosen yet, empty URL…); drafts store it as-is and publishing
   * validates it against `schema`.
   */
  readonly defaultConfig: Readonly<Record<string, unknown>>;
  /**
   * Migrations keyed by the version they upgrade *from*. `migrations[1]`
   * turns a v1 config into a v2 config, and so on up to `version`.
   */
  readonly migrations?: Readonly<Record<number, (config: unknown) => unknown>>;
  /** Blocks that reference other aggregates (e.g. links) cannot be created generically. */
  readonly managedBy?: "links";
}

export function defineBlock<TSchema extends z.ZodType>(
  definition: BlockDefinition<TSchema>,
): BlockDefinition<TSchema> {
  for (let from = 1; from < definition.version; from++) {
    if (!definition.migrations?.[from]) {
      throw new Error(`Block "${definition.type}" is missing a migration from v${from}`);
    }
  }
  return definition;
}

export class BlockRegistry {
  private readonly definitions = new Map<string, BlockDefinition>();

  register(definition: BlockDefinition): this {
    if (this.definitions.has(definition.type)) {
      throw new Error(`Block type "${definition.type}" is already registered`);
    }
    this.definitions.set(definition.type, definition);
    return this;
  }

  get(type: string): BlockDefinition | undefined {
    return this.definitions.get(type);
  }

  require(type: string): BlockDefinition {
    const definition = this.get(type);
    if (!definition) throw new UnknownBlockTypeError(type);
    return definition;
  }

  has(type: string): boolean {
    return this.definitions.has(type);
  }

  types(): string[] {
    return [...this.definitions.keys()];
  }

  list(): BlockDefinition[] {
    return [...this.definitions.values()];
  }

  /** Validate a config submitted for the *current* version of a block type. */
  parseInput(type: string, config: unknown): { version: number; config: unknown } {
    const definition = this.require(type);
    return { version: definition.version, config: definition.schema.parse(config) };
  }

  /** Non-throwing variant of `parseInput` returning Zod issues. */
  safeParseInput(type: string, config: unknown) {
    const definition = this.get(type);
    if (!definition) return { success: false as const, issues: [] as z.core.$ZodIssue[] };
    const result = definition.schema.safeParse(config);
    return result.success
      ? { success: true as const, version: definition.version, config: result.data }
      : { success: false as const, issues: result.error.issues };
  }

  /**
   * Upgrade a stored config to the current version and validate it.
   * Throws when the stored data is invalid or from a future version.
   */
  parseStored(
    type: string,
    storedVersion: number,
    config: unknown,
  ): { version: number; config: unknown } {
    const definition = this.require(type);
    if (storedVersion > definition.version) {
      throw new Error(
        `Block "${type}" config v${storedVersion} is newer than supported v${definition.version}`,
      );
    }
    let current = config;
    for (let from = storedVersion; from < definition.version; from++) {
      const migrate = definition.migrations?.[from];
      if (!migrate) throw new Error(`Block "${type}" cannot migrate from v${from}`);
      current = migrate(current);
    }
    return { version: definition.version, config: definition.schema.parse(current) };
  }
}

export class UnknownBlockTypeError extends Error {
  constructor(readonly type: string) {
    super(`Unknown block type "${type}"`);
    this.name = "UnknownBlockTypeError";
  }
}
