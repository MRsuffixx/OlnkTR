import "server-only";

import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

export async function hashLinkPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyLinkPassword(password: string, encoded: string) {
  const [algorithm, salt, digest] = encoded.split("$");
  if (algorithm !== "scrypt" || !salt || !digest) return false;
  const expected = Buffer.from(digest, "hex");
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
