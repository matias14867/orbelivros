import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Contact {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const createContact = async (contact: {
    name: string;
    email: string;
    subject: string;
    message: string;
    user_id?: string;
  }) => {
    const { error } = await supabase.from('contacts').insert(contact);
    if (error) throw error;
  };

  const updateContactStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('contacts')
      .update({ 
        status, 
        resolved_at: status === 'resolved' ? new Date().toISOString() : null 
      })
      .eq('id', id);

    if (error) throw error;
    await fetchContacts();
  };

  const deleteContact = async (id: string) => {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) throw error;
    await fetchContacts();
  };

  return {
    contacts,
    loading,
    createContact,
    updateContactStatus,
    deleteContact,
    refetch: fetchContacts,
  };
}
