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
    // Ensure it's a valid array
    const data = JSON.parse(fileContent);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT' || error instanceof SyntaxError) {
      await fs.writeFile(linksFilePath, '[]', 'utf-8');
      return [];
    }
    console.error("Error reading links file:", error);
    return [];
  }
}

async function writeLinksFile(links: Link[]): Promise<boolean> {
  try {
    await fs.writeFile(linksFilePath, JSON.stringify(links, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error("Error writing links file:", error);
    return false;
  }
}

export async function getLinksAction(): Promise<Link[]> {
  const links = await readLinksFile();
  // Sort by creation date, newest first
  return links.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getLinkAction(id: string): Promise<Link | null> {
  const links = await readLinksFile();
  return links.find(link => link.id === id) || null;
}

export async function createLinkAction(data: Omit<Link, 'id' | 'createdAt'>): Promise<{ success: boolean; link?: Link }> {
  const links = await readLinksFile();
  const newLink: Link = {
    ...data,
    id: uuidv4(),
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
