/**
 * API Route: Single Device
 * PATCH  /api/devices/[id] - Update device fields
 * DELETE /api/devices/[id] - Remove device record
 */
import { NextResponse } from 'next/server';
import { query, sql } from '@/lib/db';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowedFields = [
      'name', 'ip', 'os', 'browser', 'device_type', 'location',
      'status', 'network', 'resolution', 'user_agent', 'battery',
      'current_ad', 'current_time_slot', 'last_seen',
    ];

    const setClauses = [];
    const queryParams = { id: { type: sql.NVarChar, value: id } };

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        setClauses.push(`${field} = @${field}`);
        const sqlType = field === 'last_seen' ? sql.DateTimeOffset : sql.NVarChar;
        queryParams[field] = { type: sqlType, value: body[field] };
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
    }

    const result = await query(
      `UPDATE connected_devices SET ${setClauses.join(', ')} OUTPUT INSERTED.* WHERE id = @id`,
      queryParams
    );

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Dispositivo no encontrado' }, { status: 404 });
    }

    return NextResponse.json(result.recordset[0]);
  } catch (err) {
    console.error('Error updating device:', err);
    return NextResponse.json({ error: 'Error al actualizar dispositivo' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const result = await query(
      'DELETE FROM connected_devices WHERE id = @id',
      { id: { type: sql.NVarChar, value: id } }
    );

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: 'Dispositivo no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting device:', err);
    return NextResponse.json({ error: 'Error al eliminar dispositivo' }, { status: 500 });
  }
}
