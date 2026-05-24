import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

type AdminRole = 'superadmin' | 'state_admin' | 'district_admin';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  state?: string;
  district?: string;
}

interface AuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  login: (userData: AdminUser, token: string) => void;
  logout: () => void;
  can: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const permissionsMatrix: Record<AdminRole, string[]> = {
  superadmin: ['all'],
  state_admin: [
    'issues.view', 'issues.update_status', 'issues.assign',
    'citizens.view', 'citizens.block',
    'posts.moderate',
    'admins.create_district', 'admins.view',
    'analytics.state',
  ],
  district_admin: [
    'issues.view', 'issues.update_status', 'issues.assign',
    'citizens.view',
    'posts.moderate',
    'analytics.district',
  ]
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        // Ideally we would fetch /admin/auth/me here
        const storedAdmin = localStorage.getItem('adminData');
        if (storedAdmin) {
          setAdmin(JSON.parse(storedAdmin));
        }
      } catch (e) {
        console.error(e);
        logout();
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = (userData: AdminUser, token: string) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminData', JSON.stringify(userData));
    setAdmin(userData);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setAdmin(null);
    toast.success('Logged out successfully');
  };

  const can = (permission: string) => {
    if (!admin) return false;
    const perms = permissionsMatrix[admin.role];
    if (perms.includes('all')) return true;
    return perms.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAdmin = () => useContext(AuthContext);
