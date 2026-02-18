import { Role } from './rbacService';

export interface TenantInfo {
  id: string;
  name?: string;
  role: Role;
}

const STORAGE_KEY = 'wpm_current_tenant';

const sanitizeTenantId = (id?: string): string => {
  if (!id) return 'public';
  const cleaned = id.toString().trim().toLowerCase().replace(/[^a-z0-9_-]/gi, '');
  return cleaned || 'public';
};

const mapUserRoleToRbac = (role?: string): Role => {
  if (role === 'ADMIN') return 'ADMIN';
  if (role === 'MANAGER') return 'MANAGER';
  if (role === 'CLIENT') return 'CLIENT';
  if (role === 'VIEWER') return 'VIEWER';
  if (role === 'USER') return 'MANAGER';
  return 'VIEWER';
};

const deriveTenantFromUser = (user?: { id?: string; companyName?: string; role?: string; tenantId?: string }): TenantInfo => {
  const tenantId = sanitizeTenantId(user?.tenantId || user?.companyName || user?.id || 'public');
  return {
    id: tenantId,
    name: user?.companyName || 'Demo Tenant',
    role: mapUserRoleToRbac(user?.role)
  };
};

export const TenantService = {
  getCurrentTenant(): TenantInfo {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as TenantInfo;
        return {
          id: sanitizeTenantId(parsed.id),
          name: parsed.name,
          role: mapUserRoleToRbac(parsed.role)
        };
      }
    } catch {}
    return { id: 'public', name: 'Demo Tenant', role: 'VIEWER' };
  },

  setTenant(tenant: TenantInfo): TenantInfo {
    const nextTenant: TenantInfo = {
      id: sanitizeTenantId(tenant.id),
      name: tenant.name || 'Demo Tenant',
      role: mapUserRoleToRbac(tenant.role)
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTenant));
    return nextTenant;
  },

  setTenantFromUser(user?: { id?: string; companyName?: string; role?: string }): TenantInfo {
    const derived = deriveTenantFromUser(user);
    return this.setTenant(derived);
  },

  scopeKey(baseKey: string, tenantId?: string): string {
    const tenant = sanitizeTenantId(tenantId || this.getCurrentTenant().id);
    return `${baseKey}__tenant_${tenant}`;
  }
};
