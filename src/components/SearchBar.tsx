import { Search, X } from 'lucide-react';
import { useLang } from '../context/LangContext';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const { lang } = useLang();

  return (
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={lang === 'sw' ? 'Tafuta bidhaa...' : 'Search products...'}
        className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2.5 rounded-md touch-manipulation outline-none [-webkit-tap-highlight-color:transparent]"
          aria-label={lang === 'sw' ? 'Futa utafutaji' : 'Clear search'}
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
