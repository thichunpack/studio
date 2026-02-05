'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

const logFile = path.join(process.cwd(), 'logs', 'tracking_logs.txt');
const MAX_LOG_ENTRIES_TO_SHOW = 500;

export async function getLogContentAction() {
  try {
    const content = await fs.readFile(logFile, 'utf-8');
    
    // Optimization to handle large log files by showing only the most recent entries
    const entries = content.split('--- [').filter(e => e.trim() !== '');
    const totalEntries = entries.length;

    if (totalEntries > MAX_LOG_ENTRIES_TO_SHOW) {
      const recentEntries = entries.slice(-MAX_LOG_ENTRIES_TO_SHOW);
      const informationalHeader = `--- HIỂN THỊ ${MAX_LOG_ENTRIES_TO_SHOW} MỤC GẦN NHẤT TRONG TỔNG SỐ ${totalEntries}. TẢI XUỐNG TỆP ĐỂ XEM LỊCH SỬ ĐẦY ĐỦ. ---\n\n`;
      
      // Reconstruct the log content for the most recent entries
      const limitedContent = '--- [' + recentEntries.join('--- [');
      return informationalHeader + limitedContent;
    }

    return content;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      try {
        await fs.mkdir(path.dirname(logFile), { recursive: true });
        await fs.writeFile(logFile, '', 'utf-8');
        return "Tệp nhật ký không tồn tại và đã được tạo. Hiện tại tệp đang trống.";
      } catch (writeError) {
        return "Tệp nhật ký không tồn tại và không thể tạo được.";
      }
    }
    return "Không thể đọc tệp nhật ký.";
  }
}

export async function deleteLogsAction() {
  try {
    await fs.writeFile(logFile, '');
    revalidatePath('/admin');
    return { success: true, message: 'Nhật ký đã được xóa thành công.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, message: `Không thể xóa nhật ký: ${message}` };
  }
}

export interface DashboardStats {
  totalVisits: number;
  uniqueIps: number;
  recentLogs: RecentLog[];
}

export interface RecentLog {
  timestamp: string;
  ip: string;
  device: string;
  address: string;
  accuracy: string;
  mapLink: string;
  type: 'Vị trí' | 'Ảnh';
}

function parseLogEntry(entry: string): RecentLog | null {
  const timestampMatch = entry.match(/^(.*?)\] MỚI TRUY CẬP (.*?) ---/);
  if (!timestampMatch) return null;

  const type = timestampMatch[2].includes('(Ảnh)') ? 'Ảnh' : 'Vị trí';

  const getValue = (label: string): string => {
    const match = entry.match(new RegExp(`${label}: (.*)`));
    return match ? match[1].trim() : 'N/A';
  };
  
  return {
    timestamp: new Date(timestampMatch[1]).toLocaleString('vi-VN'),
    ip: getValue('Địa chỉ IP'),
    device: getValue('Thiết bị'),
    address: getValue('Địa chỉ'),
    accuracy: getValue('Độ chính xác'),
    mapLink: getValue('Link Google Maps'),
    type: type,
  };
}


export async function getDashboardStatsAction(): Promise<{success: boolean, data: DashboardStats}> {
  try {
    const content = await fs.readFile(logFile, 'utf-8');
    const entries = content.split('--- [').filter(e => e.trim() !== '');

    const allIps = entries.map(e => {
        const match = e.match(/Địa chỉ IP: (.*)/);
        return match ? match[1].trim() : 'N/A';
    }).filter(ip => ip !== 'N/A' && ip.toLowerCase() !== 'unknown');
    const uniqueIps = new Set(allIps).size;
    
    const recentLogs: RecentLog[] = entries
      .slice(-12)
      .reverse()
      .map(parseLogEntry)
      .filter((log): log is RecentLog => log !== null);

    return {
      success: true,
      data: {
        totalVisits: entries.length,
        uniqueIps,
        recentLogs
      }
    };

  } catch (error) {
    return {
      success: false,
      data: {
        totalVisits: 0,
        uniqueIps: 0,
        recentLogs: []
      }
    };
  }
}
