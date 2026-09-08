/**
 * Centralized role & permission model.
 *
 * The three product experiences are deliberately distinct:
 *   - CUSTOMER    → public storefront (shopping only)
 *   - DISTRIBUTOR → operations portal (own business)
 *   - SUPER_ADMIN → platform control plane (everything)
 *
 * UI visibility is NOT the security boundary — the backend/auth provider must
 * enforce authorization too. This module only keeps role-aware UI consistent
 * and auditable instead of scattering `if (role === ...)` across components.
 */

export type Role = 'CUSTOMER' | 'DISTRIBUTOR' | 'SUPER_ADMIN';

export type Permission =
  // Customer / storefront
  | 'STORE_BROWSE'
  | 'STORE_ORDER'
  | 'STORE_REVIEW'
  // Distributor — own business only
  | 'MANAGE_OWN_STORE'
  | 'MANAGE_OWN_INVENTORY'
  | 'MANAGE_OWN_SALES'
  | 'VIEW_OWN_CRM'
  | 'VIEW_OWN_GOALS'
  | 'MANAGE_PAYMENT_ACCOUNT'
  | 'VIEW_OWN_PROFILE'
  | 'MANAGE_OWN_SECURITY'
  // Super admin — platform-wide
  | 'VIEW_PLATFORM_DASHBOARD'
  | 'MANAGE_ALL_PRODUCTS'
  | 'MANAGE_ALL_DISTRIBUTORS'
  | 'VIEW_ALL_SALES'
  | 'MANAGE_LOANS'
  | 'MANAGE_CASH_FLOW'
  | 'MANAGE_REVIEWS'
  | 'MANAGE_SYSTEM_SETTINGS'
  | 'MANAGE_BACKUPS'
  | 'MANAGE_ADMIN_SECURITY';

const PERMISSIONS: Record<Role, readonly Permission[]> = {
  CUSTOMER: ['STORE_BROWSE', 'STORE_ORDER', 'STORE_REVIEW'],
  DISTRIBUTOR: [
    'STORE_BROWSE',
    'STORE_ORDER',
    'MANAGE_OWN_STORE',
    'MANAGE_OWN_INVENTORY',
    'MANAGE_OWN_SALES',
    'VIEW_OWN_CRM',
    'VIEW_OWN_GOALS',
    'MANAGE_PAYMENT_ACCOUNT',
    'VIEW_OWN_PROFILE',
    'MANAGE_OWN_SECURITY',
  ],
  SUPER_ADMIN: [
    'STORE_BROWSE',
    'STORE_ORDER',
    'STORE_REVIEW',
    'VIEW_PLATFORM_DASHBOARD',
    'MANAGE_ALL_PRODUCTS',
    'MANAGE_ALL_DISTRIBUTORS',
    'VIEW_ALL_SALES',
    'MANAGE_LOANS',
    'MANAGE_CASH_FLOW',
    'MANAGE_REVIEWS',
    'MANAGE_SYSTEM_SETTINGS',
    'MANAGE_BACKUPS',
    'MANAGE_ADMIN_SECURITY',
  ],
};

export function can(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAny(role: Role | null | undefined, permissions: readonly Permission[]): boolean {
  return permissions.some((p) => can(role, p));
}

/** Labels used for UI copy; keep terminology role-appropriate. */
export const ROLE_LABEL: Record<Role, string> = {
  CUSTOMER: 'Customer',
  DISTRIBUTOR: 'Distributor',
  SUPER_ADMIN: 'Super Admin',
};