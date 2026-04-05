const ROLES = Object.freeze({
  VIEWER:  'viewer',
  ANALYST: 'analyst',
  ADMIN:   'admin',
});

const PERMISSIONS = Object.freeze({
  [ROLES.VIEWER]: [
    'records:read',
    'dashboard:read',
  ],
  [ROLES.ANALYST]: [
    'records:read',
    'dashboard:read',
    'dashboard:insights',
  ],
  [ROLES.ADMIN]: [
    'records:read',
    'records:create',
    'records:update',
    'records:delete',
    'dashboard:read',
    'dashboard:insights',
    'users:read',
    'users:create',
    'users:update',
    'users:delete',
  ],
});

const RECORD_TYPES = Object.freeze({
  INCOME:  'income',
  EXPENSE: 'expense',
});

const USER_STATUS = Object.freeze({
  ACTIVE:   'active',
  INACTIVE: 'inactive',
});

module.exports = { ROLES, PERMISSIONS, RECORD_TYPES, USER_STATUS };