import { describe, it, expect } from 'node:test';
import { createStoredUser, findStoredUserByEmail, validateStoredCredentials } from './backend-store';

describe('backend store auth flow', () => {
  it('creates, finds, and validates a user record in the database-backed store', async () => {
    const email = `user-${Date.now()}@example.com`;
    const mockStore = {
      user: {
        findUnique: async ({ where }: { where: { email: string } }) => {
          const record = mockStore._records[where.email];
          return record ? { ...record } : null;
        },
        create: async ({ data }: { data: any }) => {
          mockStore._records[data.email] = { ...data, id: `user_${Date.now()}` };
          return { ...mockStore._records[data.email] };
        }
      },
      auditLog: {
        create: async ({ data }: { data: any }) => data
      },
      _records: {} as Record<string, any>
    };

    const created = await createStoredUser(email, 'Password123!', 'analyst', mockStore as any);
    expect(created.email).toBe(email.toLowerCase());
    expect(created.role).toBe('analyst');

    const found = await findStoredUserByEmail(email, mockStore as any);
    expect(found?.email).toBe(email.toLowerCase());

    const validUser = await validateStoredCredentials(email, 'Password123!', mockStore as any);
    expect(validUser?.email).toBe(email.toLowerCase());

    const invalidUser = await validateStoredCredentials(email, 'WrongPassword!', mockStore as any);
    expect(invalidUser).toBeNull();
  });
});
