
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DiseaseDetection from './pages/DiseaseDetection';
import Advisories from './pages/Advisories';
import YieldPredictor from './pages/YieldPredictor';
import MarketInsights from './pages/MarketInsights';
import Schedule from './pages/Schedule';
import SettingsPage from './pages/Settings';
import VoiceAssistant from './components/VoiceAssistant';
import { AppSection, UserCrop } from './types';
import { Languages, ChevronRight, Leaf, Phone, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { TRANSLATIONS } from './translations';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('agri_logged_in') === 'true');
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.DASHBOARD);
  const [language, setLanguage] = useState(() => localStorage.getItem('agri_lang') || '');
  const [userName, setUserName] = useState(() => localStorage.getItem('agri_user_name') || 'Jai Singh');
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  
  const [userCrops, setUserCrops] = useState<UserCrop[]>(() => {
    const saved = localStorage.getItem('agri_user_crops');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', name: 'Field A - Wheat', variety: 'HD-2967', area: 2.5, plantedDate: '2024-11-10' },
      { id: '2', name: 'Field B - Tomato', variety: 'Pusa Ruby', area: 0.5, plantedDate: '2024-12-01' },
    ];
  });
  
  const [activeCrop, setActiveCrop] = useState<UserCrop | null>(() => {
    const saved = localStorage.getItem('agri_active_crop_id');
    if (saved) return userCrops.find(c => c.id === saved) || userCrops[0];
    return userCrops[0];
  });

  useEffect(() => {
    localStorage.setItem('agri_user_crops', JSON.stringify(userCrops));
  }, [userCrops]);

  useEffect(() => {
    if (language) {
      localStorage.setItem('agri_lang', language);
    }
  }, [language]);

  useEffect(() => {
    localStorage.setItem('agri_user_name', userName);
  }, [userName]);

  const t = (key: string) => {
    return TRANSLATIONS[language || 'en']?.[key] || TRANSLATIONS['en'][key] || key;
  };

  const handleLogin = (name: string) => {
    setUserName(name);
    setIsLoggedIn(true);
    localStorage.setItem('agri_logged_in', 'true');
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setLanguage('');
    setActiveSection(AppSection.DASHBOARD);
    setShowLanguagePicker(false);
  };

  const handleCropChange = (crop: UserCrop) => {
    setActiveCrop(crop);
    localStorage.setItem('agri_active_crop_id', crop.id);
  };

  const handleAddCrop = (cropData: Omit<UserCrop, 'id'>) => {
    const newCrop: UserCrop = {
      ...cropData,
      id: Math.random().toString(36).substr(2, 9),
    };
    const updatedCrops = [...userCrops, newCrop];
    setUserCrops(updatedCrops);
    setActiveCrop(newCrop);
    localStorage.setItem('agri_active_crop_id', newCrop.id);
  };

  const renderContent = () => {
    switch (activeSection) {
      case AppSection.DASHBOARD: 
        return <Dashboard 
          onNavigate={setActiveSection} 
          activeCrop={activeCrop} 
          userCrops={userCrops} 
          onCropChange={handleCropChange}
          onAddCrop={handleAddCrop}
          t={t}
        />;
      case AppSection.DISEASE_DETECTION: return <DiseaseDetection t={t} />;
      case AppSection.ADVISORY: return <Advisories t={t} />;
      case AppSection.YIELD_PREDICTION: return <YieldPredictor t={t} />;
      case AppSection.MARKET_INSIGHTS: return <MarketInsights t={t} />;
      case AppSection.SETTINGS: 
        return <SettingsPage 
          t={t} 
          userName={userName} 
          setUserName={setUserName} 
          onTriggerLangPicker={() => setShowLanguagePicker(true)}
          onLogout={handleLogout}
        />;
      case AppSection.SCHEDULE: return <Schedule onBack={() => setActiveSection(AppSection.DASHBOARD)} t={t} />;
      default: return <Dashboard 
        onNavigate={setActiveSection} 
        activeCrop={activeCrop} 
        userCrops={userCrops} 
        onCropChange={handleCropChange}
        onAddCrop={handleAddCrop}
        t={t}
      />;
    }
  };

  const LoginPage = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const onSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (name.trim()) handleLogin(name.trim());
    };

    return (
      <div className="min-h-screen bg-[#F7FAF7] flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex flex-col items-center gap-4 mb-10">
            <div className="w-20 h-20 bg-[#2E7D32] rounded-[2rem] flex items-center justify-center shadow-xl shadow-[#2E7D32]/20">
              <Leaf className="text-white" size={40} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-[#2E2E2E] tracking-tight">AgriSmart AI</h1>
              <div className="flex items-center justify-center gap-2 mt-2 text-[10px] font-black text-[#2E7D32] uppercase tracking-[0.2em]">
                <ShieldCheck size={12} />
                <span>Verified Portal</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-[#2E7D32]/5 border border-gray-100">
            <h3 className="text-2xl font-black text-[#2E2E2E] mb-8">Farmer Access</h3>
            <form onSubmit={onSubmit} className="space-y-6 text-left">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input 
                    required
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jai Singh"
                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-lg outline-none focus:ring-2 focus:ring-[#2E7D32] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input 
                    required
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-lg outline-none focus:ring-2 focus:ring-[#2E7D32] transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-5 bg-[#2E7D32] text-white rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-[#2E7D32]/20 hover:shadow-2xl hover:-translate-y-1 transition-all group"
              >
                LOGIN
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

          <p className="text-sm text-gray-400 font-medium">
            New here? Registration is automatic on first login.
          </p>
        </div>
      </div>
    );
  };

  const LanguagePickerModal = () => {
    const langs = [
      { code: 'en', name: 'English' },
      { code: 'hi', name: 'हिन्दी (Hindi)' },
      { code: 'mr', name: 'मराठी (Marathi)' },
      { code: 'te', name: 'తెలుగు (Telugu)' },
      { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    ];
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-6">
        <div className="bg-white rounded-[3rem] w-full max-w-lg p-12 shadow-2xl space-y-8 animate-in zoom-in-95">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-[#2E7D32]/10 rounded-full flex items-center justify-center text-[#2E7D32]">
              <Languages size={32} />
            </div>
            <h1 className="text-3xl font-black text-[#2E2E2E]">Select Your Language</h1>
            <p className="text-gray-400 font-medium">Welcome {userName}! Choose your preferred language.</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {langs.map(l => (
              <button 
                key={l.code}
                onClick={() => {
                  setLanguage(l.code);
                  setShowLanguagePicker(false);
                }}
                className={`flex items-center justify-between p-5 rounded-2xl border transition-all group ${language === l.code ? 'border-[#2E7D32] bg-[#F1F8F4]' : 'border-gray-100 hover:border-[#2E7D32] hover:bg-[#F1F8F4]'}`}
              >
                <span className={`text-lg font-bold ${language === l.code ? 'text-[#2E7D32]' : 'text-gray-700 group-hover:text-[#2E7D32]'}`}>{l.name}</span>
                <ChevronRight size={20} className={language === l.code ? 'text-[#2E7D32]' : 'text-gray-300 group-hover:text-[#2E7D32]'} />
              </button>
            ))}
          </div>
          {language && (
            <button 
              onClick={() => setShowLanguagePicker(false)}
              className="w-full py-4 text-gray-400 font-bold text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  };

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  if (!language || showLanguagePicker) {
    return <LanguagePickerModal />;
  }

  return (
    <Layout 
      activeSection={activeSection} 
      setActiveSection={setActiveSection}
      language={language}
      setLanguage={setLanguage}
      t={t}
      userName={userName}
    >
      <div className="animate-in fade-in duration-500">
        {renderContent()}
      </div>
      <VoiceAssistant t={t} />
    </Layout>
  );
};

export default App;
