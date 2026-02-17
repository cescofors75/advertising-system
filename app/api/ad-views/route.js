/**
 * API Route: Ad Views
 * GET  /api/ad-views  - Get view counts / stats
 * POST /api/ad-views  - Record a new ad view
 */
import { NextResponse } from 'next/server';
import { query, sql } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const adId = searchParams.get('adId');
    const period = searchParams.get('period'); // today, week, month, all
    const grouped = searchParams.get('grouped'); // by_ad, by_device, by_hour

    let queryText = '';
    const params = {};

    if (grouped === 'by_ad') {
      queryText = `
        SELECT 
          av.ad_id,
          a.title AS ad_title,
          COUNT(*) AS view_count,
          COUNT(DISTINCT av.device_id) AS unique_devices
        FROM ad_views av
        LEFT JOIN advertisements a ON a.id = av.ad_id
      `;
    } else if (grouped === 'by_device') {
      queryText = `
        SELECT 
          av.device_id,
          d.name AS device_name,
          COUNT(*) AS view_count,
          COUNT(DISTINCT av.ad_id) AS unique_ads
        FROM ad_views av
        LEFT JOIN connected_devices d ON d.id = av.device_id
      `;
    } else if (grouped === 'by_hour') {
      queryText = `
        SELECT 
          DATEPART(hour, av.viewed_at) AS hour,
          COUNT(*) AS view_count
        FROM ad_views av
      `;
    } else {
      queryText = `SELECT * FROM ad_views av`;
    }

    const whereClauses = [];

    if (adId) {
      whereClauses.push('av.ad_id = @adId');
      params.adId = { type: sql.Int, value: parseInt(adId) };
    }

    if (period === 'today') {
      whereClauses.push('CAST(av.viewed_at AS DATE) = CAST(GETDATE() AS DATE)');
    } else if (period === 'week') {
      whereClauses.push('av.viewed_at >= DATEADD(day, -7, GETDATE())');
    } else if (period === 'month') {
      whereClauses.push('av.viewed_at >= DATEADD(month, -1, GETDATE())');
    }

    if (whereClauses.length > 0) {
      queryText += ' WHERE ' + whereClauses.join(' AND ');
    }

    if (grouped === 'by_ad') {
      queryText += ' GROUP BY av.ad_id, a.title ORDER BY view_count DESC';
    } else if (grouped === 'by_device') {
      queryText += ' GROUP BY av.device_id, d.name ORDER BY view_count DESC';
    } else if (grouped === 'by_hour') {
      queryText += ' GROUP BY DATEPART(hour, av.viewed_at) ORDER BY hour';
    } else {
      queryText += ' ORDER BY av.viewed_at DESC';
    }

    const result = await query(queryText, params);
    return NextResponse.json(result.recordset);
  } catch (err) {
    console.error('Error fetching ad views:', err);
    return NextResponse.json({ error: 'Error al obtener vistas' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { ad_id, device_id, time_slot } = body;

    const parsedAdId = parseInt(ad_id, 10);
    if (!ad_id || isNaN(parsedAdId)) {
      return NextResponse.json({ error: 'ad_id es requerido y debe ser un número válido' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO ad_views (ad_id, device_id, time_slot, viewed_at)
       OUTPUT INSERTED.*
       VALUES (@adId, @deviceId, @timeSlot, GETDATE())`,
      {
        adId: { type: sql.Int, value: parsedAdId },
        deviceId: { type: sql.NVarChar, value: device_id || null },
        timeSlot: { type: sql.NVarChar, value: time_slot || null },
      }
    );

    return NextResponse.json(result.recordset[0], { status: 201 });
  } catch (err) {
    console.error('Error recording ad view:', err);
    return NextResponse.json({ error: 'Error al registrar vista' }, { status: 500 });
  }
}
