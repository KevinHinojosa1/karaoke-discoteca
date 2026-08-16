import React from 'react';
import { Mic2 } from 'lucide-react';

export const AppBrandLogo: React.FC = () => {
  return (
    <div className="flex items-center gap-2.5 p-1 select-none">
      <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-pastel-lavender/30 via-pastel-pink/20 to-pastel-sky/30 border border-white/20 flex items-center justify-center shadow-liquid-sm">
        <Mic2 className="w-5 h-5 text-pastel-lavender" />
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pastel-pink animate-pulse" />
      </div>
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-pastel-lavender to-pastel-pink bg-clip-text text-transparent">
            KARAOKE HINOJOSA
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-md bg-pastel-lavender/15 text-pastel-lavender border border-pastel-lavender/25">
            LIVE
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium tracking-wide">
          Discoteca & Bar Digital
        </span>
      </div>
    </div>
  );
};
