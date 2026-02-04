'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import { LogIn, Mail, Lock, Shield } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Verificar si ya hay una sesión activa
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { data: userData } = await supabase.auth.getUser();
        setUser(userData.user);
        
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
              console.error('Error al crear perfil de usuario:', insertError);
              setError('Error al verificar permisos de usuario.');
              await supabase.auth.signOut();
              return;
            }
            
            setError('No tienes permiso para acceder al panel de administración.');
            await supabase.auth.signOut();
            return;
          }
          
          setError('Error al verificar permisos de usuario.');
          await supabase.auth.signOut();
          return;
        }
        
        // Verificar el rol del usuario
        if (profileData && (profileData.role === 'admin' || profileData.role === 'editor')) {
          router.push('/admin');
        } else {
          setError('No tienes permiso para acceder al panel de administración.');
          await supabase.auth.signOut();
        }
      }
    };
    
    checkSession();
  }, [router]);

  const handleLoginWithEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Verificar si el usuario tiene el rol adecuado
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();
      
      if (profileError) {
        console.error('Error al obtener el perfil del usuario:', profileError);
        // Si no existe un perfil, podemos crear uno con el rol predeterminado 'viewer'
        if (profileError.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: data.user.id,
              role: 'viewer', // Rol predeterminado para nuevos usuarios
            });
          
          if (insertError) {
            throw insertError;
          }
          
          setError('No tienes permiso para acceder al panel de administración.');
          await supabase.auth.signOut();
          return;
        }
        throw profileError;
      }
      
      // Verificar el rol del usuario
      if (profileData && (profileData.role === 'admin' || profileData.role === 'editor')) {
        router.push('/admin');
      } else {
        setError('No tienes permiso para acceder al panel de administración.');
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
    } catch (err) {
      console.error('Error al iniciar sesión con Google:', err);
      setError(err.message || 'Error al iniciar sesión con Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-b from-slate-900 to-slate-800 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg mb-6">
            <LogIn className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Sistema de Publicidad Digital
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Inicia sesión para acceder al panel de administración
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800/80 backdrop-blur py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 border border-slate-700/50">
          {error && (
            <div className="mb-4 bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleLoginWithEmail} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Correo electrónico
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-600 bg-slate-700/50 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  placeholder="ejemplo@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-600 bg-slate-700/50 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02] disabled:opacity-50"
              >
                <LogIn className="w-5 h-5 mr-2" />
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-slate-400">O continúa con</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleLoginWithGoogle}
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-slate-600 rounded-xl shadow-sm text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" width="24" height="24">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                  </g>
                </svg>
                Google
              </button>
            </div>
          </div>
        </div>
        
        {/* Demo Users Section */}
        <div className="mt-6 bg-slate-800/50 backdrop-blur py-4 px-6 rounded-xl border border-slate-700/50">
          <div className="flex items-center justify-center mb-3">
            <Shield className="w-4 h-4 text-blue-400 mr-2" />
            <h3 className="text-sm font-semibold text-slate-300">Usuarios de Demo</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-2 px-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <span className="text-purple-300 font-medium">Admin:</span>
              <code className="text-slate-300">admin@demo.com / demo123</code>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <span className="text-green-300 font-medium">Editor:</span>
              <code className="text-slate-300">editor@demo.com / demo123</code>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <span className="text-blue-300 font-medium">Viewer:</span>
              <code className="text-slate-300">viewer@demo.com / demo123</code>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-xs flex items-center justify-center">
            <Shield className="w-3 h-3 mr-1" />
            Developed on the Costa Brava by VisitToo & VisitTech
          </p>
        </div>
      </div>
    </div>
  );
}
