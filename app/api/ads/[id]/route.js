/**
 * API Route: Single Advertisement
 * PATCH  /api/ads/[id]  - Update ad
 * DELETE /api/ads/[id]  - Delete ad
 */
import { NextResponse } from 'next/server';
import { query, sql } from '@/lib/db';
import { deleteBlob, getBlobNameFromUrl } from '@/lib/blobStorage';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Build dynamic SET clause from provided fields
    const fields = [];
    const sqlParams = { id: { type: sql.BigInt, value: parseInt(id) } };

    const fieldMap = {
      title: sql.NVarChar,
      description: sql.NVarChar,
      media_url: sql.NVarChar,
      media_type: sql.NVarChar,
      active: sql.Bit,
      website_url: sql.NVarChar,
      show_qr_code: sql.Bit,
      qr_type: sql.NVarChar,
      qr_position: sql.NVarChar,
      qr_color_web: sql.NVarChar,
      qr_color_payment: sql.NVarChar,
      product_name: sql.NVarChar,
      product_price: sql.Decimal,
      payment_provider: sql.NVarChar,
      time_slot_morning: sql.Bit,
      time_slot_afternoon: sql.Bit,
      time_slot_night: sql.Bit,
    };

    for (const [key, type] of Object.entries(fieldMap)) {
      if (body[key] !== undefined) {
        fields.push(`${key} = @${key}`);
        sqlParams[key] = { type, value: body[key] };
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const result = await query(
      `UPDATE advertisements SET ${fields.join(', ')} OUTPUT INSERTED.* WHERE id = @id`,
      sqlParams
    );

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Anuncio no encontrado' }, { status: 404 });
    }

    return NextResponse.json(result.recordset[0]);
  } catch (err) {
    console.error('Error updating ad:', err);
    return NextResponse.json({ error: 'Error al actualizar anuncio' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Get the ad first to find media_url for blob cleanup
    const existing = await query(
      'SELECT media_url FROM advertisements WHERE id = @id',
      { id: { type: sql.BigInt, value: parseInt(id) } }
    );

    if (existing.recordset.length === 0) {
      return NextResponse.json({ error: 'Anuncio no encontrado' }, { status: 404 });
    }

    // Delete blob if exists
    const mediaUrl = existing.recordset[0].media_url;
    if (mediaUrl && mediaUrl.includes('blob.core.windows.net')) {
      try {
        const blobName = getBlobNameFromUrl(mediaUrl);
        await deleteBlob(blobName);
      } catch (blobErr) {
        console.error('Error deleting blob:', blobErr);
        // Continue with DB deletion even if blob fails
      }
    }

    // Delete from DB
    await query(
      'DELETE FROM advertisements WHERE id = @id',
      { id: { type: sql.BigInt, value: parseInt(id) } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting ad:', err);
    return NextResponse.json({ error: 'Error al eliminar anuncio' }, { status: 500 });
  }
}
