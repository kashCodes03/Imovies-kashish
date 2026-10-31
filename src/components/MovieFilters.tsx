import React from 'react';
import { Search, SlidersHorizontal, X, Film, Globe, Sparkles } from 'lucide-react';

interface MovieFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedIndustry: 'All' | 'Hollywood' | 'Bollywood';
  onIndustryChange: (ind: 'All' | 'Hollywood' | 'Bollywood') => void;
  selectedGenre: string;
  onGenreChange: (g: string) => void;
  selectedLanguage: string;
  onLanguageChange: (l: string) => void;
  selectedStatus: 'now_showing' | 'coming_soon' | 'all';
  onStatusChange: (s: 'now_showing' | 'coming_soon' | 'all') => void;
  totalCount: number;
}

const GENRES = ['All', 'Action', 'Sci-Fi', 'Fantasy', 'Thriller', 'Crime', 'Drama', 'Horror', 'Comedy'];
const LANGUAGES = ['All', 'English', 'Hindi', 'French / English', 'Hindi / Telugu'];

export const MovieFilters: React.FC<MovieFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedIndustry,
  onIndustryChange,
  selectedGenre,
  onGenreChange,
  selectedLanguage,
  onLanguageChange,
  selectedStatus,
  onStatusChange,
  totalCount
}) => {
  const hasActiveFilters = 
    searchQuery !== '' || 
    selectedIndustry !== 'All' || 
    selectedGenre !== 'All' || 
    selectedLanguage !== 'All' || 
    selectedStatus !== 'all';

  const resetFilters = () => {
    onSearchChange('');
    onIndustryChange('All');
    onGenreChange('All');
    onLanguageChange('All');
    onStatusChange('all');
  };

  return (
    <div className="w-full bg-slate-900/60 border-b border-slate-800/80 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        
        {/* Top row: Search, Hollywood/Bollywood switch, and Status toggle */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Hollywood, Bollywood, actors, directors..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 text-sm text-slate-100 rounded-xl pl-10 pr-9 py-2.5 placeholder-slate-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Hollywood / Bollywood Segmented Control */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                onClick={() => onIndustryChange('All')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  selectedIndustry === 'All'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>All Cinemas</span>
              </button>
              
              <button
                onClick={() => onIndustryChange('Hollywood')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  selectedIndustry === 'Hollywood'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Hollywood</span>
              </button>

              <button
                onClick={() => onIndustryChange('Bollywood')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  selectedIndustry === 'Bollywood'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Bollywood</span>
              </button>
            </div>

            {/* Status Segmented Control */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                onClick={() => onStatusChange('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  selectedStatus === 'all'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => onStatusChange('now_showing')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  selectedStatus === 'now_showing'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Now Playing
              </button>
              <button
                onClick={() => onStatusChange('coming_soon')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  selectedStatus === 'coming_soon'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Upcoming
              </button>
            </div>
          </div>
        </div>

        {/* Bottom row: Genre filter buttons and Language select */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          
          {/* Genre list */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-slate-500 font-medium mr-1 hidden sm:inline flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              Genre:
            </span>
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => onGenreChange(genre)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  selectedGenre === genre
                    ? 'bg-slate-800 text-amber-400 border border-amber-400/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Right controls: Language and reset */}
          <div className="flex items-center gap-3 ml-auto text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Language:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang} className="bg-slate-900 text-slate-100">
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
              >
                Reset filters
              </button>
            )}

            <span className="text-slate-500 tabular-nums">
              {totalCount} {totalCount === 1 ? 'title' : 'titles'}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
