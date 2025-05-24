'use client';

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabaseClient';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  // Formulario para nuevo usuario
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'editor',
    isActive: true
  });

  // Verificar el usuario actual primero
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        console.log("Verificando usuario actual...");
        setLoading(true);
        
        // 1. Obtener usuario actual
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Error al obtener usuario:", userError);
          throw userError;
        }
        
        if (!user) {
          console.error("No hay sesión de usuario");
          throw new Error("No hay sesión de usuario");
        }
        
        console.log("Usuario encontrado:", user.email);
        setCurrentUser(user);
        
        // 2. Obtener perfil del usuario para verificar si es admin
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (profileError) {
          console.error("Error al obtener perfil:", profileError);
          throw profileError;
        }
        
        if (!profileData) {
          console.error("No se encontró perfil para el usuario");
          throw new Error("No se encontró perfil para el usuario");
        }
        
        console.log("Perfil de usuario:", profileData);
        setUserProfile(profileData);
        
        if (profileData.role !== 'admin') {
          console.error("El usuario no tiene rol de administrador:", profileData.role);
          throw new Error("El usuario no tiene rol de administrador");
        }
        
        console.log("✅ Usuario es administrador. Cargando datos...");
        
        // 3. Si llegamos hasta aquí, el usuario es administrador y podemos cargar los datos
        // Importante: Pasamos el ID del usuario a fetchUsers para evitar el error
        await fetchUsers(user.id);
        
      } catch (err) {
        console.error("Error al verificar usuario:", err);
        setError("Error de permisos: " + err.message);
        setLoading(false);
      }
    };
    
    checkCurrentUser();
  }, []);

  // Cargar lista de usuarios - versión simplificada
  // Ahora recibe el ID del usuario como parámetro para evitar problemas
  const fetchUsers = async (currentUserId) => {
    try {
      console.log("Obteniendo lista de usuarios...");
      
      if (!currentUserId) {
        console.error("Error: fetchUsers llamado sin ID de usuario");
        throw new Error("ID de usuario no proporcionado");
      }
      
      // Obtener perfiles de usuario
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*');
        
      if (profilesError) {
        console.error("Error al obtener perfiles:", profilesError);
        throw profilesError;
      }
      
      console.log("Perfiles obtenidos:", profiles.length);
      
      // Filtrar el usuario actual usando el ID pasado como parámetro
      const filteredProfiles = profiles.filter(profile => 
        profile.user_id !== currentUserId
      );
      
      console.log("Perfiles filtrados:", filteredProfiles.length);
      
      // Como no podemos acceder directamente a auth.users, usamos lo que tenemos
      setUsers(filteredProfiles);
      
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
      setError('No se pudieron cargar los usuarios. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewUser({
      ...newUser,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Crear nuevo usuario - versión simplificada
  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      alert(`Funcionalidad limitada: Para crear un usuario nuevo, debes usar el panel de Supabase directamente.
      
Email: ${newUser.email}
Contraseña: ${newUser.password}
Nombre: ${newUser.firstName}
Apellido: ${newUser.lastName}
Rol: ${newUser.role}
Activo: ${newUser.isActive ? 'Sí' : 'No'}

Después de crear el usuario en Supabase, actualiza esta página.`);
      
      // Limpiar formulario
      setNewUser({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'editor',
        isActive: true
      });
      
      setIsAddingUser(false);
      
    } catch (err) {
      console.error('Error al crear usuario:', err);
      setError('Error al crear usuario: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado de activación
  const toggleUserActive = async (userId, currentStatus) => {
    try {
      if (!currentUser || !currentUser.id) {
        throw new Error('No se puede completar la acción: información de usuario no disponible');
      }
      
      const newStatus = !currentStatus;
      
      // Actualizar perfil directamente
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: newStatus })
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Actualizar lista local
      setUsers(users.map(user => 
        user.user_id === userId ? {...user, is_active: newStatus} : user
      ));
      
    } catch (err) {
      console.error('Error al actualizar estado del usuario:', err);
      setError('Error al actualizar estado: ' + err.message);
    }
  };

  // Función simplificada para mostrar mensaje de reset de contraseña
  const resetPassword = (email) => {
    alert(`Funcionalidad limitada: Para restablecer la contraseña, debes usar el panel de Supabase directamente para el usuario con email: ${email || "desconocido"}`);
  };

  // Mostrar información de depuración
  const showDebugInfo = () => {
    if (!userProfile || !currentUser) return null;
    
    return (
      <div className="mt-8 bg-gray-50 p-4 rounded-md border border-gray-200">
        <h3 className="text-lg font-bold text-gray-700 mb-2">Información de Depuración</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-500">ID Usuario:</p>
            <p className="text-gray-800 mb-2">{currentUser.id}</p>
            
            <p className="text-sm font-semibold text-gray-500">Email:</p>
            <p className="text-gray-800 mb-2">{currentUser.email}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Rol:</p>
            <p className="text-gray-800 mb-2">{userProfile.role}</p>
            
            <p className="text-sm font-semibold text-gray-500">Estado:</p>
            <p className="text-gray-800 mb-2">{userProfile.is_active ? 'Activo' : 'Inactivo'}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
        <button
          onClick={() => setIsAddingUser(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Añadir Usuario
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
          <div className="mt-2">
            <a href="/admin/check-admin" className="underline">
              Verificar permisos de administrador
            </a>
          </div>
        </div>
      )}

      {isAddingUser && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Añadir Nuevo Usuario</h2>
          <form onSubmit={handleCreateUser}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Correo Electrónico*
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={newUser.email}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Contraseña*
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={newUser.password}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                  Nombre
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={newUser.firstName}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                  Apellido
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={newUser.lastName}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
                  Rol
                </label>
                <select
                  id="role"
                  name="role"
                  value={newUser.role}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Visualizador</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={newUser.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-gray-700 text-sm font-bold" htmlFor="isActive">
                  Usuario Activo
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAddingUser(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay usuarios registrados o no tienes permisos para verlos
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{user.email || "Email no disponible"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'editor' 
                          ? 'bg-green-100 text-green-800' 
                          : user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'editor' ? 'Editor' : 
                         user.role === 'admin' ? 'Administrador' : 'Visualizador'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleUserActive(user.user_id, user.is_active)}
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => resetPassword(user.email)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Resetear Contraseña
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Mostrar información de depuración */}
      {showDebugInfo()}
      
      <div className="mt-8 bg-blue-50 p-4 rounded-md border border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-2">Información sobre limitaciones</h3>
        <p className="text-blue-600 mb-3">
          Esta versión simplificada de la gestión de usuarios tiene limitaciones debido a las restricciones de seguridad de Supabase:
        </p>
        <ul className="list-disc list-inside text-blue-600 space-y-1">
          <li>La creación de usuarios requiere acceso al panel de Supabase</li>
          <li>El restablecimiento de contraseñas también debe hacerse desde el panel de Supabase</li>
          <li>La información de email y último acceso puede no estar disponible</li>
        </ul>
        <p className="text-blue-600 mt-3">
          Para funcionalidad completa, necesitarías configurar funciones Edge o serverless en Supabase 
          con permisos administrativos adecuados.
        </p>
      </div>
    </div>
  );
}
