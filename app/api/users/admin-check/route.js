import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  // Usar la API de cookies de manera asíncrona
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    // Verificar sesión y usuario
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ 
        authorized: false, 
        error: 'No autorizado - No hay sesión de usuario' 
      }, { status: 401 });
    }
    
    // Devolver información del usuario para depuración
    const userInfo = {
      id: user.id,
      email: user.email,
      role: null,
      profile: null
    };
    
    // Intentar obtener perfil del usuario
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) {
      return NextResponse.json({ 
        authorized: false, 
        error: 'Error al obtener perfil: ' + profileError.message,
        userInfo
      }, { status: 500 });
    }
    
    // Si no hay perfil, probablemente el perfil de administrador no se creó correctamente
    if (!profileData) {
      return NextResponse.json({ 
        authorized: false, 
        error: 'No se encontró perfil para el usuario',
        userInfo,
        action: 'Crear perfil manualmente para ' + user.email
      }, { status: 404 });
    }
    
    userInfo.role = profileData.role;
    userInfo.profile = profileData;
    
    // Verificar si es administrador
    const isAdmin = profileData.role === 'admin';
    
    return NextResponse.json({ 
      authorized: isAdmin,
      userInfo,
      message: isAdmin ? 'Usuario es administrador' : 'Usuario no es administrador'
    });
    
  } catch (error) {
    console.error('Error en verificación de administrador:', error);
    return NextResponse.json({ 
      authorized: false, 
      error: error.message 
    }, { status: 500 });
  }
}
