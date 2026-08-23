import crypto from 'crypto';
import { db } from './db';

// --- Password Hashing & Verification ---

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

// --- API Key Management ---

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

export async function verifyApiKey(bearerHeader: string | null, requiredScope?: string) {
  if (!bearerHeader || !bearerHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid Authorization header format. Expected Bearer <token>' };
  }

  const token = bearerHeader.split(' ')[1];
  const keyHash = hashApiKey(token);

  const apiKeyRecord = await db.apiKey.findUnique({
    where: { keyHash },
    include: {
      organization: true
    }
  });

  if (!apiKeyRecord) {
    return { valid: false, error: 'Invalid API key provided.' };
  }

  if (apiKeyRecord.revokedAt) {
    return { valid: false, error: 'API key has been revoked.' };
  }

  if (requiredScope && !apiKeyRecord.scope.includes(requiredScope) && !apiKeyRecord.scope.includes('admin') && !apiKeyRecord.scope.includes('*')) {
    return { valid: false, error: `API key lacks required scope: ${requiredScope}` };
  }

  return {
    valid: true,
    keyRecord: apiKeyRecord,
    organization: apiKeyRecord.organization
  };
}

// --- Audit Logging ---

export async function createAuditLog(actor: string, action: string, target: string) {
  try {
    return await db.auditLog.create({
      data: {
        actor,
        action,
        target
      }
    });
  } catch (err) {
    console.error('[AUDIT LOG ERROR] Failed to record audit log:', err);
    return null;
  }
}

