import React, { useState } from 'react';
import { Sparkles, Music } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface AnimatedKaraokeMascotProps {
  status?: 'waiting_queue' | 'cooldown' | 'now_playing' | 'ready' | 'idle';
  position?: number;
  estimatedWaitMin?: number;
  message?: string;
}

export const AnimatedKaraokeMascot: React.FC<AnimatedKaraokeMascotProps> = ({
  status = 'waiting_queue',
  position = 1,
  estimatedWaitMin = 3.5,
  message,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [easterEggTapCount, setEasterEggTapCount] = useState(0);

  const handleMascotTap = () => {
    soundManager.playTap();
    setEasterEggTapCount((prev) => prev + 1);
  };

  const getDefaultMessage = () => {
    if (message) return message;
    switch (status) {
      case 'now_playing':
        return '🔥 ¡A ROMPER LA TARIMA! ¡Tu voz está encendiendo el club!';
      case 'waiting_queue':
        if (position === 1) return '⚡ ¡Eres el siguiente! Prepara el micrófono y sube a tarima.';
        return `🎶 ¡Calentando cuerdas vocales! Eres el #${position} en cola (~${estimatedWaitMin} min).`;
      case 'cooldown':
        return '❄️ ¡Tomando un trago helado! Tu mesa está recargando energía para la próxima.';
      case 'ready':
        return '⭐ ¡Todo listo para cantar! Pide tu temazo favorito.';
      case 'idle':
      default:
        return '🎤 ¡El DJ tiene la pista lista! Elige tu canción y demuestra tu talento.';
    }
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center py-4 px-3 select-none transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Speech Bubble */}
      <div className="relative mb-3.5 max-w-xs animate-in zoom-in-90 duration-300">
        <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-glow-lavender text-center relative z-10">
          <p className="text-xs font-bold text-white tracking-tight flex items-center justify-center gap-1.5 flex-wrap">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span>{getDefaultMessage()}</span>
          </p>
        </div>
        {/* Triangle Tail */}
        <div className="w-3 h-3 bg-white/10 border-b border-r border-white/20 transform rotate-45 mx-auto -mt-1.5 relative z-0" />
      </div>

      {/* Mascot Animated Character (Interactive SVG) */}
      <div
        onClick={handleMascotTap}
        className={`relative cursor-pointer transition-transform duration-300 ${
          isHovered ? 'scale-110' : 'scale-100'
        }`}
        title="¡Haz clic en Hino-Beat!"
      >
        {/* Floating Musical Notes Sparkles */}
        <div className="absolute -top-3 -left-3 animate-bounce text-pastel-lavender">
          <Music className="w-4 h-4" />
        </div>
        <div className="absolute -top-4 -right-3 animate-pulse text-pastel-pink">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="absolute -bottom-1 -left-2 text-pastel-mint animate-bounce" style={{ animationDelay: '0.3s' }}>
          <Music className="w-3.5 h-3.5" />
        </div>

        {/* Mascot SVG Vector */}
        <svg
          width="130"
          height="125"
          viewBox="0 0 130 125"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_10px_25px_rgba(228,217,255,0.4)]"
        >
          {/* Outer Headphones Headband */}
          <path
            d="M 28 55 C 28 20, 102 20, 102 55"
            stroke="url(#headband-gradient)"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Headphone Cushions Left & Right */}
          <rect
            x="20"
            y="48"
            width="12"
            height="26"
            rx="6"
            fill="#FFD6E8"
            className="animate-pulse"
          />
          <rect
            x="98"
            y="48"
            width="12"
            height="26"
            rx="6"
            fill="#FFD6E8"
            className="animate-pulse"
          />

          {/* LED Glowing Rings on Headphones */}
          <circle cx="26" cy="61" r="3.5" fill="#A78BFA" />
          <circle cx="104" cy="61" r="3.5" fill="#A78BFA" />

          {/* Character Body (Spherical Floating Bot / Beat Bunny) */}
          <circle
            cx="65"
            cy="65"
            r="38"
            fill="url(#mascot-body-gradient)"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="2.5"
          />

          {/* Specular Highlight on Forehead */}
          <ellipse
            cx="55"
            cy="42"
            rx="14"
            ry="6"
            transform="rotate(-20 55 42)"
            fill="rgba(255, 255, 255, 0.45)"
          />

          {/* Blush Cheeks */}
          <ellipse cx="42" cy="74" rx="6" ry="3.5" fill="#F472B6" opacity="0.6" />
          <ellipse cx="88" cy="74" rx="6" ry="3.5" fill="#F472B6" opacity="0.6" />

          {/* Big Expressive Anime/Cyber Eyes */}
          {easterEggTapCount % 2 === 0 ? (
            <>
              {/* Left Eye */}
              <circle cx="48" cy="60" r="7" fill="#0F172A" />
              <circle cx="46" cy="58" r="2.8" fill="#FFFFFF" />
              <circle cx="50" cy="62" r="1.2" fill="#FFFFFF" />

              {/* Right Eye */}
              <circle cx="82" cy="60" r="7" fill="#0F172A" />
              <circle cx="80" cy="58" r="2.8" fill="#FFFFFF" />
              <circle cx="84" cy="62" r="1.2" fill="#FFFFFF" />
            </>
          ) : (
            /* Winking Happy Eyes (On Tap) */
            <>
              <path
                d="M 42 62 Q 48 53 54 62"
                stroke="#0F172A"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 76 62 Q 82 53 88 62"
                stroke="#0F172A"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
            </>
          )}

          {/* Cute Singing / Open Rhythmic Mouth */}
          <path
            d="M 57 73 Q 65 83 73 73 Z"
            fill="#E11D48"
            stroke="#0F172A"
            strokeWidth="1.5"
          />
          <path
            d="M 60 76 Q 65 79 70 76"
            stroke="#FDA4AF"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Golden Microphone in Hand */}
          <g transform="translate(86, 75) rotate(15)">
            <rect x="0" y="8" width="6" height="18" rx="2" fill="#475569" />
            <ellipse cx="3" cy="5" rx="7" ry="9" fill="url(#mic-gold-gradient)" />
            {/* Mic Mesh Lines */}
            <line x1="-2" y1="5" x2="8" y2="5" stroke="#78350F" strokeWidth="0.8" />
            <line x1="3" y1="0" x2="3" y2="10" stroke="#78350F" strokeWidth="0.8" />
          </g>

          {/* Gradients */}
          <defs>
            <linearGradient id="mascot-body-gradient" x1="27" y1="27" x2="103" y2="103" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F8FAFC" />
              <stop offset="0.6" stopColor="#E2E8F0" />
              <stop offset="1" stopColor="#CBD5E1" />
            </linearGradient>

            <linearGradient id="headband-gradient" x1="28" y1="20" x2="102" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor="#C084FC" />
              <stop offset="0.5" stopColor="#F472B6" />
              <stop offset="1" stopColor="#38BDF8" />
            </linearGradient>

            <linearGradient id="mic-gold-gradient" x1="0" y1="0" x2="6" y2="10" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE047" />
              <stop offset="1" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Equalizer Wave Beneath Mascot */}
      <div className="flex items-center gap-1 mt-2.5 h-4">
        <span className="w-1 rounded-full bg-pastel-lavender eq-bar-1" />
        <span className="w-1 rounded-full bg-pastel-pink eq-bar-2" />
        <span className="w-1 rounded-full bg-pastel-mint eq-bar-3" />
        <span className="w-1 rounded-full bg-pastel-sky eq-bar-4" />
        <span className="w-1 rounded-full bg-pastel-lavender eq-bar-2" />
        <span className="w-1 rounded-full bg-pastel-pink eq-bar-1" />
      </div>
    </div>
  );
};
