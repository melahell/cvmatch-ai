import React, { useState } from 'react';
import { CvCrushLogo } from './components/CvCrushLogo';
import { RefreshCcw, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [key, setKey] = useState(0);

  const reloadAnimation = () => {
    setKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Fond décoratif Ambiant (Dark Mode) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-fuchsia-600 rounded-full blur-[150px] opacity-20"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600 rounded-full blur-[150px] opacity-20"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100"></div>
      </div>

      <div className="text-center mb-12 relative z-10">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400 mb-3 tracking-tight">
          CV Crush
        </h1>
        <p className="text-slate-400 font-medium tracking-wide text-sm uppercase flex items-center justify-center gap-2">
          <Sparkles size={14} className="text-yellow-400" />
          Brand Identity • Neon Edition
          <Sparkles size={14} className="text-yellow-400" />
        </p>
      </div>

      <div className="flex flex-col items-center gap-12 relative z-10">
        
        {/* Présentation Principale - Effet Carte Sombre */}
        <div className="relative group">
          {/* Lueur arrière */}
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-violet-600 rounded-[45px] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          
          <div className="bg-slate-900/80 backdrop-blur-xl p-20 rounded-[40px] shadow-2xl border border-white/10 flex items-center justify-center relative">
            <CvCrushLogo key={key} width={220} height={220} />
          </div>
        </div>

        {/* Contrôles */}
        <button 
          onClick={reloadAnimation}
          className="flex items-center gap-3 px-8 py-4 bg-slate-800 border border-slate-700 rounded-full shadow-lg hover:shadow-pink-500/20 hover:border-pink-500/50 hover:bg-slate-800 transition-all text-slate-200 font-bold group"
        >
          <RefreshCcw size={18} className="text-pink-400 group-hover:rotate-180 transition-transform duration-700 ease-in-out" />
          <span>Replay Animation</span>
        </button>

        {/* Grille de tailles */}
        <div className="mt-4 p-8 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/5 w-full max-w-2xl">
           <div className="flex flex-wrap gap-12 items-end justify-center">
              <div className="flex flex-col items-center gap-3">
                 <div className="bg-slate-800/50 p-4 rounded-3xl border border-white/5 shadow-inner">
                    <CvCrushLogo width={80} height={80} animated={false} />
                 </div>
                 <span className="text-[10px] font-mono text-slate-500">80px (App Icon)</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                 <div className="bg-slate-800/50 p-3 rounded-2xl border border-white/5">
                    <CvCrushLogo width={48} height={48} animated={false} />
                 </div>
                 <span className="text-[10px] font-mono text-slate-500">48px (Nav)</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                 <div className="bg-slate-800/50 p-2 rounded-xl border border-white/5">
                    <CvCrushLogo width={32} height={32} animated={false} />
                 </div>
                 <span className="text-[10px] font-mono text-slate-500">32px (Favicon)</span>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default App;