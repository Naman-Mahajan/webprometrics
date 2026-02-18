// Role-Based Access Control Service

export type Role = 'ADMIN' | 'MANAGER' | 'CLIENT' | 'VIEWER';
export type Permission = 
  | 'view_dashboard'
  | 'view_reports'
  | 'create_reports'
  | 'edit_reports'
  | 'delete_reports'
  | 'view_clients'
  | 'manage_clients'
  | 'view_integrations'
  | 'manage_integrations'
  | 'view_billing'
  | 'manage_billing'
  | 'manage_users'
  | 'export_data'
  | 'view_settings'
  | 'manage_settings';

export interface RolePermissions {
  role: Role;
  permissions: Permission[];
  description: string;
}

const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'ADMIN',
    permissions: [
      'view_dashboard',
      'view_reports',
      'create_reports',
      'edit_reports',
      'delete_reports',
      'view_clients',
      'manage_clients',
      'view_integrations',
      'manage_integrations',
      'view_billing',
      'manage_billing',
      'manage_users',
      'export_data',
      'view_settings',
      'manage_settings'
    ],
    description: 'Full access to all features and settings'
  },
  {
    role: 'MANAGER',
    permissions: [
      'view_dashboard',
      'view_reports',
      'create_reports',
      'edit_reports',
      'view_clients',
      'manage_clients',
      'view_integrations',
      'export_data',
      'view_settings'
    ],
    description: 'Can manage clients and reports, view billing'
  },
  {
    role: 'CLIENT',
    permissions: [
      'view_dashboard',
      'view_reports',
      'export_data'
    ],
    description: 'Can only view their own reports and data'
  },
  {
    role: 'VIEWER',
    permissions: [
      'view_dashboard',
      'view_reports'
    ],
    description: 'Read-only access to reports'
  }
];

export interface UserPermissions {
  userId: string;
  role: Role;
  clientId?: string; // For CLIENT role, restrict to specific client
  permissions: Permission[];
}

export const RBACService = {
  getRolePermissions(role: Role): Permission[] {
    const roleConfig = ROLE_PERMISSIONS.find(r => r.role === role);
    return roleConfig?.permissions || [];
  },

  hasPermission(userRole: Role, permission: Permission): boolean {
    const permissions = this.getRolePermissions(userRole);
    return permissions.includes(permission);
  },

  canAccessResource(userRole: Role, userId: string, resourceOwnerId?: string): boolean {
    if (userRole === 'ADMIN') return true;
    if (userRole === 'MANAGER') return true;
    if (userRole === 'CLIENT' && resourceOwnerId) {
      return userId === resourceOwnerId;
    }
    return false;
  },

  getUserPermissions(role: Role, clientId?: string): UserPermissions {
    return {
      userId: '', // Set by caller
      role,
      clientId,
      permissions: this.getRolePermissions(role)
    };
  },

  canPerformAction(userRole: Role, action: Permission, resourceOwnerId?: string, userId?: string): boolean {
    // Check base permission
    if (!this.hasPermission(userRole, action)) return false;

    // Additional checks for CLIENT role
    if (userRole === 'CLIENT' && resourceOwnerId && userId) {
      return resourceOwnerId === userId;
    }

    return true;
  },

  getAllRoles(): RolePermissions[] {
    return ROLE_PERMISSIONS;
  },

  // Feature flags based on subscription
  getFeatureAccess(subscriptionPlan: string): Record<string, boolean> {
    const features: Record<string, Record<string, boolean>> = {
      'starter': {
        'white_label': false,
        'api_access': false,
        'advanced_analytics': false,
        'custom_domain': false,
        'client_portal': false,
        'sso': false,
        'priority_support': false
      },
      'agency': {
        'white_label': true,
        'api_access': false,
        'advanced_analytics': true,
        'custom_domain': true,
        'client_portal': true,
        'sso': false,
        'priority_support': true
      },
      'enterprise': {
        'white_label': true,
        'api_access': true,
        'advanced_analytics': true,
        'custom_domain': true,
        'client_portal': true,
        'sso': true,
        'priority_support': true
      }
    };

    return features[subscriptionPlan.toLowerCase()] || features['starter'];
  }
};

// Client Portal Access Tokens
export interface PortalToken {
  token: string;
  clientId: string;
  expiresAt: string;
  createdAt: string;
}

export const PortalService = {
  generatePortalToken(clientId: string, expiryDays: number = 30): PortalToken {
    const token = 'portal_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    return {
      token,
      clientId,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString()
    };
  },

  validateToken(token: string, clientId: string): boolean {
    // Mock validation - in production verify against database
    return token.startsWith('portal_') && token.length > 20;
  },

  getPortalUrl(clientId: string, token: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/portal/${clientId}?token=${token}`;
  }
};
