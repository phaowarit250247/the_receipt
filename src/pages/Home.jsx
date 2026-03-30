import { LayoutGrid } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors duration-500">
      
      {/* Icon */}
      <div className="mb-12 relative">
        <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
        <div className="relative p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 border border-white dark:border-slate-800 text-indigo-600">
          <LayoutGrid size={48} strokeWidth={1.5} />
        </div>
      </div>

      {/* Headline */}
      <div className="space-y-4 text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white">
          Inventory <span className="text-indigo-600">Sync.</span>
        </h1>
        
        {/* Simple Divider Line */}
        <div className="w-12 h-1 bg-slate-200 dark:bg-slate-800 mx-auto rounded-full" />
      </div>

      {/* Subtle Footer */}
      <div className="fixed bottom-12">
        <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.5em]">
          AddPay IT Service
        </p>
      </div>
      
    </div>
  );
}