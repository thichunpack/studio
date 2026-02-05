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
