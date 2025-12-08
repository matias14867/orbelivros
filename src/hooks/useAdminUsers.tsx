import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminUser {
  id: string;
  user_id: string;
  full_name: string | null;
  email?: string;
  created_at: string;
  role?: string;
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch profiles with their roles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch roles for each user
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const rolesMap = new Map<string, string>();
      roles?.forEach((r) => rolesMap.set(r.user_id, r.role));

      const usersWithRoles = profiles?.map((profile) => ({
        ...profile,
        role: rolesMap.get(profile.user_id) || 'user',
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const deleteUser = async (userId: string) => {
    // Delete profile - the user will remain in auth but profile/favorites/history will be deleted
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId);

    if (profileError) throw profileError;

    // Delete user roles
    const { error: rolesError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (rolesError) throw rolesError;

    // Delete favorites
    await supabase.from('favorites').delete().eq('user_id', userId);

    // Delete purchase history
    await supabase.from('purchase_history').delete().eq('user_id', userId);

    await fetchUsers();
  };

  return {
    users,
    loading,
    deleteUser,
    refetch: fetchUsers,
  };
}
