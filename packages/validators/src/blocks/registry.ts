import type { z } from "zod";

/**
 * Block type registry.
 *
 * Every block type is described by a `BlockDefinition`: a stable type
 * identifier, the current config version, a Zod schema for that version, a
 * default config, and optional migrations from older versions. Block rows store
 * `(type, schemaVersion, config JSONB)`; reading a row runs any pending
 * migrations and validates the result, so old rows never break new code.
 *
 * Adding a new block type = adding one definition file and registering it in
 * `./index.ts`. Existing block types are untouched.
 */
export type BlockCategory = "content" | "media" | "embed" | "layout";

export interface BlockDefinition<TSchema extends z.ZodType = z.ZodType> {
  readonly type: string;
  readonly version: number;
  readonly category: BlockCategory;
  readonly schema: TSchema;
  readonly defaultConfig: z.output<TSchema>;
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
