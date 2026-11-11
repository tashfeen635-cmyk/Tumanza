import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'public', 'uploads', safeFilename);

    let buffer: Buffer | null = null;
    const ext = path.extname(safeFilename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.avif': 'image/avif',
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    if (fs.existsSync(filePath)) {
      buffer = await fs.promises.readFile(filePath);
    } else if (process.env.NODE_ENV !== 'production') {
      try {
        const prodUrl = `https://www.tumanza.com/uploads/${safeFilename}`;
        const res = await fetch(prodUrl);
        const contentTypeHeader = res.headers.get('content-type') || '';
        if (res.ok && !contentTypeHeader.includes('text/html')) {
          const arrayBuf = await res.arrayBuffer();
          buffer = Buffer.from(arrayBuf);
          const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          await fs.promises.writeFile(filePath, buffer);
        }
      } catch (fetchErr) {
        console.error('Failed to fetch image from production:', fetchErr);
      }
    }

    if (!buffer) {
      return new NextResponse('File not found', { status: 404 });
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Internal error', { status: 500 });
  }
}
