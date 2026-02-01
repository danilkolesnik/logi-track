export const USER_ROLES = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
] as const;

export const VALID_ROLE_VALUES = USER_ROLES.map((r) => r.value);
