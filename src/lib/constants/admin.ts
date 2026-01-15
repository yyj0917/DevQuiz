/**
 * Admin Email Whitelist
 * Only these emails can access the admin panel
 */
export const ADMIN_EMAILS = ['vmap1356@naver.com'] as const;

/**
 * Check if an email is authorized for admin access
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email as (typeof ADMIN_EMAILS)[number]);
}
