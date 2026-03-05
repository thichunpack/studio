
import { getLinkAction } from '@/app/actions/links';
import { LinkVerificationClient } from './client';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ linkId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { linkId } = await params;
  const link = await getLinkAction(linkId);

  if (!link) {
    return {
      title: 'Link không tồn tại'
    }
  }

  return {
    title: link.title,
    description: link.description,
    openGraph: {
      title: link.title,
      description: link.description,
      images: [
        {
          url: link.imageUrl,
          width: 1200,
          height: 630,
          alt: link.title,
        },
      ],
      type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: link.title,
        description: link.description,
        images: [link.imageUrl],
    },
  }
}

export default async function PreviewPage({ params }: Props) {
  const { linkId } = await params;
  const link = await getLinkAction(linkId);

  if (!link) {
    notFound();
  }

  return <LinkVerificationClient link={link} />;
}
