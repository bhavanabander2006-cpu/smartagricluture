
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Camera, 
  Droplets, 
  TrendingUp, 
  LineChart, 
  Bell, 
  Settings,
  Leaf,
  Menu,
  X,
  Languages,
  ChevronDown
} from 'lucide-react';
import { AppSection } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeSection: AppSection;
  setActiveSection: (section: AppSection) => void;
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  userName: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeSection, setActiveSection, language, setLanguage, t, userName }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const navItems = [
    { id: AppSection.DASHBOARD, label: t('dashboard'), icon: LayoutDashboard },
    { id: AppSection.DISEASE_DETECTION, label: t('diseaseId'), icon: Camera },
    { id: AppSection.ADVISORY, label: t('advisory'), icon: Droplets },
    { id: AppSection.YIELD_PREDICTION, label: t('yieldPredictor'), icon: TrendingUp },
    { id: AppSection.MARKET_INSIGHTS, label: t('marketPrices'), icon: LineChart },
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'mr', name: 'मराठी' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
  ];

  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div className="min-h-screen bg-[#F7FAF7] text-[#2E2E2E] flex">
      {/* Sidebar - Desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#121917] text-[#E0E0E0] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-3 p-6 mb-8 border-b border-white/10">
          <Leaf className="text-[#66BB6A] w-8 h-8" />
          <h1 className="text-xl font-bold tracking-tight">{t('appName')}</h1>
        </div>

        <nav className="px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${activeSection === item.id 
                  ? 'bg-[#2E7D32] text-white shadow-lg' 
                  : 'hover:bg-white/5 text-gray-400 hover:text-white'}
              `}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-white/10 space-y-4">
          <button 
            onClick={() => {
              setActiveSection(AppSection.SETTINGS);
              setSidebarOpen(false);
            }}
            className={`flex items-center gap-3 w-full transition-colors ${activeSection === AppSection.SETTINGS ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Settings size={20} />
            <span className="font-medium">{t('settings')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1 px-4">
            <h2 className="text-lg font-semibold text-[#2E7D32]">
              {navItems.find(i => i.id === activeSection)?.label || (activeSection === AppSection.SETTINGS ? t('settings') : t('dashboard'))}
            </h2>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-[#F1F8F4] text-[#2E7D32] rounded-full text-xs font-bold hover:bg-[#E8F3EB] transition-colors"
              >
                <Languages size={14} />
                <span className="hidden sm:inline">{languages.find(l => l.code === language)?.name}</span>
                <ChevronDown size={12} />
              </button>
              
              {isLangOpen && (
                <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  {languages.map(lang => (
                    <button 
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-[#F1F8F4] transition-all ${language === lang.code ? 'text-[#2E7D32] bg-[#F1F8F4]' : 'text-gray-600'}`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="relative p-2 text-gray-500 hover:text-[#2E7D32] hover:bg-[#F1F8F4] rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div 
              onClick={() => setActiveSection(AppSection.SETTINGS)}
              className="hidden sm:flex w-10 h-10 rounded-full bg-[#C9A227]/20 items-center justify-center text-[#C9A227] font-bold border-2 border-[#C9A227]/40 cursor-pointer hover:bg-[#C9A227]/30 transition-all"
            >
              {userInitials}
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;
