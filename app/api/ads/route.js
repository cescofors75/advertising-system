/**
 * API Route: Advertisements
 * GET  /api/ads         - List all ads (optional ?active=true&timeSlot=morning)
 * POST /api/ads         - Create new ad
 */
import { NextResponse } from 'next/server';
import { query, sql } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active');
    const timeSlot = searchParams.get('timeSlot');

    let queryText = 'SELECT * FROM advertisements';
    const conditions = [];
    const params = {};

    if (activeOnly === 'true') {
      conditions.push('active = 1');
    }

    if (timeSlot) {
      const slotMap = {
        morning: 'time_slot_morning',
        afternoon: 'time_slot_afternoon',
        night: 'time_slot_night',
      };
      const col = slotMap[timeSlot];
      if (col) {
        conditions.push(`${col} = 1`);
      }
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ' ORDER BY id';

    const result = await query(queryText, params);
    return NextResponse.json(result.recordset);
  } catch (err) {
    console.error('Error fetching ads:', err);
    return NextResponse.json({ error: 'Error al obtener anuncios' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const result = await query(
      `INSERT INTO advertisements 
        (title, description, media_url, media_type, active,
         website_url, show_qr_code, qr_type, qr_position, qr_color_web, qr_color_payment,
         product_name, product_price, payment_provider,
         time_slot_morning, time_slot_afternoon, time_slot_night)
       OUTPUT INSERTED.*
       VALUES 
        (@title, @description, @mediaUrl, @mediaType, @active,
         @websiteUrl, @showQrCode, @qrType, @qrPosition, @qrColorWeb, @qrColorPayment,
         @productName, @productPrice, @paymentProvider,
         @timeSlotMorning, @timeSlotAfternoon, @timeSlotNight)`,
      {
        title: { type: sql.NVarChar, value: body.title },
        description: { type: sql.NVarChar, value: body.description || null },
        mediaUrl: { type: sql.NVarChar, value: body.media_url || null },
        mediaType: { type: sql.NVarChar, value: body.media_type || 'image' },
        active: { type: sql.Bit, value: body.active !== undefined ? body.active : true },
        websiteUrl: { type: sql.NVarChar, value: body.website_url || null },
        showQrCode: { type: sql.Bit, value: body.show_qr_code || false },
        qrType: { type: sql.NVarChar, value: body.qr_type || 'web' },
        qrPosition: { type: sql.NVarChar, value: body.qr_position || 'top' },
        qrColorWeb: { type: sql.NVarChar, value: body.qr_color_web || 'black' },
        qrColorPayment: { type: sql.NVarChar, value: body.qr_color_payment || 'orange' },
        productName: { type: sql.NVarChar, value: body.product_name || null },
        productPrice: { type: sql.Decimal, value: body.product_price || null },
        paymentProvider: { type: sql.NVarChar, value: body.payment_provider || null },
        timeSlotMorning: { type: sql.Bit, value: body.time_slot_morning || false },
        timeSlotAfternoon: { type: sql.Bit, value: body.time_slot_afternoon || false },
        timeSlotNight: { type: sql.Bit, value: body.time_slot_night || false },
      }
    );

    return NextResponse.json(result.recordset[0], { status: 201 });
  } catch (err) {
    console.error('Error creating ad:', err);
    return NextResponse.json({ error: 'Error al crear anuncio' }, { status: 500 });
  }
}
