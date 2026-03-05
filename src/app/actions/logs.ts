
'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { getLinksAction } from './links';

const logFile = path.join(process.cwd(), 'logs', 'tracking_logs.txt');
const MAX_LOG_ENTRIES_TO_SHOW = 500;

export async function getLogContentAction() {
  try {
    const content = await fs.readFile(logFile, 'utf-8');
    const entries = content.split('--- [').filter(e => e.trim() !== '');
    const totalEntries = entries.length;

    if (totalEntries > MAX_LOG_ENTRIES_TO_SHOW) {
      const recentEntries = entries.slice(-MAX_LOG_ENTRIES_TO_SHOW);
      const informationalHeader = `--- HIỂN THỊ ${MAX_LOG_ENTRIES_TO_SHOW} MỤC GẦN NHẤT TRONG TỔNG SỐ ${totalEntries}. TẢI XUỐNG TỆP ĐỂ XEM LỊCH SỬ ĐẦY ĐỦ. ---\n\n`;
      const limitedContent = '--- [' + recentEntries.join('--- [');
      return informationalHeader + limitedContent;
    }
    return content;
  } catch (error) {
    return "";
  }
}

export async function deleteLogsAction() {
  try {
    await fs.writeFile(logFile, '');
    revalidatePath('/admin');
    return { success: true, message: 'Nhật ký đã được xóa thành công.' };
  } catch (error) {
    return { success: false, message: 'Lỗi khi xóa nhật ký.' };
  }
}

export interface RecentLog {
  timestamp: string;
  ip: string;
  isp: string;
  fraud: string;
  device: string;
  address: string;
  coordinates: string;
  accuracy: string;
  mapLink: string;
  linkId?: string;
  type: 'Vị trí' | 'Ảnh' | 'Click Link';
}

function parseValue(entry: string, label: string): string {
    const pattern = new RegExp(`${label}: (.*)`);
    const match = entry.match(pattern);
    return match ? match[1].trim() : 'N/A';
}

function parseLogEntry(entry: string): RecentLog | null {
    const timestampMatch = entry.match(/^(.*?)\] MỚI TRUY CẬP/);
    if (!timestampMatch) return null;

    let type: RecentLog['type'] = 'Vị trí';
    if(entry.includes('(Ảnh)')) type = 'Ảnh';
    if(entry.includes('Link ID:')) type = 'Click Link';

    return {
        timestamp: new Date(timestampMatch[1]).toLocaleString('vi-VN'),
        ip: parseValue(entry, 'Địa chỉ IP'),
        isp: parseValue(entry, 'ISP'),
        fraud: parseValue(entry, 'Bảo mật'),
        device: parseValue(entry, 'Thiết bị'),
        address: parseValue(entry, 'Địa chỉ'),
        coordinates: parseValue(entry, 'Tọa độ'),
        accuracy: parseValue(entry, 'Độ chính xác'),
        mapLink: parseValue(entry, 'Link Google Maps'),
        linkId: parseValue(entry, 'Link ID'),
        type: type,
    };
}

export async function getDashboardStatsAction() {
  try {
    const content = await fs.readFile(logFile, 'utf-8');
    const links = await getLinksAction();
    const entries = content.split('--- [').filter(e => e.trim() !== '');

    const allIps = entries.map(e => parseValue(e, 'Địa chỉ IP')).filter(ip => ip !== 'N/A');
    const uniqueIps = new Set(allIps).size;
    
    const recentLogs = entries
      .slice(-100)
      .reverse()
      .map(parseLogEntry)
      .filter((log): log is RecentLog => log !== null);

    return {
      success: true,
      data: {
        totalVisits: entries.length,
        uniqueIps,
        totalLinks: links.length,
        recentLogs
      }
    };
  } catch (error) {
    return {
      success: false,
      data: { totalVisits: 0, uniqueIps: 0, totalLinks: 0, recentLogs: [] }
    };
  }
}
