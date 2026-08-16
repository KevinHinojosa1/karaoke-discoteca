import React, { useState } from 'react';
import {
  Wine,
  Sparkles,
  Crown,
  Search,
  Check,
  GlassWater,
  BellRing,
} from 'lucide-react';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import {
  LIQUOR_CATEGORIES,
  LIQUOR_MENU_ITEMS,
  MenuItem,
} from '../../data/liquorMenu';

interface LiquorCombosMenuProps {
  onBackToHome?: () => void;
  onRequestSong?: () => void;
}

export const LiquorCombosMenu: React.FC<LiquorCombosMenuProps> = () => {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItemForOrder, setSelectedItemForOrder] = useState<MenuItem | null>(null);
  const [orderFeedback, setOrderFeedback] = useState(false);

  const filteredItems = LIQUOR_MENU_ITEMS.filter((item) => {
    const matchesCategory =
      activeCategory === 'todos' || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCallWaiterForOrder = (item: MenuItem) => {
    setSelectedItemForOrder(item);
    setOrderFeedback(true);
    setTimeout(() => {
      setOrderFeedback(false);
    }, 4000);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pastel-yellow/20 border border-pastel-yellow/40 text-pastel-yellow text-xs font-black">
          <Wine className="w-3.5 h-3.5" />
          <span>CARTA DE LICORES & COMBOS VIP</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Barra & Coctelería Hinojosa
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Disfruta los mejores licores mientras cantas. ¡Alcanza <strong>$100</strong> en consumo para obtener <strong>5 canciones VIP con Prioridad Alta</strong>!
        </p>
      </div>

      {/* VIP Consumption Benefit Explainer Box */}
      <LiquidGlassCard
        variant="lavender"
        className="p-4 border-2 border-amber-300/40 bg-gradient-to-br from-amber-400/10 via-purple-500/10 to-pastel-pink/10 shadow-glow-yellow"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center flex-shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-black text-white flex items-center gap-1.5 text-sm">
              <span>Beneficio de Karaoke por Consumo</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span><strong>Consumo $100+:</strong> 5 canciones • Prioridad Alta ⭐</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pastel-lavender" />
                <span><strong>Consumo $50 - $99:</strong> 5 canciones • Prioridad Media 💎</span>
              </div>
            </div>
          </div>
        </div>
      </LiquidGlassCard>

      {/* Search and Category Filter Chips */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar combos, whisky, tequila, cócteles..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-pastel-lavender text-xs sm:text-sm"
          />
        </div>

        {/* Categories (Horizontal scrolling) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-2 px-2 sm:mx-0 sm:px-0 no-scrollbar">
          {LIQUOR_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 tap-squish ${
                activeCategory === cat.id
                  ? 'bg-pastel-lavender/30 text-pastel-lavender border border-pastel-lavender/50 shadow-glow-lavender'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Order Feedback Alert */}
      {orderFeedback && selectedItemForOrder && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs flex items-center justify-between animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-emerald-400 animate-bounce" />
            <div>
              <strong className="block text-white">¡Avisa a tu mesero o en barra!</strong>
              <span>Has seleccionado: <strong>{selectedItemForOrder.name}</strong> (${selectedItemForOrder.price}).</span>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-400/20 px-2 py-1 rounded-lg border border-emerald-400/30">
            Mesa lista
          </span>
        </div>
      )}

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {filteredItems.map((item) => (
          <LiquidGlassCard
            key={item.id}
            variant={item.isVipEligible ? 'elevated' : 'subtle'}
            className="p-4 sm:p-5 flex flex-col justify-between relative group hover:border-white/25 transition-all"
          >
            <div>
              {/* Header with Title and Price */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  {item.tag && (
                    <span
                      className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider mb-1.5 inline-block border ${
                        item.badgeColor || 'border-pastel-lavender/40 bg-pastel-lavender/15 text-pastel-lavender'
                      }`}
                    >
                      {item.tag}
                    </span>
                  )}
                  <h3 className="text-base sm:text-lg font-black text-white group-hover:text-pastel-lavender transition-colors">
                    {item.name}
                  </h3>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-xl sm:text-2xl font-black text-emerald-400">
                    ${item.price}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {item.description}
              </p>

              {/* Included items */}
              {item.includes && item.includes.length > 0 && (
                <div className="mt-3 space-y-1 pt-2.5 border-t border-white/10">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Incluye:
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {item.includes.map((inc, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-pastel-mint" />
                        {inc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              {item.isVipEligible ? (
                <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  Prioridad VIP Karaoke
                </span>
              ) : (
                <span className="text-[10px] text-slate-400">
                  Servicio a la mesa
                </span>
              )}

              <button
                onClick={() => handleCallWaiterForOrder(item)}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-pastel-lavender/30 text-white hover:text-pastel-lavender border border-white/15 text-xs font-semibold flex items-center gap-1.5 transition-all tap-squish"
              >
                <GlassWater className="w-3.5 h-3.5 text-pastel-pink" />
                <span>Pedir este combo</span>
              </button>
            </div>
          </LiquidGlassCard>
        ))}
      </div>
    </div>
  );
};
