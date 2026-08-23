export type Role = 'admin' | 'analyst';

export function checkRole(role: string, requiredRole: Role): boolean {
  if (role === 'admin') return true; // Admin has full privileges
  return role === requiredRole;
}

export function isAdmin(role?: string | null): boolean {
  return role === 'admin';
}

export function isAnalyst(role?: string | null): boolean {
  return role === 'analyst' || role === 'admin';
}

