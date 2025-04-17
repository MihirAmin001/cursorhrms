import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type Role = 'admin' | 'hr' | 'manager' | 'employee';

interface UserProfile {
  id: string;
  email: string;
  role: Role;
}

export const useRBAC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('cursorhrms_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const hasPermission = (requiredRole: Role) => {
    if (!profile) return false;
    
    const roleHierarchy: Record<Role, number> = {
      'admin': 4,
      'hr': 3,
      'manager': 2,
      'employee': 1
    };

    return roleHierarchy[profile.role] >= roleHierarchy[requiredRole];
  };

  const isAdmin = () => hasPermission('admin');
  const isHR = () => hasPermission('hr');
  const isManager = () => hasPermission('manager');
  const isEmployee = () => hasPermission('employee');

  return {
    profile,
    loading,
    hasPermission,
    isAdmin,
    isHR,
    isManager,
    isEmployee
  };
}; 