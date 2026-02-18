
import React, { useState, useRef } from 'react';
import { Camera, RefreshCw, Loader2, Sparkles, AlertCircle, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import { analyzeCropImage } from '../services/geminiService';
import { CropReport } from '../types';

interface DiseaseDetectionProps {
  t: (key: string) => string;
}

const DiseaseDetection: React.FC<DiseaseDetectionProps> = ({ t }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<CropReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        setReport(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const base64Data = image.split(',')[1];
      const result = await analyzeCropImage(base64Data);
      setReport(result);
    } catch (err) {
      setError("Analysis failed. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const severityColors = {
    Low: 'bg-blue-100 text-blue-700',
    Moderate: 'bg-yellow-100 text-yellow-700',
    High: 'bg-orange-100 text-orange-700',
    Critical: 'bg-red-100 text-red-700'
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in slide-in-from-bottom-8 duration-700">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-4xl font-black text-[#2E2E2E]">{t('diseaseId')}</h2>
        <p className="text-gray-500 font-medium">AI powered precision diagnosis for your field.</p>
      </div>

      {!image ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="group border-4 border-dashed border-[#2E7D32]/10 bg-white rounded-[3rem] p-20 flex flex-col items-center gap-6 cursor-pointer hover:border-[#2E7D32]/30 transition-all"
        >
          <div className="w-24 h-24 rounded-full bg-[#F1F8F4] flex items-center justify-center text-[#2E7D32]">
            <Camera size={40} />
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-[#2E2E2E]">{t('capture')}</p>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
              <img src={image} alt="Crop Sample" className="w-full aspect-square object-cover" />
              <button onClick={() => setImage(null)} className="absolute top-6 right-6 p-3 bg-white/90 rounded-full text-red-500">
                <RefreshCw size={24} />
              </button>
            </div>
            
            {!report && (
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full py-5 rounded-2xl font-black text-lg bg-[#2E7D32] text-white flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={28} /> : <Sparkles size={28} />}
                {t('analyze')}
              </button>
            )}
          </div>

          <div className="space-y-6">
            {loading && (
              <div className="bg-white p-12 rounded-[2.5rem] border flex flex-col items-center justify-center text-center min-h-[450px]">
                <Loader2 className="animate-spin text-[#2E7D32] mb-8" size={64} />
                <h3 className="text-2xl font-black text-[#2E2E2E]">{t('scanning')}</h3>
              </div>
            )}

            {error && (
              <div className="bg-red-50 p-8 rounded-3xl border border-red-100 flex gap-4 text-red-700 items-start">
                <AlertCircle className="shrink-0 mt-1" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {report && (
              <div className="bg-white p-10 rounded-[2.5rem] border space-y-8 animate-in zoom-in-95">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-3xl font-black text-[#2E2E2E]">{report.diseaseName}</h3>
                      <div className="flex gap-2 mt-2">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${severityColors[report.severity]}`}>
                           {report.severity}
                         </span>
                         <span className="px-3 py-1 bg-green-50 text-[#2E7D32] rounded-full text-[10px] font-black uppercase tracking-widest">
                           {Math.round(report.confidence * 100)}% Match
                         </span>
                      </div>
                    </div>
                    <AlertTriangle className="text-red-500" size={32} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="p-6 bg-[#F1F8F4] rounded-3xl border">
                    <h4 className="font-black text-[#2E7D32] mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                      <Zap size={16} /> {t('urgentActions')}
                    </h4>
                    <ul className="space-y-3">
                      {report.treatment.map((t, i) => (
                        <li key={i} className="flex gap-3 text-sm font-medium text-gray-700">
                          <CheckCircle2 className="shrink-0 text-[#2E7D32]" size={16} />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-black text-gray-800 mb-3 text-sm uppercase tracking-wider">{t('symptoms')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {report.symptoms.map((s, i) => (
                        <span key={i} className="px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold border">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseDetection;
