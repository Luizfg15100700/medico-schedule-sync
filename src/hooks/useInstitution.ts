
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Institution {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  institution_type: 'university' | 'college' | 'school' | 'technical';
}

interface InstitutionUser {
  id: string;
  user_id: string;
  institution_id: string;
  role: 'admin' | 'coordinator' | 'teacher' | 'staff';
  is_approved: boolean;
}

export function useInstitution() {
  const [currentInstitution, setCurrentInstitution] = useState<Institution | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserInstitution();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserInstitution = async () => {
    if (!user) return;

    try {
      // Buscar a relação do usuário com instituições
      const { data: institutionUser } = await supabase
        .from('institution_users')
        .select(`
          *,
          institutions (*)
        `)
        .eq('user_id', user.id)
        .eq('is_approved', true)
        .single();

      if (institutionUser) {
        // Type cast the institution data to ensure TypeScript compatibility
        const institution = institutionUser.institutions as Institution;
        setCurrentInstitution(institution);
        setUserRole(institutionUser.role);
      }
    } catch (error) {
      console.error('Erro ao buscar instituição:', error);
    } finally {
      setLoading(false);
    }
  };

  const createInstitution = async (institutionData: Omit<Institution, 'id'>) => {
    if (!user) return { error: 'Usuário não autenticado' };

    try {
      const { data, error } = await supabase
        .from('institutions')
        .insert(institutionData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Instituição criada",
        description: "Sua instituição foi criada com sucesso!",
      });

      await fetchUserInstitution();
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao criar instituição",
        description: error.message,
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  return {
    currentInstitution,
    userRole,
    loading,
    createInstitution,
    refetch: fetchUserInstitution
  };
}
