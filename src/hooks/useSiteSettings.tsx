import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SiteSetting {
  id: string;
  key: string;
  value: Record<string, any>;
  updated_at: string;
  updated_by: string | null;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) throw error;
      
      const settingsMap: Record<string, any> = {};
      data?.forEach((setting: SiteSetting) => {
        settingsMap[setting.key] = setting.value;
      });
      setSettings(settingsMap);
    } catch (error) {
      console.error('Error fetching site settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    // Subscribe to realtime changes for instant updates
    const channel = supabase
      .channel('site-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings'
        },
        () => {
          // Refetch settings when any change happens
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSettings]);

  const updateSetting = async (key: string, value: Record<string, any>) => {
    const { data: existing } = await supabase
      .from('site_settings')
      .select('id')
      .eq('key', key)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('site_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('site_settings')
        .insert({ key, value });
      if (error) throw error;
    }
    
    // Local update happens via realtime subscription
  };

  return {
    settings,
    loading,
    updateSetting,
    refetch: fetchSettings,
  };
}
