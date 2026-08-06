'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF';

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('ADMIN');
  return (
    <RoleContext.Provider value={{
      role, setRole,
      isSuperAdmin: role === 'SUPER_ADMIN',
      isAdmin: role === 'ADMIN' || role === 'SUPER_ADMIN',
      isManager: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(role),
      isStaff: true, // all roles have staff access
    }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    return {
      role: 'ADMIN' as Role,
      setRole: () => {},
      isSuperAdmin: false,
      isAdmin: true,
      isManager: true,
      isStaff: true,
    };
  }
  return ctx;
}
