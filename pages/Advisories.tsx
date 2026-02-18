
import React, { useState } from 'react';
import { Droplets, Sprout, Loader2, Info, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getSmartAdvisory } from '../services/geminiService';
import { Advisory } from '../types';

interface AdvisoriesProps {
  t: (key: string) => string;
}

const Advisories: React.FC<AdvisoriesProps> = ({ t }) => {
  const [formData, setFormData] = useState({
    crop: 'Rice',
    region: '',
    stage: 'Vegetative'
  });
  const [loading, setLoading] = useState(false);
  const [advisory, setAdvisory] = useState<Advisory | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await getSmartAdvisory(formData.crop, formData.region, formData.stage);
      setAdvisory(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level?: string) => {
    if (level === 'Danger') return 'border-red-200 bg-red-50 text-red-800';
    if (level === 'Watch') return 'border-yellow-200 bg-yellow-50 text-yellow-800';
    return 'border-green-200 bg-green-50 text-green-800';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-black text-[#2E2E2E]">{t('advisory')}</h2>
        <p className="text-gray-500 max-w-2xl mx-auto font-medium">Customized farming guidance for maximum yields.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] border space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('cropName')}</label>
                <select 
                  value={formData.crop}
                  onChange={(e) => setFormData({...formData, crop: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border font-bold focus:ring-2 focus:ring-[#2E7D32] outline-none"
                >
                  <option>Rice</option><option>Wheat</option><option>Maize</option><option>Tomato</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Growth Stage</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Seedling', 'Vegetative', 'Flowering', 'Harvest'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({...formData, stage: s})}
                      className={`py-3 rounded-xl text-xs font-black border transition-all ${formData.stage === s ? 'bg-[#2E7D32] text-white border-[#2E7D32]' : 'bg-white text-gray-500 border-gray-100 hover:border-[#2E7D32]'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-5 bg-[#2E7D32] text-white rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : t('fetchAdvisory')}
            </button>
          </form>
        </div>

        <div className="lg:col-span-8 space-y-6">
          {advisory && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
              <div className={`p-8 rounded-[2.5rem] border flex items-center gap-6 ${getRiskColor(advisory.riskLevel)}`}>
                <ShieldCheck size={32} />
                <h4 className="text-xl font-black">AI Risk Assessment: {advisory.riskLevel || 'Safe'}</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-10 rounded-[2.5rem] border">
                  <Droplets className="text-blue-500 mb-6" size={32} />
                  <h4 className="text-lg font-black text-gray-800 mb-2">Irrigation</h4>
                  <p className="text-sm text-gray-500 font-medium">{advisory.irrigation}</p>
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] border">
                  <Sprout className="text-green-500 mb-6" size={32} />
                  <h4 className="text-lg font-black text-gray-800 mb-2">Fertilizer</h4>
                  <p className="text-sm text-gray-500 font-medium">{advisory.fertilizer}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Advisories;
