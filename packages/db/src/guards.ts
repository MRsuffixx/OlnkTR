/**
 * Refuses to operate on anything but a dedicated test database so integration
 * tests can never damage development or production data.
 */
export function assertTestDatabaseUrl(url: string): void {
  const name = new URL(url).pathname.replace(/^\//, "");
  if (!name.endsWith("_test")) {
    throw new Error(`Refusing to use database "${name}" for tests: the name must end with "_test"`);
  }
}
