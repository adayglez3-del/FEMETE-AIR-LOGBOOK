import React from 'react';
import { NavigationTab } from '../../types';
import { LayoutDashboard, PlaneTakeoff, Navigation, Wrench, Menu } from 'lucide-react';

interface BottomNavProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onNavigate }) => {
  const tabs = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Inicio',
      icon: LayoutDashboard,
    },
    {
      id: 'flights' as NavigationTab,
      label: 'Vuelos',
      icon: PlaneTakeoff,
    },
    {
      id: 'tactical-map' as NavigationTab,
      label: 'Mapa GNSS',
      icon: Navigation,
    },
    {
      id: 'fleet' as NavigationTab,
      label: 'Drones',
      icon: Wrench,
    },
    {
      id: 'reports' as NavigationTab,
      label: 'Más',
      icon: Menu,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe bg-white/95 dark:bg-[#0b1320]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] transition-colors">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            currentTab === tab.id ||
            (tab.id === 'flights' && currentTab === 'new-flight');

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-all relative ${
                isActive
                  ? 'text-[#005596] dark:text-[#38bdf8] font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {isActive && (
                <span className="absolute top-1 w-6 h-1 rounded-full bg-[#005596] dark:bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]"></span>
              )}
              <Icon
                className={`w-5 h-5 mb-0.5 transition-transform ${
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                }`}
              />
              <span className="text-[10px] tracking-tight leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
