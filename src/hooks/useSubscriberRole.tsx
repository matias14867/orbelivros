import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useSubscriberRole() {
  const { user } = useAuth();
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRoles = async () => {
      if (!user) {
        setIsSubscriber(false);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) throw error;

        const roles = data?.map(r => r.role) || [];
        setIsSubscriber(roles.includes('subscriber'));
        setIsAdmin(roles.includes('admin'));
      } catch (error) {
        console.error('Error checking roles:', error);
        setIsSubscriber(false);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkRoles();
  }, [user]);

  const hasAccess = isSubscriber || isAdmin;

  return { isSubscriber, isAdmin, hasAccess, loading };
}
