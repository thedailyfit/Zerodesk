import { SetMetadata } from '@nestjs/common';

export type RoleType = 'SUPER_ADMIN' | 'ORG_ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles);
