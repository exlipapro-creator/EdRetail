import { motion } from 'framer-motion';
import { Home, LayoutGrid, Target, Truck, User } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { EdIcon } from '../brand/EdIcon';
import { ScreenId } from './AppHeader';

interface BottomNavigationProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onOpenCart?: () => void;
  /** Opens the customer account/auth surface (replaces the old Portal entry). */
  onOpenAccount?: () => void;
}

export function BottomNavigation({ currentScreen, onNavigate, onOpenAccount }: BottomNavigationProps) {
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
      edIcon: 'growth' as const, // brand-layer icon (wellness goals)
      icon: Target,
      labelEn: 'Goals',
      labelSw: 'Malengo',
    },
    {
      id: 'delivery' as ScreenId,
      icon: Truck,
      labelEn: 'Delivery',
      labelSw: 'Usafirishaji',
    },
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-neutral-200/90 py-1.5 px-3 lg:hidden shadow-lg pb-[max(env(safe-area-inset-bottom),8px)]"
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
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all outline-none [-webkit-tap-highlight-color:transparent] relative cursor-pointer ${
                isActive ? 'text-[#123B6D] font-bold' : 'text-neutral-500 hover:text-neutral-800'
              }`}
              style={{ minHeight: 48 }}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative flex items-center justify-center">
                {item.edIcon ? (
                  <EdIcon
                    name={item.edIcon}
                    className={`w-5 h-5 transition-transform ${isActive ? 'scale-105 stroke-[2.5] text-[#123B6D]' : 'stroke-[1.8]'}`}
                  />
                ) : (
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-105 stroke-[2.5] text-[#123B6D]' : 'stroke-[1.8]'}`} />
                )}
                {isActive && (
                  <motion.div
                    layoutId="bottomNavDot"
                    className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#123B6D]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </div>
              <span className={`text-[10px] mt-1 leading-none tracking-tight truncate max-w-full ${isActive ? 'font-black text-[#123B6D]' : 'font-medium text-neutral-500'}`}>
                {lang === 'sw' ? item.labelSw : item.labelEn}
              </span>
            </button>
          );
        })}

        {/* Account — customer identity entry (auth modal or signed-in state).
            Distributor access is NOT here: it lives behind the deliberate
            3-pull gesture on the Goals screen, enforced server-side. */}
        <button
          id="bottom-nav-account"
          onClick={() => onOpenAccount?.()}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all outline-none [-webkit-tap-highlight-color:transparent] relative cursor-pointer text-neutral-500 hover:text-neutral-800"
          style={{ minHeight: 48 }}
          aria-label={lang === 'sw' ? 'Akaunti' : 'Account'}
        >
          <User className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] mt-1 leading-none tracking-tight truncate max-w-full font-medium text-neutral-500">
            {lang === 'sw' ? 'Akaunti' : 'Account'}
          </span>
        </button>
      </div>
    </nav>
  );
}
