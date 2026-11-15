import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const SALT_BYTES = 16;
const KEY_BYTES = 64;
const SCHEME = 'scrypt';

function deriveKey(password: string, salt: Buffer, keyLength: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, (error, key) => (error ? reject(error) : resolve(key)));
  });
}

// Stored as "scrypt$<salt base64>$<key base64>" so the salt travels with the hash.
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const key = await deriveKey(password, salt, KEY_BYTES);
  return [SCHEME, salt.toString('base64'), key.toString('base64')].join('$');
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [scheme, saltBase64, keyBase64] = storedHash.split('$');
  if (scheme !== SCHEME || !saltBase64 || !keyBase64) return false;

  const expectedKey = Buffer.from(keyBase64, 'base64');
  const actualKey = await deriveKey(
    password,
    Buffer.from(saltBase64, 'base64'),
    expectedKey.length,
  );
  return timingSafeEqual(actualKey, expectedKey);
}
