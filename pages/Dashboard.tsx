
import React, { useState, useEffect } from 'react';
import { CloudRain, Thermometer, Wind, AlertTriangle, TrendingUp, Calendar, Loader2, Sparkles, ShieldCheck, Zap, ChevronDown, PlusCircle, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getRealtimeWeather, getDailyFarmAlerts } from '../services/geminiService';
import { AppSection, FarmAlert, UserCrop } from '../types';

const yieldData = [
  { name: 'Jan', yield: 3800 }, { name: 'Feb', yield: 3200 },
  { name: 'Mar', yield: 2400 }, { name: 'Apr', yield: 2900 },
  { name: 'May', yield: 2100 }, { name: 'Jun', yield: 2600 },
];

interface DashboardProps {
  onNavigate: (section: AppSection) => void;
  activeCrop: UserCrop | null;
  onCropChange: (crop: UserCrop) => void;
  userCrops: UserCrop[];
  onAddCrop: (crop: Omit<UserCrop, 'id'>) => void;
  t: (key: string) => string;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, activeCrop, onCropChange, userCrops, onAddCrop, t }) => {
  const [weather, setWeather] = useState<any>(null);
  const [alerts, setAlerts] = useState<FarmAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCropsOpen, setIsCropsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [newCrop, setNewCrop] = useState({ name: '', variety: '', area: 1, plantedDate: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    const cachedWeather = localStorage.getItem('agri_cached_weather');
    const cachedAlerts = localStorage.getItem('agri_cached_alerts');
    if (cachedWeather) setWeather(JSON.parse(cachedWeather));
    if (cachedAlerts) setAlerts(JSON.parse(cachedAlerts));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const [w, a] = await Promise.all([
            getRealtimeWeather(latitude, longitude),
            getDailyFarmAlerts(activeCrop ? `${activeCrop.name} in your region` : "regional farming")
          ]);
          setWeather(w);
          setAlerts(a);
          localStorage.setItem('agri_cached_weather', JSON.stringify(w));
          localStorage.setItem('agri_cached_alerts', JSON.stringify(a));
        } catch (err) {
          console.error("Sync failed", err);
        } finally {
          setLoading(false);
        }
      },
      () => setLoading(false)
    );
  }, [activeCrop]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCrop(newCrop);
    setIsAddModalOpen(false);
    setNewCrop({ name: '', variety: '', area: 1, plantedDate: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#2E2E2E]">{t('welcomeBack')}</h2>
          <p className="text-sm text-gray-400 font-medium">{t('realTimeStatus')} {activeCrop?.name}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setIsCropsOpen(!isCropsOpen)}
              className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm font-bold text-[#2E7D32] hover:bg-gray-50 transition-all"
            >
              <ShieldCheck size={18} />
              {activeCrop ? activeCrop.name : t('newPlot')}
              <ChevronDown size={16} />
            </button>
            
            {isCropsOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                <div className="max-h-60 overflow-y-auto">
                  {userCrops.map(crop => (
                    <button 
                      key={crop.id}
                      onClick={() => { onCropChange(crop); setIsCropsOpen(false); }}
                      className={`w-full text-left px-6 py-4 hover:bg-[#F1F8F4] transition-all flex items-center justify-between ${activeCrop?.id === crop.id ? 'bg-[#F1F8F4] text-[#2E7D32]' : ''}`}
                    >
                      <span className="font-bold">{crop.name}</span>
                      <span className="text-[10px] text-gray-400">{crop.variety}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#2E7D32] text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-[#2E7D32]/90 transition-all"
          >
            <PlusCircle size={18} />
            {t('newPlot')}
          </button>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl relative animate-in zoom-in-95">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full">
              <X size={20} />
            </button>
            <h3 className="text-2xl font-black mb-6">{t('registerPlot')}</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('cropName')}</label>
                <input required value={newCrop.name} onChange={e => setNewCrop({...newCrop, name: e.target.value})} placeholder="e.g. Field C - Soy" className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-[#2E7D32]" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('variety')}</label>
                <input required value={newCrop.variety} onChange={e => setNewCrop({...newCrop, variety: e.target.value})} placeholder="e.g. JS 335" className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-[#2E7D32]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('area')}</label>
                  <input required type="number" step="0.1" value={newCrop.area} onChange={e => setNewCrop({...newCrop, area: parseFloat(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-[#2E7D32]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('plantingDate')}</label>
                  <input required type="date" value={newCrop.plantedDate} onChange={e => setNewCrop({...newCrop, plantedDate: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-[#2E7D32]" />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-[#2E7D32] text-white rounded-2xl font-black text-sm hover:shadow-xl transition-all mt-4">
                {t('confirm')}
              </button>
            </form>
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <Thermometer className="text-orange-500" size={24} />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{t('temp')}</span>
          </div>
          <p className="text-3xl font-black text-[#2E2E2E]">{weather?.temp || '--'}°C</p>
          <p className="text-xs text-gray-500 mt-2 font-medium">{weather?.summary || '...'}</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <CloudRain className="text-blue-500" size={24} />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{t('humidity')}</span>
          </div>
          <p className="text-3xl font-black text-[#2E2E2E]">{weather?.humidity || '--'}%</p>
          <p className="text-xs text-gray-500 mt-2 font-medium">Atmosphere</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <Wind className="text-teal-500" size={24} />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{t('wind')}</span>
          </div>
          <p className="text-3xl font-black text-[#2E2E2E]">{weather?.wind || '--'} km/h</p>
          <p className="text-xs text-gray-500 mt-2 font-medium">Updated</p>
        </div>

        <div className="bg-[#2E7D32] p-6 rounded-[2rem] shadow-lg text-white">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <ShieldCheck className="text-green-300" size={24} />
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">{t('healthScore')}</span>
          </div>
          <p className="text-3xl font-black relative z-10">92 / 100</p>
          <p className="text-xs text-white/70 mt-2 font-medium relative z-10">{t('optimalGrowth')}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-[#2E2E2E]">{t('yieldBenchmark')}</h3>
              <p className="text-sm text-gray-400 font-medium">Trends for {activeCrop?.name}</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yieldData}>
                <defs>
                  <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.15}/><stop offset="95%" stopColor="#2E7D32" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 600}} />
                <Tooltip />
                <Area type="monotone" dataKey="yield" stroke="#2E7D32" strokeWidth={4} fillOpacity={1} fill="url(#colorYield)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-xl font-black text-[#2E2E2E] flex items-center gap-2 mb-6">
            <Sparkles className="text-[#C9A227]" size={22} /> {t('aiAlerts')}
          </h3>
          <div className="space-y-4 flex-1">
            {alerts.length > 0 ? (
              alerts.map((alert, i) => (
                <div key={i} className={`p-5 rounded-2xl border ${alert.urgency === 'Urgent' ? 'bg-red-50/50 border-red-100' : 'bg-gray-50/50 border-gray-100'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${alert.urgency === 'Urgent' ? 'text-red-600' : 'text-[#2E7D32]'}`}>
                      {alert.type}
                    </span>
                    {alert.urgency === 'Urgent' && <Zap className="text-red-500 animate-pulse" size={14} />}
                  </div>
                  <h4 className="font-bold text-[#2E2E2E] mb-1">{alert.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{alert.description}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Loader2 className="animate-spin text-[#2E7D32] mx-auto mb-4" />
                <p className="text-sm text-gray-400 font-bold">Syncing...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
