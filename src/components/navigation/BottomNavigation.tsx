import { motion } from 'framer-motion';
import { Home, LayoutGrid, Sparkles, Truck, ShieldCheck } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { ScreenId } from './AppHeader';

interface BottomNavigationProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onOpenCart?: () => void;
}

export function BottomNavigation({ currentScreen, onNavigate }: BottomNavigationProps) {
  const { lang } = useLang();

  const items = [
    {
      id: 'home' as ScreenId,
      icon: Home,
      labelEn: 'Home',
      labelSw: 'Mwanzo',
    },
    {
      id: 'products' as ScreenId,
      icon: LayoutGrid,
      labelEn: 'Products',
      labelSw: 'Bidhaa',
    },
    {
      id: 'goals' as ScreenId,
      icon: Sparkles,
      labelEn: 'Goals & Deals',
      labelSw: 'Pakiti',
    },
    {
      id: 'delivery' as ScreenId,
      icon: Truck,
      labelEn: 'Delivery',
      labelSw: 'Usafirishaji',
    },
    {
      id: 'distributor' as ScreenId,
      icon: ShieldCheck,
      labelEn: 'Distributor',
      labelSw: 'Msambazaji',
    },
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-neutral-200/90 py-1 px-2 lg:hidden shadow-lg pb-[env(safe-area-inset-bottom,4px)]"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {items.map((item) => {
          const isActive = currentScreen === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              id={`bottom-nav-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all outline-none [-webkit-tap-highlight-color:transparent] relative ${
                isActive ? 'text-primary-600 font-bold' : 'text-neutral-500 hover:text-neutral-800'
              }`}
              style={{ minHeight: 48 }}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {isActive && (
                  <motion.div
                    layoutId="bottomNavDot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-600"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </div>
              <span className="text-[10px] mt-1 leading-none tracking-tight truncate max-w-full">
                {lang === 'sw' ? item.labelSw : item.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
