'use client';

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabaseClient';
import { Users, UserPlus, UserCheck, UserX, RefreshCw, Sparkles, AlertCircle, X, Check, Info } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent flex items-center">
              <Users className="w-10 h-10 mr-3 text-blue-400" />
              Gestión de Usuarios
            </h1>
            {!isAddingUser && (
              <button 
                onClick={() => setIsAddingUser(true)}
                className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center transition-all transform hover:scale-105 shadow-lg"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Nuevo Usuario
              </button>
            )}
          </div>
          <p className="text-slate-300 text-lg">Administra usuarios y permisos de acceso al sistema</p>
        </div>
        
        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-6 backdrop-blur">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
              <p className="text-red-400">{error}</p>
            </div>
            <div className="mt-2 pl-8">
              <a href="/admin/check-admin" className="text-blue-400 hover:text-blue-300 underline">
                Verificar permisos de administrador →
              </a>
            </div>
          </div>
        )}
        
        {isAddingUser ? (
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700/50 shadow-2xl mb-8">
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 flex items-center">
              <UserPlus className="w-6 h-6 mr-2 text-blue-400" />
              Crear Nuevo Usuario
            </h2>
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="email">
                    Correo Electrónico <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={newUser.email}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ej: usuario@ejemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="password">
                    Contraseña <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={newUser.password}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="firstName">
                    Nombre
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={newUser.firstName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Nombre del usuario"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="lastName">
                    Apellido
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={newUser.lastName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Apellido del usuario"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="role">
                    Rol
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Visualizador</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={newUser.isActive}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`relative w-12 h-6 rounded-full transition-colors ${
                      newUser.isActive ? 'bg-emerald-500' : 'bg-slate-600'
                    }`}>
                      <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                        newUser.isActive ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </div>
                    <span className="ml-3 text-slate-300">
                      Usuario Activo
                    </span>
                  </label>
                </div>
              </div>
              
              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50 mt-6">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-300 text-sm">
                    Esta versión simplificada solo mostrará los datos que ingresaste. Para crear realmente el usuario, 
                    necesitarás acceder al panel de Supabase directamente.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all flex items-center"
                >
                  <X className="w-5 h-5 mr-2" />
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all flex items-center transform hover:scale-105 shadow-lg"
                  disabled={loading}
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  {loading ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        ) : null}
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-300 text-lg">Cargando usuarios...</p>
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-700/50">
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Rol
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Users className="w-16 h-16 text-slate-500 mb-4" />
                          <p className="text-slate-400 text-lg">No hay usuarios registrados</p>
                          <p className="text-slate-500 text-sm mt-2">Crea un nuevo usuario para comenzar</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-white flex items-center">
                              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold mr-3">
                                {user.first_name ? user.first_name.charAt(0) : '?'}
                              </span>
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-slate-400 mt-1 pl-11">
                              {user.email || "Email no disponible"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.role === 'editor' 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : user.role === 'admin'
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {user.role === 'editor' ? 'Editor' : 
                             user.role === 'admin' ? 'Administrador' : 'Visualizador'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleUserActive(user.user_id, user.is_active)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              user.is_active 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {user.is_active ? (
                              <>
                                <UserCheck className="w-3 h-3 mr-1" />
                                Activo
                              </>
                            ) : (
                              <>
                                <UserX className="w-3 h-3 mr-1" />
                                Inactivo
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => resetPassword(user.email)}
                              className="p-2 bg-slate-700/50 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 rounded-lg transition-all group"
                              title="Resetear contraseña"
                            >
                              <RefreshCw className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <div className="mt-8 bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-start">
            <Sparkles className="w-6 h-6 text-blue-400 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Información sobre limitaciones
              </h3>
              <p className="mt-2 text-slate-400 text-sm">
                Esta versión simplificada de la gestión de usuarios tiene limitaciones debido a las restricciones 
                de seguridad de Supabase:
              </p>
              <ul className="mt-3 space-y-1 text-slate-400 text-sm">
                <li className="flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  La creación de usuarios requiere acceso al panel de Supabase
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  El restablecimiento de contraseñas también debe hacerse desde el panel de Supabase
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  La información de email y último acceso puede no estar disponible
                </li>
              </ul>
              <p className="mt-3 text-slate-400 text-sm">
                Para funcionalidad completa, necesitarías configurar funciones Edge o serverless en Supabase 
                con permisos administrativos adecuados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
