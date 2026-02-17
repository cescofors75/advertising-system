/**
 * API Route: Connected Devices
 * GET  /api/devices          - List devices (optional ?status=online)
 * POST /api/devices          - Upsert a device (from display clients)
 */
import { NextResponse } from 'next/server';
import { query, execute, sql } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const countOnly = searchParams.get('countOnly');

    if (countOnly === 'true') {
      const result = await query(
        `SELECT 
           COUNT(*) AS total,
           SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) AS online
         FROM connected_devices`
      );
      return NextResponse.json(result.recordset[0]);
    }

    let queryText = 'SELECT * FROM connected_devices';
    const params = {};

    if (status) {
      queryText += ' WHERE status = @status';
      params.status = { type: sql.NVarChar, value: status };
    }

    queryText += ' ORDER BY last_seen DESC';

    const result = await query(queryText, params);
    return NextResponse.json(result.recordset);
  } catch (err) {
    console.error('Error fetching devices:', err);
    return NextResponse.json({ error: 'Error al obtener dispositivos' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    await execute('sp_UpsertConnectedDevice', {
      Id: { type: sql.NVarChar, value: body.id },
      Name: { type: sql.NVarChar, value: body.name || null },
      Ip: { type: sql.NVarChar, value: body.ip || null },
      Os: { type: sql.NVarChar, value: body.os || null },
      Browser: { type: sql.NVarChar, value: body.browser || null },
      DeviceType: { type: sql.NVarChar, value: body.device_type || null },
      Location: { type: sql.NVarChar, value: body.location || null },
      Status: { type: sql.NVarChar, value: body.status || 'online' },
      Network: { type: sql.NVarChar, value: body.network || null },
      Resolution: { type: sql.NVarChar, value: body.resolution || null },
      UserAgent: { type: sql.NVarChar, value: body.user_agent || null },
      Battery: { type: sql.NVarChar, value: body.battery || null },
      CurrentAd: { type: sql.NVarChar, value: body.current_ad || null },
      CurrentTimeSlot: { type: sql.NVarChar, value: body.current_time_slot || null },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error upserting device:', err);
    return NextResponse.json({ error: 'Error al registrar dispositivo' }, { status: 500 });
  }
}
