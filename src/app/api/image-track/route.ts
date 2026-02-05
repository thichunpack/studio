
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  try {
    const headersList = headers();
    const ua = headersList.get('user-agent') ?? 'unknown';

    // Best-effort IP detection
    const ip = (headersList.get('x-vercel-forwarded-for') ?? headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? request.headers.get('cf-connecting-ip') ?? 'N/A').split(',')[0].trim();
    const finalIp = ip.startsWith('::ffff:') ? ip.substring(7) : ip;

    let address = 'N/A (Chỉ ghi lại IP qua ảnh)';
    let mapLink = 'N/A';
    
    // Attempt to get approximate location from IP
    if (finalIp !== 'N/A' && !finalIp.startsWith('127.')) {
        try {
            const response = await fetch(`http://ip-api.com/json/${finalIp}?fields=status,message,country,city,lat,lon`);
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success') {
                    address = `${data.city || 'Thành phố không xác định'}, ${data.country || 'Quốc gia không xác định'} (Ước tính từ IP)`;
                    mapLink = `https://www.google.com/maps?q=${data.lat},${data.lon}`;
                }
            }
        } catch (e) {
            // ip-api failed, proceed without address
        }
    }

    let logData = `--- [${new Date().toISOString()}] MỚI TRUY CẬP (Ảnh) ---\n`;
    logData += `Thiết bị: ${ua}\n`;
    logData += `Địa chỉ IP: ${finalIp}\n`;
    logData += `Địa chỉ: ${address}\n`;
    logData += `Link Google Maps: ${mapLink}\n`;
    logData += `----------------------------------\n`;

    const logDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(logDir, 'tracking_logs.txt');
    
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    fs.appendFileSync(logFile, logData, 'utf-8');

  } catch (error) {
    console.error('Failed to log image request:', error);
  } finally {
    // Always return the 1x1 transparent PNG pixel to not break the client's image display
    const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    
    return new NextResponse(pixel, {
        headers: {
            'Content-Type': 'image/png',
            'Content-Length': pixel.length.toString(),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        }
    });
  }
}
