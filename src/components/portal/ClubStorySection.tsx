import React from 'react';
import {
  Mic2,
  Sparkles,
  Award,
  Wine,
  Radio,
  ShieldCheck,
  HeartHandshake,
} from 'lucide-react';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';

export const ClubStorySection: React.FC = () => {
  const pillars = [
    {
      icon: <Mic2 className="w-5 h-5 text-pastel-pink" />,
      title: 'Sonido Acústico Pro',
      desc: 'Microfonía inalámbrica Shure y procesamiento vocal para que cantes como un artista profesional.',
      bg: 'bg-pastel-pink/10 border-pastel-pink/20',
    },
    {
      icon: <Wine className="w-5 h-5 text-pastel-lavender" />,
      title: 'Licores Premium 100% Genuinos',
      desc: 'Combos de botellas con sellos garantizados, acompañantes helados y coctelería de autor.',
      bg: 'bg-pastel-lavender/10 border-pastel-lavender/20',
    },
    {
      icon: <Radio className="w-5 h-5 text-pastel-mint" />,
      title: 'Cola Digital Inteligente',
      desc: 'Adiós a los papelitos perdidos. Seguimiento en tiempo real directo en la pantalla de tu celular.',
      bg: 'bg-pastel-mint/10 border-pastel-mint/20',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-pastel-sky" />,
      title: 'Show & Luces Robóticas',
      desc: 'Escenario equipado con pantallas gigantes LED y efectos de iluminación para cada canción.',
      bg: 'bg-pastel-sky/10 border-pastel-sky/20',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Editorial Story Card */}
      <LiquidGlassCard variant="elevated" className="p-5 sm:p-6 space-y-4 relative overflow-hidden">
        {/* Subtle Decorative Backdrop */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-pastel-lavender/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-pastel-yellow" />
          <span className="text-[11px] font-black uppercase tracking-widest text-pastel-yellow">
            NUESTRA HISTORIA & ESENCIA
          </span>
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Karaoke Hinojosa: Donde Cada Noche Eres la Estrella
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Nacimos con la visión de transformar la experiencia del karaoke tradicional en una noche de discoteca de primer nivel. Combinamos la calidez del canto entre amigos con la potencia de un escenario profesional, licores premium y un sistema digital vanguardista.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {pillars.map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border ${item.bg} flex items-start gap-3 transition-all hover:bg-white/10`}
            >
              <div className="p-2 rounded-xl bg-white/10 flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">{item.title}</h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Atención y Servicio Personalizado
          </span>
          <span className="flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-pastel-pink" />
            La Mejor Fiesta de la Ciudad
          </span>
        </div>
      </LiquidGlassCard>
    </div>
  );
};
