import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';

interface WheelProps {
  items: string[];
  onSpinEnd: (result: string) => void;
  soundEnabled: boolean;
}

const COLORS = [
  '#10b981', // emerald-500
  '#f59e0b', // amber-500 (gold)
  '#059669', // emerald-600
  '#fbbf24', // amber-400
  '#047857', // emerald-700
  '#fcd34d', // amber-300
  '#065f46', // emerald-800
  '#d97706', // amber-600
  '#34d399', // emerald-400
];

export function Wheel({ items, onSpinEnd, soundEnabled }: WheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext on first interaction or mount
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const triggerTickFeedback = () => {
    // Haptic feedback for mobile devices
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }

    if (!soundEnabled || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  };

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    // Initial tap haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Play initial sound to unlock audio context on mobile
    if (soundEnabled && audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }

    const sliceAngle = 360 / items.length;
    const randomSliceIndex = Math.floor(Math.random() * items.length);
    
    // Calculate the target rotation
    // We want the selected slice to end up at the top (0 degrees or 270 degrees depending on orientation)
    // In our CSS, 0 degrees is top.
    // The center of slice i is at i * sliceAngle + sliceAngle / 2
    // To bring it to top (0), we need to rotate by 360 - (i * sliceAngle + sliceAngle / 2)
    const extraSpins = 5; // 5 full rotations
    const baseRotation = rotation + (360 - (rotation % 360)); // Reset to 0 relative to current
    const targetRotation = baseRotation + (360 * extraSpins) + (360 - (randomSliceIndex * sliceAngle + sliceAngle / 2));

    setRotation(targetRotation);

    // Simulate tick sounds during spin
    let currentRot = rotation;
    const duration = 4000; // 4 seconds
    const start = performance.now();
    let lastTickAngle = currentRot;

    const animateTicks = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutQuart)
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const currentAngle = rotation + (targetRotation - rotation) * easeProgress;
      
      // Play tick every sliceAngle degrees
      if (Math.abs(currentAngle - lastTickAngle) >= sliceAngle) {
        triggerTickFeedback();
        lastTickAngle = currentAngle;
      }

      if (progress < 1) {
        requestAnimationFrame(animateTicks);
      }
    };
    requestAnimationFrame(animateTicks);

    setTimeout(() => {
      setIsSpinning(false);
      onSpinEnd(items[randomSliceIndex]);
    }, duration + 100);
  };

  const sliceAngle = 360 / items.length;
  
  // Create conic gradient string
  const gradientStops = items.map((_, i) => {
    const startAngle = i * sliceAngle;
    const endAngle = (i + 1) * sliceAngle;
    return `${COLORS[i % COLORS.length]} ${startAngle}deg ${endAngle}deg`;
  }).join(', ');

  return (
    <div className="relative w-full max-w-[260px] sm:max-w-[320px] md:max-w-[384px] aspect-square mx-auto">
      {/* Pointer */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 drop-shadow-lg">
        <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[32px] border-t-red-500" />
      </div>

      {/* Wheel */}
      <div className="relative w-full h-full rounded-full border-8 border-emerald-900 shadow-2xl overflow-hidden">
        <motion.div
          className="w-full h-full rounded-full"
          style={{
            background: `conic-gradient(${gradientStops})`,
          }}
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: [0.25, 1, 0.5, 1] }}
        >
          {items.map((item, i) => {
            const angle = i * sliceAngle + sliceAngle / 2;
            return (
              <div
                key={i}
                className="absolute w-full h-full flex items-start justify-center pt-4"
                style={{
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: '50% 50%',
                }}
              >
                <span className="text-white font-bold text-lg md:text-xl drop-shadow-md">
                  {item}
                </span>
              </div>
            );
          })}
        </motion.div>

        {/* Center Button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <motion.button
            onClick={spin}
            disabled={isSpinning}
            animate={isSpinning ? { scale: 1 } : { scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: isSpinning ? 0 : Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-emerald-900 disabled:opacity-80 cursor-pointer"
          >
            <span className="text-emerald-900 font-bold text-center leading-tight text-sm md:text-base">
              TAP TO<br />SPIN
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
