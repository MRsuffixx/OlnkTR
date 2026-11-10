# Dependency rules

These rules are enforced by package `exports` maps, TypeScript, and ESLint
(`packages/config/eslint/base.js`).

1. **Layering.** A package depends only on packages in lower layers (see overview). No cycles.
2. **Public exports.** Import `@olnktr/<pkg>` or a declared subpath (`@olnktr/db/schema`,
   `@olnktr/validators/blocks`, ...). Patterns `@olnktr/*/src/*` are lint errors.
3. **Core modules.** Within `packages/core/src/modules`, `../<module>/<file>` imports are
   lint errors (regex rule); use `../<module>/index`. `../../shared/*` is allowed.
4. **Apps are leaves.** Nothing imports from `apps/*`.
5. **Client bundles** import only isomorphic packages (`validators`, `ui`, `config/constants`,
   `auth/client`, and _types_ from `api/trpc`). Server-only modules use `server-only`.
6. **Third-party SDKs stay behind ports.** Stripe, AWS SDK, nodemailer, BullMQ, Better Auth
   are imported only by their owning package (`billing`, `storage`, `email`, `jobs`, `auth`).

Adding a dependency between packages: update `package.json`, respect the layer order and
document the reason in the package README/docs if it is not obvious.
