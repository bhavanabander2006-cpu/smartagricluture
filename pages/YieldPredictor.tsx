
import React, { useState } from 'react';
// Added Sparkles to the import list below
import { Target, Info, Loader2, CheckCircle, ChevronRight, BarChart3, TrendingUp, HelpCircle, Sparkles } from 'lucide-react';
import { predictYield } from '../services/geminiService';
import { YieldPrediction } from '../types';

// Define the props interface to include the t translation function
interface YieldPredictorProps {
  t: (key: string) => string;
}

// Update component signature to use the props interface
const YieldPredictor: React.FC<YieldPredictorProps> = ({ t }) => {
  const [data, setData] = useState({
    crop: 'Wheat',
    area: 1,
    soil: 'Loamy',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<YieldPrediction | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await predictYield(data);
      setPrediction(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        {/* Use the t function for the heading */}
        <h2 className="text-4xl font-black text-[#2E2E2E]">{t('yieldPredictor')}</h2>
        <p className="text-gray-500 font-medium">Plan your season with confidence. Our AI uses satellite climate data and historical soil performance to project your harvest.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-4 space-y-6">
          <form onSubmit={handlePredict} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
            <div className="space-y-6">
               <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Crop Selection</label>
                <select value={data.crop} onChange={(e) => setData({...data, crop: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none ring-2 ring-transparent focus:ring-[#2E7D32]/20 border border-gray-200 font-bold transition-all">
                  <option>Wheat</option><option>Corn</option><option>Rice</option><option>Sugarcane</option><option>Onion</option><option>Tomato</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Plot Size (Hectares)</label>
                <input type="number" value={data.area} onChange={(e) => setData({...data, area: parseFloat(e.target.value)})} min="0.1" step="0.1" className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none ring-2 ring-transparent focus:ring-[#2E7D32]/20 border border-gray-200 font-bold transition-all" />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Soil Composition</label>
                <select value={data.soil} onChange={(e) => setData({...data, soil: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none ring-2 ring-transparent focus:ring-[#2E7D32]/20 border border-gray-200 font-bold transition-all">
                  <option>Loamy</option><option>Clay</option><option>Sandy</option><option>Silt</option><option>Black Soil</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Region / Mandi Zone</label>
                <input type="text" value={data.location} placeholder="e.g. Haryana" onChange={(e) => setData({...data, location: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none ring-2 ring-transparent focus:ring-[#2E7D32]/20 border border-gray-200 font-bold transition-all" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-5 bg-[#2E7D32] text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-[#2E7D32]/20 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0">
              {loading ? <Loader2 className="animate-spin" size={24} /> : <BarChart3 size={24} />}
              GENERATE PROJECTION
            </button>
          </form>

          <div className="p-8 rounded-[2rem] bg-[#C9A227]/5 border border-[#C9A227]/20 flex gap-4 text-[#C9A227]">
            <HelpCircle className="shrink-0" />
            <p className="text-sm font-bold leading-relaxed">Projections are calibrated based on 5-year regional historical averages. High rainfall can skew results by ±15%.</p>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          {!prediction && !loading && (
            <div className="h-full bg-white rounded-[3rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center p-20 text-center">
              <div className="w-24 h-24 bg-[#F7FAF7] rounded-full flex items-center justify-center mb-8">
                <Target className="text-[#2E7D32]/20" size={48} />
              </div>
              <h3 className="text-2xl font-black text-[#2E2E2E] mb-3">Seasonal Harvest Estimate</h3>
              <p className="text-gray-400 font-medium max-w-sm">Select your crop and location to receive a data-backed prediction of your yield range.</p>
            </div>
          )}

          {loading && (
            <div className="h-full bg-white rounded-[3rem] p-20 flex flex-col items-center justify-center text-center space-y-8">
              <div className="relative">
                <div className="w-32 h-32 border-[10px] border-[#2E7D32]/5 border-t-[#2E7D32] rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <TrendingUp className="text-[#2E7D32] animate-bounce" size={40} />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-[#2E2E2E]">Simulating Growth Cycles</h3>
                <p className="text-gray-400 font-medium">Cross-referencing satellite moisture indexes with mandi arrival history...</p>
              </div>
            </div>
          )}

          {prediction && (
            <div className="space-y-8 animate-in slide-in-from-right-12 duration-700">
              <div className="bg-[#121917] p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col items-center">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#2E7D32]/30 blur-[120px] -mr-40 -mt-40 rounded-full" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#C9A227]/10 blur-[120px] -ml-40 -mb-40 rounded-full" />
                
                <span className="text-green-400 text-[10px] font-black tracking-[0.4em] uppercase mb-6 relative z-10">Estimated Production Range</span>
                <div className="flex items-baseline gap-4 relative z-10">
                  <span className="text-8xl font-black tracking-tighter">{prediction.yieldRange}</span>
                  <span className="text-3xl font-bold text-white/40">{prediction.unit}</span>
                </div>
                
                <div className="mt-12 w-full max-w-md grid grid-cols-2 gap-10 border-t border-white/10 pt-10 relative z-10">
                   <div className="text-center">
                     <p className="text-white/30 text-[10px] uppercase font-black tracking-widest mb-1">Confidence</p>
                     <p className="text-2xl font-black text-green-400">{Math.round(prediction.confidenceScore * 100)}%</p>
                   </div>
                   <div className="text-center">
                     <p className="text-white/30 text-[10px] uppercase font-black tracking-widest mb-1">Status</p>
                     <p className="text-2xl font-black">HIGH YIELD</p>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <h4 className="text-lg font-black text-[#2E2E2E] mb-6 flex items-center gap-2">
                    <CheckCircle className="text-[#2E7D32]" size={22} />
                    Primary Drivers
                  </h4>
                  <ul className="space-y-5">
                    {prediction.factors.map((f, i) => (
                      <li key={i} className="flex gap-4 text-sm font-semibold text-gray-600">
                        <ChevronRight className="shrink-0 text-[#2E7D32] mt-0.5" size={18} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#2E7D32] p-10 rounded-[2.5rem] shadow-xl text-white">
                  <h4 className="text-lg font-black mb-6 flex items-center gap-2">
                    <Sparkles className="text-green-300" size={22} />
                    AI Optimization Tips
                  </h4>
                  <ul className="space-y-5">
                    {prediction.recommendations.map((r, i) => (
                      <li key={i} className="flex gap-4 text-sm font-medium text-white/90 leading-relaxed">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-[10px] font-black">
                          {i + 1}
                        </div>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YieldPredictor;
