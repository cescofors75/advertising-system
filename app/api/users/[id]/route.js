import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
  // Usar la API de cookies de manera asíncrona
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { id } = params;
  
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
    const updateData = await request.json();
    
    // Actualizar el perfil del usuario
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        is_active: updateData.isActive,
        role: updateData.role,
        first_name: updateData.firstName,
        last_name: updateData.lastName
      })
      .eq('user_id', id)
      .select()
      .single();
    
    if (updateError) {
      throw updateError;
    }
    
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  // Usar la API de cookies de manera asíncrona
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { id } = params;
  
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
    
    // Obtener acción del cuerpo de la solicitud
    const { action } = await request.json();
    
    if (action === 'reset_password') {
      // Obtener el correo del usuario
      const { data: authUser, error: userError } = await supabase.auth.admin.getUserById(id);
      
      if (userError) {
        throw userError;
      }
      
      // Enviar correo de restablecimiento
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        authUser.user.email,
        {
          redirectTo: `${request.headers.get('origin')}/auth/reset-password`,
        }
      );
      
      if (resetError) {
        throw resetError;
      }
      
      return NextResponse.json({ message: 'Correo de restablecimiento enviado' });
    }
    
    return NextResponse.json({ error: 'Acción no soportada' }, { status: 400 });
  } catch (error) {
    console.error('Error al procesar acción:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
