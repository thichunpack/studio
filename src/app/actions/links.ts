'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

const dataDir = path.join(process.cwd(), 'src', 'data');
const linksFilePath = path.join(dataDir, 'links.json');

export interface Link {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  redirectUrl: string;
  createdAt: string;
}

async function readLinksFile(): Promise<Link[]> {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    const fileContent = await fs.readFile(linksFilePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT' || error instanceof SyntaxError) {
      await fs.writeFile(linksFilePath, '[]', 'utf-8');
      return [];
    }
    return [];
  }
}

async function writeLinksFile(links: Link[]): Promise<boolean> {
  try {
    await fs.writeFile(linksFilePath, JSON.stringify(links, null, 2), 'utf-8');
    return true;
  } catch (error) {
    return false;
  }
}

export async function getLinksAction(): Promise<Link[]> {
  const links = await readLinksFile();
  return links.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getLinkAction(id: string): Promise<Link | null> {
  const links = await readLinksFile();
  return links.find(link => link.id === id) || null;
}

export async function createLinkAction(data: Omit<Link, 'id' | 'createdAt'> & { id?: string }): Promise<{ success: boolean; link?: Link; message?: string }> {
  const links = await readLinksFile();
  
  // Check if custom ID already exists
  if (data.id && links.find(l => l.id === data.id)) {
    return { success: false, message: 'Mã ID này đã tồn tại.' };
  }

  const newLink: Link = {
    title: data.title,
    description: data.description,
    imageUrl: data.imageUrl,
    redirectUrl: data.redirectUrl,
    id: data.id || uuidv4().substring(0, 8),
    createdAt: new Date().toISOString(),
  };
  
  links.push(newLink);
  const success = await writeLinksFile(links);
  if (success) {
    revalidatePath('/links');
    revalidatePath('/dashboard');
    return { success: true, link: newLink };
  }
  return { success: false };
}

export async function deleteLinkAction(id: string): Promise<{ success: boolean }> {
  let links = await readLinksFile();
  const initialLength = links.length;
  links = links.filter(link => link.id !== id);
  if (links.length < initialLength) {
    const success = await writeLinksFile(links);
    if (success) {
      revalidatePath('/links');
      revalidatePath('/dashboard');
      return { success: true };
    }
  }
  return { success: false };
}
