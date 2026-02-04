import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  // Usar la API de cookies de manera asíncrona
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    // Verificar si el usuario actual es un administrador
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Verificar si el usuario tiene rol de administrador
    const { data: adminCheck, error: adminError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (adminError || adminCheck?.role !== 'admin') {
      return NextResponse.json({ error: 'No tiene permisos de administrador' }, { status: 403 });
    }
    
    // Obtener todos los usuarios con sus perfiles
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        user_id,
        first_name,
        last_name,
        role,
        is_active,
        created_at,
        updated_at
      `);
    
    if (usersError) {
      throw usersError;
    }
    
    // Obtener información de la tabla de autenticación para cada usuario
    const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
    
    if (authUsersError) {
      throw authUsersError;
    }
    
    // Combinar datos de ambas tablas
    const enhancedUsers = users.map(profile => {
      const authUser = authUsers.find(u => u.id === profile.user_id);
      return {
        ...profile,
        email: authUser?.email,
        last_sign_in_at: authUser?.last_sign_in_at,
        created_at: authUser?.created_at || profile.created_at
      };
    });
    
    return NextResponse.json(enhancedUsers);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  // Usar la API de cookies de manera asíncrona
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    // Verificar si el usuario actual es un administrador
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Verificar si el usuario tiene rol de administrador
    const { data: adminCheck, error: adminError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (adminError || adminCheck?.role !== 'admin') {
      return NextResponse.json({ error: 'No tiene permisos de administrador' }, { status: 403 });
    }
    
    // Obtener datos del cuerpo de la solicitud
    const newUserData = await request.json();
    
    // Validar datos requeridos
    if (!newUserData.email || !newUserData.password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 });
    }
    
    // Crear el usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: newUserData.email,
      password: newUserData.password,
      email_confirm: true
    });
    
    if (authError) {
      throw authError;
    }
    
    // Crear perfil de usuario
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authData.user.id,
        first_name: newUserData.firstName || '',
        last_name: newUserData.lastName || '',
        role: newUserData.role || 'editor',
        is_active: newUserData.isActive !== false
      })
      .select()
      .single();
    
    if (profileError) {
      // Intenta eliminar el usuario de Auth si hay error al crear el perfil
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }
    
    return NextResponse.json({
      ...profileData,
      email: authData.user.email
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
