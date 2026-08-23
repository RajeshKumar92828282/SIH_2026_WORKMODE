import crypto from 'crypto';
import { db } from './db';

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export function generateApiKey(orgId: string): { apiKey: string; keyHash: string; keyMask: string } {
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const apiKey = `apix_live_${randomBytes}`;
  const keyHash = hashApiKey(apiKey);
  const keyMask = `apix_live_...${randomBytes.slice(-4)}`;
  return { apiKey, keyHash, keyMask };
}

export async function verifyApiKey(bearerHeader: string | null) {
  if (!bearerHeader || !bearerHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid Authorization header format. Expected Bearer <token>' };
  }

  const token = bearerHeader.split(' ')[1];
  const keyHash = hashApiKey(token);

  const apiKeyRecord = await db.apiKey.findUnique({
    where: { keyHash }
  });

  if (!apiKeyRecord) {
    return { valid: false, error: 'Invalid API key provided.' };
  }

  if (apiKeyRecord.revokedAt) {
    return { valid: false, error: 'API key has been revoked.' };
  }

  return {
    valid: true,
    keyRecord: apiKeyRecord
  };
}
