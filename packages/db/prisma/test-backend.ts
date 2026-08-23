import { hashPassword, verifyPassword, hashApiKey, generateApiKey } from '../../../apps/web/lib/auth';
import { checkRole, isAdmin, isAnalyst } from '../../../apps/web/lib/rbac';
import { RegisterUserSchema, CreateOrgSchema, UpdateUserRoleSchema, CreateApiKeySchema, ObservationsQuerySchema } from '../../../apps/web/lib/validation';


function runTests() {
  console.log('--- Running APIx Backend Unit Tests ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Password Hashing & Verification
  const pwd = 'StrongPassword123!';
  const hashed = hashPassword(pwd);
  assert(hashed.includes(':'), 'Password hash contains salt delimiter');
  assert(verifyPassword(pwd, hashed), 'Password verifies correctly with valid password');
  assert(!verifyPassword('WrongPassword', hashed), 'Password verification fails with incorrect password');

  // 2. API Key Generation & Hashing
  const { apiKey, keyHash, keyMask } = generateApiKey('org_rbi');
  assert(apiKey.startsWith('apix_live_'), 'Generated API key has apix_live_ prefix');
  assert(keyMask.startsWith('apix_live_...'), 'Generated key mask has expected format');
  assert(hashApiKey(apiKey) === keyHash, 'SHA-256 hash matches generateApiKey output');

  // 3. RBAC checks
  assert(isAdmin('admin'), 'isAdmin returns true for admin');
  assert(!isAdmin('analyst'), 'isAdmin returns false for analyst');
  assert(isAnalyst('analyst'), 'isAnalyst returns true for analyst');
  assert(isAnalyst('admin'), 'isAnalyst returns true for admin (hierarchical)');
  assert(checkRole('analyst', 'analyst'), 'checkRole returns true for exact role match');

  // 4. Zod Schemas
  const validReg = RegisterUserSchema.safeParse({ email: 'analyst@rbi.org.in', password: 'password123' });
  assert(validReg.success, 'RegisterUserSchema succeeds with valid analyst payload');

  const invalidRegRole = (RegisterUserSchema.shape as any).role;
  assert(!invalidRegRole, 'RegisterUserSchema does not contain role field (strict security rule)');

  const validOrg = CreateOrgSchema.safeParse({ name: 'Reserve Bank of India', type: 'rbi', contactEmail: 'contact@rbi.org.in' });
  assert(validOrg.success, 'CreateOrgSchema succeeds with valid org payload');

  const validRoleUpdate = UpdateUserRoleSchema.safeParse({ role: 'admin' });
  assert(validRoleUpdate.success, 'UpdateUserRoleSchema accepts admin');

  const invalidRoleUpdate = UpdateUserRoleSchema.safeParse({ role: 'superadmin' });
  assert(!invalidRoleUpdate.success, 'UpdateUserRoleSchema rejects invalid role');

  const validObs = ObservationsQuerySchema.safeParse({ route: 'DEL-BOM', leadTime: 'T+1', page: 2, limit: 25 });
  assert(validObs.success, 'ObservationsQuerySchema parses query parameters correctly');

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests();
