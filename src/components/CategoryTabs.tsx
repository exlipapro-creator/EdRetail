import { motion } from 'framer-motion';
import { Category } from '../types';
import { useLang } from '../context/LangContext';

interface CategoryTabsProps {
  categories: Category[];
  active: string;
  onChange: (id: string) => void;
}

export function CategoryTabs({ categories, active, onChange }: CategoryTabsProps) {
  const { t } = useLang();

  const allCategories = [
    { id: 'all', label: { en: 'All', sw: 'Zote' }, color: 'bg-gray-600' },
    ...categories,
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
      {allCategories.map((cat) => (
        <motion.button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`relative px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors outline-none [-webkit-tap-highlight-color:transparent] ${
            active === cat.id ? 'text-white' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          {active === cat.id && (
            <motion.div
              layoutId="activeCategory"
              className={`absolute inset-0 ${cat.color} rounded-full`}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{t(cat.label)}</span>
        </motion.button>
      ))}
    </div>
  );
}
