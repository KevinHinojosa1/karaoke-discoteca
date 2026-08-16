import React from 'react';

export const AmbientBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-night-base text-slate-100 overflow-x-hidden">
      {/* Dynamic Ambient Pastel Glowing Blobs (Liquid Glass Refractive Backdrop) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Lavender Orb */}
        <div
          className="absolute -top-[15%] -left-[10%] w-[500px] h-[500px] md:w-[650px] md:h-[650px] rounded-full blur-[130px] opacity-35 animate-blob"
          style={{ background: 'radial-gradient(circle, #E4D9FF 0%, rgba(138, 111, 200, 0.4) 60%, transparent 80%)' }}
        />
        {/* Pink Orb */}
        <div
          className="absolute top-[35%] -right-[15%] w-[450px] h-[450px] md:w-[600px] md:h-[600px] rounded-full blur-[140px] opacity-30 animate-blob"
          style={{
            background: 'radial-gradient(circle, #FFD6E8 0%, rgba(212, 106, 152, 0.4) 60%, transparent 80%)',
            animationDelay: '3s',
          }}
        />
        {/* Sky / Cyan Orb */}
        <div
          className="absolute -bottom-[15%] left-[20%] w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full blur-[150px] opacity-25 animate-blob"
          style={{
            background: 'radial-gradient(circle, #D6EFFF 0%, rgba(74, 139, 181, 0.35) 60%, transparent 80%)',
            animationDelay: '6s',
          }}
        />
        {/* Mint Accent Orb */}
        <div
          className="absolute top-[60%] -left-[10%] w-[380px] h-[380px] rounded-full blur-[120px] opacity-20 animate-blob"
          style={{
            background: 'radial-gradient(circle, #D3F8E2 0%, rgba(74, 166, 116, 0.3) 60%, transparent 80%)',
            animationDelay: '9s',
          }}
        />
        {/* Subtle Luxury Mesh Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">{children}</div>
    </div>
  );
};
