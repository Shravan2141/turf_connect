/**
 * Auth configuration for admin and user roles.
 * Admin emails are read from NEXT_PUBLIC_ADMIN_EMAIL (comma-separated for multiple admins).
 */

export function getAdminEmails(): string[] {
  const env = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim();
  if (!env) return [];
  return env.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}
