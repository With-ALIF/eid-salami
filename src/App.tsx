import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, VolumeX } from 'lucide-react';
import { Wheel } from './components/Wheel';
import { Popup } from './components/Popup';

const WHEEL_VALUES = [
  '10',
  '20',
  '30',
  '40',
  '50',
  '10',
  '20',
  '30',
  '40',
  '50',
];

export default function App() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const handleSpinEnd = (wonAmount: string) => {
    setResult(wonAmount);
    setShowPopup(true);
    
    // Celebratory haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }

    if (soundEnabled) {
      // Play a simple win sound using Web Audio API
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }

    // Fire confetti
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10b981', '#f59e0b', '#059669', '#fbbf24']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#10b981', '#f59e0b', '#059669', '#fbbf24']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  return (
    <div className="min-h-screen flex flex-col bg-emerald-50 text-emerald-950 font-sans selection:bg-emerald-200">
      {/* Header */}
      <header className="pt-12 pb-8 px-4 text-center relative z-10">
        <div className="absolute top-4 right-4 md:top-8 md:right-8">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-3 bg-white rounded-full shadow-md text-emerald-800 hover:bg-emerald-100 transition-colors"
            aria-label="Toggle sound"
          >
            {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-black text-emerald-800 tracking-tight mb-2 drop-shadow-sm">
          Eid Salami
        </h1>
        <p className="text-xl md:text-2xl font-medium text-amber-600">
          Eid Mubarak 🌙✨
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-12 md:pb-20">
        <div className="w-full max-w-md bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 shadow-2xl shadow-emerald-900/10 border-4 border-emerald-100 relative">
          {/* Decorative elements */}
          <div className="absolute -top-6 -left-6 text-4xl opacity-50 rotate-[-15deg]">✨</div>
          <div className="absolute -bottom-6 -right-6 text-4xl opacity-50 rotate-[15deg]">🌙</div>
          
          <Wheel 
            items={WHEEL_VALUES} 
            onSpinEnd={handleSpinEnd} 
            soundEnabled={soundEnabled} 
          />
          
          <div className="mt-12 text-center text-emerald-700/80 font-medium">
            Tap the center button to try your luck!
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-emerald-800/70 text-sm font-medium z-10 relative">
        <p>
          <a href="https://alif.mnr.bd" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition-colors underline decoration-emerald-800/30 underline-offset-2">Alif</a> | BRUR
        </p>
        <p className="mt-1">©2026</p>
      </footer>

      <Popup 
        isOpen={showPopup} 
        onClose={() => setShowPopup(false)} 
        result={result} 
      />
    </div>
  );
}
