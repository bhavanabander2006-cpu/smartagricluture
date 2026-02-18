
import React, { useState } from 'react';
import { User, Bell, Globe, Shield, LogOut, ChevronRight, HelpCircle, Settings, Edit2, X, Check } from 'lucide-react';

interface SettingsPageProps {
  t: (key: string) => string;
  userName: string;
  setUserName: (name: string) => void;
  onTriggerLangPicker: () => void;
  onLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ t, userName, setUserName, onTriggerLangPicker, onLogout }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  const handleSaveName = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim());
      setIsEditingName(false);
    }
  };

  const handleSupport = () => {
    alert("Connecting to AgriSmart Support... Our agent will reach out shortly via SMS.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-[#2E7D32]">
          <Settings size={28} />
          <h2 className="text-3xl font-black text-[#2E2E2E]">{t('settings')}</h2>
        </div>
      </div>

      {/* Profile Card */}
      <div 
        onClick={() => { setTempName(userName); setIsEditingName(true); }}
        className="group flex items-center gap-6 p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer relative"
      >
        <div className="w-20 h-20 rounded-full bg-[#C9A227] flex items-center justify-center text-white text-3xl font-black shadow-lg">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-black group-hover:text-[#2E7D32] transition-colors flex items-center gap-2">
            {userName}
            <Edit2 size={16} className="text-gray-300 group-hover:text-[#2E7D32]" />
          </h2>
          <p className="text-sm text-gray-400 font-medium">AgriSmart Platinum Member</p>
          <div className="flex gap-2 mt-2">
            <span className="px-3 py-1 bg-green-50 text-[#2E7D32] text-[10px] font-black rounded-full uppercase tracking-widest border border-[#2E7D32]/10">Farmer Account Verified</span>
          </div>
        </div>
        <ChevronRight size={20} className="text-gray-200 group-hover:text-[#2E7D32] transition-all" />
      </div>

      {/* Name Edit Modal */}
      {isEditingName && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black">Edit Profile Name</h3>
              <button onClick={() => setIsEditingName(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                <input 
                  autoFocus
                  type="text" 
                  value={tempName} 
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-lg outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  placeholder="Enter your name"
                />
              </div>
              <button 
                onClick={handleSaveName}
                className="w-full py-5 bg-[#2E7D32] text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:shadow-xl transition-all"
              >
                <Check size={20} />
                SAVE CHANGES
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Section: Profile */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-4">Account Information</h3>
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <button 
              onClick={() => { setTempName(userName); setIsEditingName(true); }}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-all border-b border-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-[#F1F8F4] text-[#2E7D32] rounded-xl">
                  <User size={20} />
                </div>
                <span className="font-bold text-gray-700">Personal Information</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 font-medium">{userName}</span>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </button>
            <button 
              onClick={onTriggerLangPicker}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-[#F1F8F4] text-[#2E7D32] rounded-xl">
                  <Globe size={20} />
                </div>
                <span className="font-bold text-gray-700">{t('language')}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 font-medium">Change Settings</span>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </button>
          </div>
        </div>

        {/* Section: App Preferences */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-4">Farm Preferences</h3>
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="w-full flex items-center justify-between p-6 border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-[#F1F8F4] text-[#2E7D32] rounded-xl">
                  <Bell size={20} />
                </div>
                <div className="text-left">
                  <span className="font-bold block text-gray-700">Real-time Alerts</span>
                  <span className="text-[10px] text-gray-400 font-medium">Notifications for pests & weather</span>
                </div>
              </div>
              <button 
                onClick={() => setAlertsEnabled(!alertsEnabled)}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${alertsEnabled ? 'bg-[#2E7D32]' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${alertsEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            <div className="w-full flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-[#F1F8F4] text-[#2E7D32] rounded-xl">
                  <Shield size={20} />
                </div>
                <span className="font-bold text-gray-700">App Version</span>
              </div>
              <span className="text-sm text-gray-400 font-black">V 2.5.0 STABLE</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onLogout}
            className="flex-1 py-4 bg-white border border-red-100 text-red-500 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-red-50 transition-all shadow-sm"
          >
            <LogOut size={18} /> {t('logout').toUpperCase()}
          </button>
          <button 
            onClick={handleSupport}
            className="flex-1 py-4 bg-white border border-gray-100 text-[#2E7D32] rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
          >
            <HelpCircle size={18} /> {t('support').toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
