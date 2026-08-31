import { db } from './db';
import { hashPassword, verifyPassword } from './auth';

export type StoredUserRole = 'admin' | 'analyst';

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  role: StoredUserRole;
  createdAt: Date;
}

type DatabaseStore = typeof db;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findStoredUserByEmail(email: string, store: DatabaseStore = db): Promise<StoredUser | null> {
  const normalizedEmail = normalizeEmail(email);
  return (await store.user.findUnique({
    where: { email: normalizedEmail }
  })) as StoredUser | null;
}

export async function createStoredUser(
  email: string,
  password: string,
  role: StoredUserRole = 'analyst',
  store: DatabaseStore = db
): Promise<StoredUser> {
  const normalizedEmail = normalizeEmail(email);

  const existingUser = await findStoredUserByEmail(normalizedEmail, store);
  if (existingUser) {
    return existingUser;
  }

  return (await store.user.create({
    data: {
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      role
    }
  })) as StoredUser;
}

export async function validateStoredCredentials(
  email: string,
  password: string,
  store: DatabaseStore = db
): Promise<StoredUser | null> {
  const user = await findStoredUserByEmail(email, store);
  if (!user) return null;

  const isValid = verifyPassword(password, user.passwordHash);
  if (!isValid) return null;

  return user;
}

export async function listStoredUsers(store: DatabaseStore = db): Promise<StoredUser[]> {
  return (await store.user.findMany({
    orderBy: { createdAt: 'desc' }
  })) as StoredUser[];
}
