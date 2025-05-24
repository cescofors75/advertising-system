'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

export default function AuthGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar si hay una sesión activa
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (data.session) {
          // Obtener información del usuario
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            throw userError;
          }
          
          // Verificar si el usuario tiene permiso (solo cescofors75@gmail.com)
          if (userData.user.email === 'cescofors75@gmail.com') {
            setAuthenticated(true);
          } else {
            console.log('Usuario sin permiso:', userData.user.email);
            await supabase.auth.signOut();
            router.push('/auth/login');
          }
        } else {
          console.log('No hay sesión activa');
          router.push('/auth/login');
        }
      } catch (err) {
        console.error('Error al verificar autenticación:', err);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Configurar listener para cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Evento de autenticación:', event);
      
      if (event === 'SIGNED_OUT') {
        setAuthenticated(false);
        router.push('/auth/login');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user.email === 'cescofors75@gmail.com') {
            setAuthenticated(true);
          } else {
            console.log('Usuario sin permiso en listener:', userData.user.email);
            await supabase.auth.signOut();
            router.push('/auth/login');
          }
        }
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mb-4">
            <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-700">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null; // No renderizar nada mientras se redirige
  }

  return children;
}
