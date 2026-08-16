import React, { useState } from 'react';
import { Search, Music2, X, Plus } from 'lucide-react';
import { POPULAR_KARAOKE_CATALOG } from '../../utils/mockData';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';

interface PopularSongPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSong: (title: string, artist: string) => void;
}

export const PopularSongPicker: React.FC<PopularSongPickerProps> = ({
  isOpen,
  onClose,
  onSelectSong,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('Todos');

  if (!isOpen) return null;

  const genres = ['Todos', 'Reggaeton', 'Rock en Español', 'Pop', 'Balada', 'Cumbia', 'Salsa'];

  const filtered = POPULAR_KARAOKE_CATALOG.filter((song) => {
    const matchesSearch =
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre =
      selectedGenre === 'Todos' || song.genre.toLowerCase().includes(selectedGenre.toLowerCase());
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night-base/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[85vh] flex flex-col">
        <LiquidGlassCard variant="elevated" className="p-5 md:p-6 flex flex-col max-h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-pastel-pink/20 border border-pastel-pink/30 flex items-center justify-center">
                <Music2 className="w-5 h-5 text-pastel-pink" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Catálogo de Éxitos Karaoke</h3>
                <p className="text-xs text-slate-400">Selecciona una canción para autocompletar</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar */}
          <div className="pt-3 pb-2 flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por canción o artista..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-pastel-pink/60 text-sm"
              />
            </div>

            {/* Genre Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedGenre === genre
                      ? 'bg-pastel-pink/30 text-pastel-pink border border-pastel-pink/50'
                      : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/5'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Songs List */}
          <div className="overflow-y-auto space-y-2 py-1 flex-1 pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No se encontraron canciones en el catálogo. Puedes escribir cualquier canción directamente en el formulario.
              </div>
            ) : (
              filtered.map((song, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectSong(song.title, song.artist);
                    onClose();
                  }}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pastel-pink/40 cursor-pointer flex items-center justify-between transition-all group tap-squish"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-pastel-pink/10 border border-pastel-pink/20 flex items-center justify-center text-pastel-pink group-hover:scale-105 transition-transform">
                      <Music2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-pastel-pink transition-colors">
                        {song.title}
                      </h4>
                      <p className="text-xs text-slate-400">{song.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400">
                      {song.genre}
                    </span>
                    <button className="p-1.5 rounded-lg bg-pastel-pink/20 text-pastel-pink group-hover:bg-pastel-pink group-hover:text-night-base transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  );
};
