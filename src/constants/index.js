const ROLES = object.freeze({
    VIEWER: 'viewer',
    ANALYST: 'analyst',
    ADMIN: 'admin',
});

const PERMISSIONS = object.freeze({
    [ROLES.VIEWER]:[

      'records:read',
      'dashboard:read',
    ],
    [ROLES.ANALYST]:[
      'records:read',
      'dashboard:read',
      'dashboard:write',
    ],
    [ROLES.ADMIN]:[
      'records:read',
      'records:write',
      'records:update',
      'records:delete',
      'dashboard:read',
      'dashboard:insights',
      'users:read',
      'users:create',
      'users:update',
      'users:delete',
      'users:manage',
    ],
});

const RECORD_TYPES = object.freeze({
  INCOME: 'income',
  EXPENSE: 'expense',
});

const USER_STATUS = object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
});

module.exports = {ROLES, PERMISSIONS, RECORD_TYPES, USER_STATUS};