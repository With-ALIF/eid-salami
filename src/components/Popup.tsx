import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share2, Check } from 'lucide-react';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  result: string | null;
}

export function Popup({ isOpen, onClose, result }: PopupProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = `I won ${result} tk on the Eid Salami Spin Wheel! Eid Mubarak! ✨`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Eid Salami Spin Wheel',
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(`${text} ${window.location.href}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative border-4 border-emerald-500"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="text-center space-y-4">
              <div className="text-4xl mb-6">🌙✨</div>
              <h2 className="text-2xl font-bold text-emerald-900">
                MashaAllah!
              </h2>
              <p className="text-lg text-gray-600">
                You won
              </p>
              <div className="text-5xl font-black text-amber-500 drop-shadow-sm py-4">
                {result} tk
              </div>
              
              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={handleShare}
                  className="w-full py-3 px-6 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check size={20} />
                      Copied to clipboard!
                    </>
                  ) : (
                    <>
                      <Share2 size={20} />
                      Share your winnings
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 px-6 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl font-bold text-lg transition-colors"
                >
                  Awesome! 🎉
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
