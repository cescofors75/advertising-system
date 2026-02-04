'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Procesando autenticación...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (data.session) {
          const { data: userData } = await supabase.auth.getUser();
          
          // Verificar si el usuario tiene el rol adecuado
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', userData.user.id)
            .single();
          
          if (profileError) {
            console.error('Error al obtener el perfil del usuario:', profileError);
            // Si no existe un perfil, podemos crear uno con el rol predeterminado 'viewer'
            if (profileError.code === 'PGRST116') {
              const { error: insertError } = await supabase
                .from('user_profiles')
                .insert({
                  user_id: userData.user.id,
                  role: 'viewer', // Rol predeterminado para nuevos usuarios
                });
              
              if (insertError) {
                throw insertError;
              }
              
              setError('No tienes permiso para acceder al panel de administración.');
              await supabase.auth.signOut();
              setTimeout(() => {
                router.push('/auth/login');
              }, 3000);
              return;
            }
            throw profileError;
          }
          
          // Verificar el rol del usuario
          if (profileData && (profileData.role === 'admin' || profileData.role === 'editor')) {
            setMessage('Autenticación exitosa. Redirigiendo...');
            router.push('/admin');
          } else {
            setError('No tienes permiso para acceder al panel de administración.');
            await supabase.auth.signOut();
            setTimeout(() => {
              router.push('/auth/login');
            }, 3000);
          }
        } else {
          setError('No se pudo obtener la sesión. Por favor, intenta nuevamente.');
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
        }
      } catch (err) {
        console.error('Error en el proceso de callback:', err);
        setError(err.message || 'Error en el proceso de autenticación');
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Autenticación
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error ? (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <p className="mt-2 text-sm text-red-700">
                    Redirigiendo al inicio de sesión...
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-4">
                <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-gray-700">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
