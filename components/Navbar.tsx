
import React from 'react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'matches', label: 'Match Setup', icon: '📋' },
    { id: 'scoring', label: 'Scoring', icon: '🔫' },
    { id: 'analytics', label: 'Stats', icon: '📊' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-4xl mx-auto bg-gray-900 border-t border-gray-800 flex justify-around items-center p-2 z-50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            activeTab === tab.id ? 'text-red-500 bg-gray-800 shadow-inner' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <span className="text-xl">{tab.icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navbar;
