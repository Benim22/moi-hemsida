import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth, supabase } from '@/lib/supabase';
import type { User, UserStore, RegisterFormData, ProfileFormData } from '@/types';

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ loading: true, error: null });
        
        try {
          const { data, error } = await auth.signIn(email, password);
          
          if (error) throw error;
          
          if (data.user) {
            // Hämta användarens profil från public.users
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();
            
            if (profileError) throw profileError;
            
            set({ 
              user: profile,
              loading: false,
              error: null 
            });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Ett fel uppstod vid inloggning',
            loading: false
          });
        }
      },

      register: async (data: RegisterFormData) => {
        set({ loading: true, error: null });
        
        try {
          const { data: authData, error } = await auth.signUp(
            data.email, 
            data.password,
            {
              name: data.name,
              phone: data.phone
            }
          );
          
          if (error) throw error;
          
          // Användarprofil skapas automatiskt via trigger
          set({ 
            loading: false,
            error: null 
          });
          
          return { success: true, message: 'Registrering lyckad! Kontrollera din e-post.' };
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Ett fel uppstod vid registrering',
            loading: false
          });
          return { success: false, message: 'Registrering misslyckades' };
        }
      },

      logout: async () => {
        set({ loading: true });
        
        try {
          const { error } = await auth.signOut();
          if (error) throw error;
          
          set({ 
            user: null, 
            loading: false, 
            error: null 
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Ett fel uppstod vid utloggning',
            loading: false
          });
        }
      },

      updateProfile: async (profileData: ProfileFormData) => {
        set({ loading: true, error: null });
        
        try {
          const currentUser = get().user;
          if (!currentUser) throw new Error('Ingen användare inloggad');
          
          // Uppdatera profil i public.users
          const { data, error } = await supabase
            .from('users')
            .update({
              name: profileData.name,
              phone: profileData.phone,
              address: profileData.address,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentUser.id)
            .select()
            .single();
          
          if (error) throw error;
          
          set({ 
            user: data,
            loading: false 
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Ett fel uppstod vid uppdatering',
            loading: false
          });
        }
      },

      fetchProfile: async () => {
        set({ loading: true, error: null });
        
        try {
          const { user } = await auth.getCurrentUser();
          
          if (user) {
            const { data: profile, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single();
            
            if (error) throw error;
            
            set({ 
              user: profile,
              loading: false 
            });
          } else {
            set({ 
              user: null,
              loading: false 
            });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Ett fel uppstod',
            loading: false
          });
        }
      },

      // Hjälpfunktioner
      isAdmin: () => {
        const user = get().user;
        return user?.role === 'admin';
      },

      isAuthenticated: () => {
        return get().user !== null;
      },

      // Initialisera användare från Supabase session
      initialize: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (profile) {
              set({ user: profile });
            }
          }
        } catch (error) {
          console.error('Failed to initialize user:', error);
        }
      }
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        user: state.user
      })
    }
  )
);

// Lyssna på auth state changes
supabase.auth.onAuthStateChange(async (event, session) => {
  const store = useUserStore.getState();
  
  if (event === 'SIGNED_IN' && session?.user) {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (profile) {
      useUserStore.setState({ user: profile });
    }
  } else if (event === 'SIGNED_OUT') {
    useUserStore.setState({ user: null });
  }
}); 