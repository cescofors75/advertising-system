'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

export default function CheckAdminPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [adminCheckResult, setAdminCheckResult] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Verificar si hay una sesión
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error('Error al verificar sesión: ' + sessionError.message);
        }
        
        if (!sessionData.session) {
          throw new Error('No hay sesión activa. Por favor, inicia sesión.');
        }
        
        // 2. Obtener información del usuario
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw new Error('Error al obtener usuario: ' + userError.message);
        }
        
        setUserData(userData.user);
        
        // 3. Verificar perfil de administrador a través de nuestra API
        const response = await fetch('/api/users/admin-check');
        const adminCheckData = await response.json();
        
        setAdminCheckResult(adminCheckData);
        
        if (!adminCheckData.authorized) {
          console.error('Usuario no autorizado:', adminCheckData);
        }
        
      } catch (err) {
        console.error('Error durante la verificación:', err);
        setError(err.message || 'Error al verificar estado de administrador');
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [router]);

  // Función para crear manualmente un perfil de administrador
  const createAdminProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!userData || !userData.id) {
        throw new Error('No hay información de usuario disponible');
      }
      
      // Insertar perfil de administrador directamente en la base de datos
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userData.id,
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      if (error) {
        throw new Error('Error al crear perfil de administrador: ' + error.message);
      }
      
      // Recargar la página para verificar los cambios
      window.location.reload();
      
    } catch (err) {
      console.error('Error al crear perfil de administrador:', err);
      setError(err.message || 'Error al crear perfil de administrador');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Verificación de Permisos de Administrador</h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Verificando permisos...</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Información de Usuario</h2>
              
              {userData ? (
                <div className="mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">ID de Usuario:</p>
                      <p className="text-gray-800">{userData.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email:</p>
                      <p className="text-gray-800">{userData.email}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-red-600 mb-4">No se encontró información de usuario</p>
              )}
              
              <h2 className="text-xl font-bold text-gray-800 mb-4">Resultado de Verificación</h2>
              
              {adminCheckResult ? (
                <div>
                  <div className={`p-4 mb-4 rounded-md ${
                    adminCheckResult.authorized 
                      ? 'bg-green-100 border border-green-400 text-green-800' 
                      : 'bg-red-100 border border-red-400 text-red-800'
                  }`}>
                    <p className="font-bold">
                      {adminCheckResult.authorized 
                        ? '✅ Usuario tiene permisos de administrador' 
                        : '❌ Usuario NO tiene permisos de administrador'}
                    </p>
                    <p>{adminCheckResult.message}</p>
                  </div>
                  
                  {adminCheckResult.userInfo && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">Detalles:</h3>
                      
                      <div className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                        <pre className="text-sm text-gray-800">
                          {JSON.stringify(adminCheckResult.userInfo, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  
                  {!adminCheckResult.authorized && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">Soluciones:</h3>
                      
                      <ol className="list-decimal list-inside space-y-2 mb-4">
                        <li>Verifica que hayas ejecutado el script SQL para crear el perfil de administrador</li>
                        <li>Asegúrate de que el correo electrónico en el script coincida con tu cuenta ({userData?.email})</li>
                        <li>Comprueba que la tabla user_profiles existe y tiene las políticas RLS correctas</li>
                      </ol>
                      
                      <button
                        onClick={createAdminProfile}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                      >
                        Crear Perfil de Administrador Manualmente
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-yellow-600">No se pudo obtener el resultado de la verificación</p>
              )}
              
              <div className="mt-8 pt-4 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Instrucciones para SQL</h2>
                
                <p className="mb-4">Ejecuta el siguiente SQL en la consola de Supabase para asegurarte de que tu usuario tenga permisos de administrador:</p>
                
                <div className="bg-gray-100 p-4 rounded-md overflow-x-auto mb-6">
                  <pre className="text-sm text-gray-800">
{`-- Asegurar que el usuario actual tenga perfil de administrador
INSERT INTO user_profiles (user_id, first_name, last_name, role, is_active)
SELECT '${userData?.id || '[TU_ID_DE_USUARIO]'}', 'Admin', 'User', 'admin', TRUE
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'admin',
  is_active = TRUE,
  updated_at = NOW();`}
                  </pre>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
              <a href="/admin" className="text-gray-600 hover:text-gray-800">
                Volver al Panel de Administración
              </a>
              
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Recargar Página
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
