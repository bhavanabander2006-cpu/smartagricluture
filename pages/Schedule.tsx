
import React from 'react';
import { Clock, CheckCircle2, Circle, ChevronLeft } from 'lucide-react';

interface ScheduleProps {
  onBack: () => void;
  t: (key: string) => string;
}

const Schedule: React.FC<ScheduleProps> = ({ onBack, t }) => {
  const tasks = [
    { time: '06:00 AM', task: 'Irrigation', done: true },
    { time: '08:00 AM', task: 'Fertilizer', done: true },
    { time: '10:30 AM', task: 'Soil Check', done: false },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-left-4 duration-500">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-3xl font-bold text-[#2E7D32]">{t('dailySchedule')}</h2>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border p-8 space-y-8 relative">
        {tasks.map((t, i) => (
          <div key={i} className="flex items-center gap-6 relative z-10">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${t.done ? 'bg-[#2E7D32] border-[#2E7D32] text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
              {t.done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-400 font-medium">{t.time}</p>
              <p className={`font-semibold text-lg ${t.done ? 'text-[#2E7D32]' : 'text-gray-600'}`}>{t.task}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;
