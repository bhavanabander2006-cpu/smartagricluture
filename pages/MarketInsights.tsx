
import React, { useState } from 'react';
import { ShoppingBag, TrendingUp, ExternalLink, Loader2, Search, Zap, BarChart3, MapPin, Phone, Info } from 'lucide-react';
import { searchNearbyFertilizers, getAllCommodityPrices } from '../services/geminiService';

interface MarketInsightsProps {
  t: (key: string) => string;
}

const MarketInsights: React.FC<MarketInsightsProps> = ({ t }) => {
  const [loading, setLoading] = useState(false);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [districtInput, setDistrictInput] = useState('');
  const [locations, setLocations] = useState<{ title: string; uri: string }[]>([]);
  const [responseText, setResponseText] = useState<string | null>(null);
  const [marketPrices, setMarketPrices] = useState<any[]>([
    { item: 'Rice', price: '₹4,200', change: '+5%', up: true, sentiment: 'Hold for peak' },
    { item: 'Wheat', price: '₹2,350', change: '-2%', up: false, sentiment: 'Sell now' },
    { item: 'Tomato', price: '₹1,800', change: '+12%', up: true, sentiment: 'High demand' },
    { item: 'Onion', price: '₹2,100', change: '+3%', up: true, sentiment: 'Stable' },
  ]);

  const handleFetchAllPrices = async () => {
    setPricesLoading(true);
    try {
      const result = await getAllCommodityPrices();
      if (result.prices) setMarketPrices(result.prices);
    } catch (err) {
      console.error("Mandi price fetch failed:", err);
    } finally {
      setPricesLoading(false);
    }
  };

  const handleLocateCenters = async () => {
    setLoading(true);
    setResponseText(null);
    setLocations([]);
    
    try {
      if (districtInput.trim()) {
        const result = await searchNearbyFertilizers({ district: districtInput.trim() });
        setLocations(result.places || []);
        setResponseText(result.text);
      } else {
        if (!navigator.geolocation) {
          alert("Geolocation is not supported by your browser. Please enter a district name.");
          setLoading(false);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const result = await searchNearbyFertilizers({ 
                lat: position.coords.latitude, 
                lng: position.coords.longitude 
              });
              setLocations(result.places || []);
              setResponseText(result.text);
            } catch (err) {
              console.error("Geolocation-based search failed:", err);
              setResponseText("Failed to retrieve local data from Gemini.");
            } finally {
              setLoading(false);
            }
          },
          (err) => {
            console.error("Geolocation access denied:", err);
            alert("Could not access your location. Please enter a district or city name instead.");
            setLoading(false);
          },
          { timeout: 10000 }
        );
        return;
      }
    } catch (err) {
      console.error("Search failed:", err);
      setResponseText("An error occurred during search. Please check your connection and try again.");
    } finally {
      if (districtInput.trim()) setLoading(false);
    }
  };

  const govSchemes = [
    { name: 'PM-Kisan Samman Nidhi', url: 'https://pmkisan.gov.in/', desc: 'Direct income support of ₹6000/year' },
    { name: 'Pradhan Mantri Fasal Bima', url: 'https://pmfby.gov.in/', desc: 'Crop insurance against natural calamities' },
    { name: 'Soil Health Card Scheme', url: 'https://soilhealth.dac.gov.in/', desc: 'Analysis for better crop productivity' },
    { name: 'e-NAM Marketplace', url: 'https://www.enam.gov.in/', desc: 'Online trading platform for commodities' }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Market Prices */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-green-50 rounded-xl text-[#2E7D32]">
                 <BarChart3 size={24} />
               </div>
               <h3 className="text-2xl font-black text-[#2E2E2E]">{t('mandiPrices')}</h3>
            </div>
            <button 
              onClick={handleFetchAllPrices} 
              disabled={pricesLoading} 
              className="px-6 py-2 rounded-full border border-[#2E7D32]/20 text-sm font-bold text-[#2E7D32] hover:bg-[#2E7D32] hover:text-white transition-all disabled:opacity-50"
            >
              {pricesLoading ? <Loader2 className="animate-spin" size={14} /> : "REFRESH LIVE PRICES"}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketPrices.map((m, i) => (
              <div key={i} className="flex flex-col p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:border-[#2E7D32]/30 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${m.up ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      <TrendingUp size={18} className={m.up ? '' : 'rotate-180'} />
                    </div>
                    <p className="font-black text-gray-800">{m.item}</p>
                  </div>
                  <span className={`text-xs font-black px-2 py-1 rounded-lg ${m.up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {m.change}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-auto">
                  <p className="text-3xl font-black text-[#2E2E2E]">{m.price}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{m.sentiment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Schemes & Centers */}
        <div className="space-y-8">
          {/* Government Schemes */}
          <div className="bg-[#121917] p-8 rounded-[3rem] text-white shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <ShoppingBag size={28} className="text-[#66BB6A]" />
              <h3 className="text-xl font-black">{t('schemes')}</h3>
            </div>
            <div className="space-y-4">
              {govSchemes.map((s, i) => (
                <a 
                  key={i} 
                  href={s.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-[#66BB6A]/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-black text-[#66BB6A] group-hover:underline">{s.name}</span>
                    <ExternalLink size={14} className="text-white/30 group-hover:text-[#66BB6A]" />
                  </div>
                  <p className="text-[10px] text-white/50 font-medium">{s.desc}</p>
                </a>
              ))}
            </div>
          </div>

          {/* Input Centers Search */}
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-5">
            <div className="flex items-center gap-3 text-[#2E7D32]">
              <MapPin size={24} />
              <h3 className="text-lg font-black">{t('inputCenters')}</h3>
            </div>
            
            <p className="text-xs text-gray-400 font-medium">Find fertilizer and seed shops in your city.</p>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="District or City Name" 
                value={districtInput}
                onChange={(e) => setDistrictInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLocateCenters()}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#2E7D32]/20 transition-all"
              />
              <button 
                onClick={handleLocateCenters} 
                disabled={loading} 
                className="p-4 bg-[#2E7D32] text-white rounded-2xl hover:bg-[#2E7D32]/90 disabled:opacity-50 shadow-lg shadow-[#2E7D32]/20 transition-all flex items-center justify-center min-w-[56px]"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
              </button>
            </div>

            {/* Detailed Results Display */}
            <div className="space-y-4 mt-6">
              {loading && (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <div className="w-10 h-10 border-4 border-[#F1F8F4] border-t-[#2E7D32] rounded-full animate-spin" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Searching local stores...</p>
                </div>
              )}

              {responseText && (
                <div className="p-5 bg-[#F1F8F4] rounded-[2rem] border border-[#2E7D32]/10 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                  <div className="flex items-center gap-2 text-[#2E7D32] mb-2">
                    <Info size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Store Directory</span>
                  </div>
                  <div className="text-xs text-gray-700 leading-relaxed font-medium whitespace-pre-line">
                    {responseText}
                  </div>
                  
                  {locations.length > 0 && (
                    <div className="pt-4 border-t border-[#2E7D32]/10 space-y-2">
                      <p className="text-[10px] font-black text-[#2E7D32] uppercase tracking-widest mb-2">Available Links</p>
                      {locations.map((loc, idx) => (
                        <a 
                          key={idx} 
                          href={loc.uri} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center justify-between p-4 bg-white rounded-xl text-[10px] font-bold text-gray-800 hover:text-[#2E7D32] hover:bg-gray-50 transition-all border border-gray-100 shadow-sm"
                        >
                          <span className="truncate pr-2">{loc.title}</span>
                          <MapPin size={12} className="shrink-0 text-[#2E7D32]" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!loading && !responseText && !districtInput && (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="text-gray-300" size={24} />
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-loose">
                    Enter a city or <br/>
                    <button onClick={handleLocateCenters} className="text-[#2E7D32] underline hover:no-underline">Use My Location</button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2E7D3233;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default MarketInsights;
