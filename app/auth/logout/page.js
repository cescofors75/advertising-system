'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function LogoutPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Cerrando sesión...');

  useEffect(() => {
    const logout = async () => {
      try {
        await signOut({ redirect: false });
        setMessage('Sesión cerrada correctamente. Redirigiendo...');
        
        // Redirigir después de un breve retraso para que el usuario vea el mensaje
        setTimeout(() => {
          router.push('/auth/login');
        }, 1500);
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        setMessage('Error al cerrar sesión. Redirigiendo...');
        
        setTimeout(() => {
          router.push('/auth/login');
        }, 1500);
      }
    };

    logout();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Cierre de Sesión
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-700">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
