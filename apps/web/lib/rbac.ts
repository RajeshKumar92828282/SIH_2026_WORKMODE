export function checkRole(role: string, requiredRole: 'admin' | 'api_consumer'): boolean {
  if (requiredRole === 'api_consumer') return true;
  return role === 'admin';
}
