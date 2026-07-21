import "server-only";

import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const MAX_CONCURRENT_VERIFICATIONS = 4;
let activeVerifications = 0;

export class PasswordVerificationBusyError extends Error {}

export async function hashLinkPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyLinkPassword(password: string, encoded: string) {
  if (password.length < 6 || password.length > 72) return false;
  if (activeVerifications >= MAX_CONCURRENT_VERIFICATIONS)
    throw new PasswordVerificationBusyError();
  const [algorithm, salt, digest] = encoded.split("$");
  if (algorithm !== "scrypt" || !salt || !digest) return false;
  activeVerifications += 1;
  try {
    const expected = Buffer.from(digest, "hex");
    const actual = (await scrypt(password, salt, expected.length)) as Buffer;
    return (
      actual.length === expected.length && timingSafeEqual(actual, expected)
    );
  } finally {
    activeVerifications -= 1;
  }
}
