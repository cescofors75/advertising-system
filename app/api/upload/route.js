/**
 * API Route: Upload files to Azure Blob Storage
 * POST /api/upload - Upload a file
 * DELETE /api/upload - Delete a file by URL
 */
import { NextResponse } from 'next/server';
import { uploadBlob, deleteBlob, getBlobNameFromUrl } from '@/lib/blobStorage';

// Max file size: 10MB
const MAX_SIZE = 10 * 1024 * 1024;

const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const VALID_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Validate file type
    const contentType = file.type;
    const isImage = VALID_IMAGE_TYPES.includes(contentType);
    const isVideo = VALID_VIDEO_TYPES.includes(contentType);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Tipo de archivo no soportado. Use imágenes (JPG, PNG, GIF, WebP) o videos (MP4, WebM, OGG).' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'El archivo excede el límite de 10MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    const blobName = `${timestamp}_${safeName}`;

    // Upload to Azure Blob Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const publicUrl = await uploadBlob(blobName, buffer, contentType);

    return NextResponse.json({
      url: publicUrl,
      mediaType: isImage ? 'image' : 'video',
      fileName: blobName,
    });
  } catch (err) {
    console.error('Error uploading file:', err);
    return NextResponse.json(
      { error: 'Error al subir el archivo' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'No se proporcionó URL del archivo' },
        { status: 400 }
      );
    }

    const blobName = getBlobNameFromUrl(url);
    await deleteBlob(blobName);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting file:', err);
    return NextResponse.json(
      { error: 'Error al eliminar el archivo' },
      { status: 500 }
    );
  }
}
