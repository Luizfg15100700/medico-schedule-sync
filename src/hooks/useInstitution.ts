
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
      setCurrentInstitution(null);
      setUserRole(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserInstitution = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Buscando instituição do usuário:', user.id);
      
      // Buscar a relação do usuário com instituições usando join
      const { data: institutionUser, error } = await supabase
        .from('institution_users')
        .select(`
          *,
          institutions (*)
        `)
        .eq('user_id', user.id)
        .eq('is_approved', true)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar instituição:', error);
        return;
      }

      console.log('Dados retornados:', institutionUser);

      if (institutionUser && institutionUser.institutions) {
        // Type cast and validate the institution data
        const institution = institutionUser.institutions as any;
        
        // Ensure institution_type is properly typed
        const typedInstitution: Institution = {
          ...institution,
          institution_type: institution.institution_type as Institution['institution_type']
        };
        
        setCurrentInstitution(typedInstitution);
        setUserRole(institutionUser.role);
        console.log('Instituição carregada:', typedInstitution);
      } else {
        console.log('Nenhuma instituição encontrada para o usuário');
        setCurrentInstitution(null);
        setUserRole(null);
      }
    } catch (error) {
      console.error('Erro inesperado ao buscar instituição:', error);
    } finally {
      setLoading(false);
    }
  };

  const createInstitution = async (institutionData: Omit<Institution, 'id'>) => {
    if (!user) {
      const error = 'Usuário não autenticado';
      toast({
        title: "Erro",
        description: error,
        variant: "destructive"
      });
      return { data: null, error };
    }

    console.log('Criando instituição:', institutionData);
    setLoading(true);

    try {
      // Criar a instituição (o trigger automaticamente criará a relação com o usuário)
      const { data: institution, error: institutionError } = await supabase
        .from('institutions')
        .insert(institutionData)
        .select()
        .single();

      if (institutionError) {
        console.error('Erro ao criar instituição:', institutionError);
        throw institutionError;
      }

      console.log('Instituição criada:', institution);

      // Recarregar os dados da instituição após um pequeno delay para garantir que o trigger foi executado
      setTimeout(() => {
        fetchUserInstitution();
      }, 1000);

      toast({
        title: "Sucesso!",
        description: "Sua instituição foi criada com sucesso!",
      });

      return { data: institution, error: null };
    } catch (error: any) {
      console.error('Erro detalhado ao criar instituição:', error);
      
      let errorMessage = 'Erro desconhecido ao criar instituição';
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast({
        title: "Erro ao criar instituição",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { data: null, error };
    } finally {
      setLoading(false);
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
