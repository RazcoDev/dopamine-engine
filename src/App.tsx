import { useEffect, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Target, Send, Layout, Flame, Trophy, Zap, Settings2, X } from 'lucide-react';
import confetti from 'canvas-confetti';

type GoalType = 'posts' | 'dms';

interface GoalState {
  current: number;
  target: number;
}

export default function App() {
  const [posts, setPosts] = useState<GoalState>({ current: 0, target: 5 });
  const [dms, setDms] = useState<GoalState>({ current: 0, target: 20 });
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const playRetroSound = (type: 'hit' | 'victory') => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    
    if (type === 'hit') {
      // Retro Hit/Punch Sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.1);

      // Add a bit of noise for the "impact"
      const bufferSize = ctx.sampleRate * 0.05;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      
      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start();
    } else if (type === 'victory') {
      // Retro Victory Fanfare (Arpeggio)
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.3);
      });
    }
  };

  const triggerDopamine = (type: GoalType) => {
    const isPost = type === 'posts';
    const state = isPost ? posts : dms;
    const setter = isPost ? setPosts : setDms;

    setter(prev => ({ ...prev, current: prev.current + 1 }));
    setLastAction(type);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 300);

    // Play Retro Sound
    if (state.current + 1 === state.target) {
      playRetroSound('victory');
    } else {
      playRetroSound('hit');
    }

    // Confetti explosion
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: isPost ? ['#00FF00', '#FFFFFF', '#008000'] : ['#F27D26', '#FFFFFF', '#FF4500'],
      scalar: 1.2,
    });

    // Special "Goal Reached" explosion
    if (state.current + 1 === state.target) {
      setTimeout(() => {
        confetti({
          particleCount: 400,
          spread: 160,
          origin: { y: 0.5 },
          colors: ['#FFD700', '#FFA500', '#FF4500'],
          scalar: 2,
        });
      }, 200);
    }
  };

  const calculateProgress = (state: GoalState) => {
    return Math.min((state.current / state.target) * 100, 100);
  };

  const getMotivationalMessage = () => {
    const messages = [
      "YOU ARE A BEAST!",
      "UNSTOPPABLE!",
      "DOMINATING THE FEED!",
      "KEEP CRUSHING IT!",
      "LEGENDARY STATUS!",
      "DOPAMINE OVERLOAD!",
      "PURE POWER!",
      "LINKEDIN GOD MODE!",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 md:p-8 transition-all duration-300 ${isShaking ? 'shake' : ''}`}>
      {/* Background Atmosphere */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/20 blur-[120px] rounded-full" />
      </div>

      <header className="w-full max-w-4xl flex justify-between items-center mb-12">
        <div className="flex flex-col">
          <h1 className="font-display text-5xl md:text-7xl uppercase tracking-tighter leading-none">
            Dopamine <span className="text-emerald-500">Engine</span>
          </h1>
          <p className="font-mono text-xs opacity-50 uppercase tracking-widest mt-2">
            System Status: High Performance / Goal Oriented
          </p>
        </div>
        <button 
          onClick={() => setIsConfiguring(true)}
          className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
        >
          <Settings2 className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </header>

      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Posts Section */}
        <CounterCard 
          title="LinkedIn Posts"
          icon={<Layout className="w-6 h-6" />}
          state={posts}
          color="emerald"
          onIncrement={() => triggerDopamine('posts')}
          progress={calculateProgress(posts)}
        />

        {/* DMs Section */}
        <CounterCard 
          title="Direct Messages"
          icon={<Send className="w-6 h-6" />}
          state={dms}
          color="orange"
          onIncrement={() => triggerDopamine('dms')}
          progress={calculateProgress(dms)}
        />
      </main>

      {/* Motivational Popup */}
      <AnimatePresence>
        {lastAction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5, y: -100 }}
            onAnimationComplete={() => setTimeout(() => setLastAction(null), 1000)}
            className="fixed bottom-24 pointer-events-none"
          >
            <div className="bg-white text-black px-8 py-4 rounded-full font-display text-3xl md:text-5xl uppercase skew-x-[-10deg] shadow-[0_0_50px_rgba(255,255,255,0.3)]">
              {getMotivationalMessage()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Configuration Modal */}
      <AnimatePresence>
        {isConfiguring && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-[#111] border border-white/10 p-8 rounded-3xl w-full max-w-md relative"
            >
              <button 
                onClick={() => setIsConfiguring(false)}
                className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="font-display text-3xl uppercase mb-8">Set Your Targets</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="font-mono text-xs uppercase opacity-50">Daily Posts Goal</label>
                  <input 
                    type="number" 
                    value={posts.target}
                    onChange={(e) => setPosts(prev => ({ ...prev, target: parseInt(e.target.value) || 1 }))}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-display text-2xl focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="font-mono text-xs uppercase opacity-50">Daily DMs Goal</label>
                  <input 
                    type="number" 
                    value={dms.target}
                    onChange={(e) => setDms(prev => ({ ...prev, target: parseInt(e.target.value) || 1 }))}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-display text-2xl focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                <button 
                  onClick={() => setIsConfiguring(false)}
                  className="w-full py-4 bg-white text-black font-display text-xl uppercase rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                >
                  Save & Dominate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-12 flex gap-8 opacity-30 font-mono text-[10px] uppercase tracking-[0.2em]">
        <div className="flex items-center gap-2"><Flame className="w-3 h-3" /> Streak: 12 Days</div>
        <div className="flex items-center gap-2"><Trophy className="w-3 h-3" /> Rank: Elite</div>
        <div className="flex items-center gap-2"><Zap className="w-3 h-3" /> Energy: Max</div>
      </footer>
    </div>
  );
}

function CounterCard({ title, icon, state, color, onIncrement, progress }: { 
  title: string, 
  icon: ReactNode, 
  state: GoalState, 
  color: 'emerald' | 'orange',
  onIncrement: () => void,
  progress: number
}) {
  const isComplete = state.current >= state.target;
  const colorClass = color === 'emerald' ? 'text-emerald-500' : 'text-orange-500';
  const bgClass = color === 'emerald' ? 'bg-emerald-500' : 'bg-orange-500';
  const shadowClass = color === 'emerald' ? 'shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'shadow-[0_0_30px_rgba(249,115,22,0.2)]';

  return (
    <div className={`relative group bg-[#0A0A0A] border border-white/5 p-8 rounded-[2rem] overflow-hidden transition-all hover:border-white/20 ${shadowClass}`}>
      {/* Progress Bar Background */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className={`h-full ${bgClass} shadow-[0_0_15px_rgba(255,255,255,0.5)]`}
        />
      </div>

      <div className="flex justify-between items-start mb-8">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          {icon}
        </div>
        <div className="text-right">
          <span className="font-mono text-[10px] uppercase opacity-40 block mb-1">Progress</span>
          <span className={`font-display text-4xl ${isComplete ? colorClass : 'text-white'}`}>
            {state.current} <span className="text-white/20">/</span> {state.target}
          </span>
        </div>
      </div>

      <h3 className="font-display text-2xl uppercase mb-12 tracking-tight">{title}</h3>

      <button
        onClick={onIncrement}
        className={`w-full group relative py-8 rounded-2xl overflow-hidden transition-all active:scale-95 ${isComplete ? 'bg-white/5 border border-white/10' : 'bg-white text-black'}`}
      >
        <motion.div 
          className="relative z-10 flex items-center justify-center gap-3 font-display text-3xl uppercase"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
        >
          {isComplete ? (
            <>
              <Trophy className={`w-8 h-8 ${colorClass}`} />
              <span className={colorClass}>Goal Reached!</span>
            </>
          ) : (
            <>
              <Plus className="w-8 h-8" />
              <span>Log Action</span>
            </>
          )}
        </motion.div>
        
        {/* Button Hover Effect */}
        {!isComplete && (
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${bgClass} blur-2xl -z-0 scale-150`} />
        )}
      </button>

      {/* Decorative Elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-3xl" />
    </div>
  );
}
