import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, UserCheck } from 'lucide-react';
import { playTimerTickSound, triggerVibration } from '../utils/sound';
import { AppLanguage, TRANSLATIONS } from '../utils/i18n';

interface TurnTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSeconds: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  lang: AppLanguage;
}

export const TurnTimerModal: React.FC<TurnTimerModalProps> = ({
  isOpen,
  onClose,
  defaultSeconds,
  soundEnabled,
  vibrationEnabled,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const [duration, setDuration] = useState<number>(defaultSeconds || 25);
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [muteSound, setMuteSound] = useState<boolean>(false);

  const prevSecondRef = useRef<number>(duration);

  // Sync duration when preset changes
  const handleSelectPreset = (sec: number) => {
    setDuration(sec);
    setTimeLeft(sec);
    setIsRunning(true);
  };

  const handleReset = () => {
    setTimeLeft(duration);
    setIsRunning(true);
  };

  const handleNextPlayer = () => {
    triggerVibration(vibrationEnabled, 30);
    setTimeLeft(duration);
    setIsRunning(true);
  };

  useEffect(() => {
    if (!isOpen) {
      setIsRunning(false);
      return;
    }
    setTimeLeft(duration);
    setIsRunning(true);
  }, [isOpen, duration]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer ended
          playTimerTickSound(soundEnabled && !muteSound, true);
          triggerVibration(vibrationEnabled, [100, 50, 150]);
          return 0;
        }
        const next = prev - 1;
        if (next <= 5 && next !== prevSecondRef.current) {
          playTimerTickSound(soundEnabled && !muteSound, next <= 3);
          triggerVibration(vibrationEnabled, 25);
        }
        prevSecondRef.current = next;
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, soundEnabled, muteSound, vibrationEnabled]);

  if (!isOpen) return null;

  const percent = Math.max(0, Math.min(100, (timeLeft / duration) * 100));
  const isWarning = timeLeft <= 5 && timeLeft > 0;
  const isTimeUp = timeLeft === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-5 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-stone-800">
          <h3 className="font-bold text-stone-100 font-display text-base">
            {t.timer}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMuteSound(!muteSound)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 cursor-pointer"
              title={muteSound ? (lang === 'es' ? 'Activar sonido de reloj' : 'Unmute timer sound') : (lang === 'es' ? 'Silenciar sonido de reloj' : 'Mute timer sound')}
            >
              {muteSound ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Circular Countdown Progress */}
        <div className="relative w-48 h-48 my-6 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="transparent"
              stroke="#292524"
              strokeWidth="6"
            />
            {/* Progress ring */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="transparent"
              stroke={isTimeUp ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981'}
              strokeWidth="6"
              strokeDasharray={263.89}
              strokeDashoffset={263.89 - (263.89 * percent) / 100}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>

          {/* Center Digital Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              className={`text-5xl font-black font-display tracking-tight transition-colors ${
                isTimeUp
                  ? 'text-red-500 animate-bounce'
                  : isWarning
                  ? 'text-amber-400'
                  : 'text-stone-100'
              }`}
            >
              {timeLeft}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 mt-1">
              {isTimeUp ? t.timeUp : t.seconds}
            </span>
          </div>
        </div>

        {/* Next Player (Fast Reset) Button */}
        <button
          onClick={handleNextPlayer}
          className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-stone-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer mb-3"
        >
          <UserCheck className="w-5 h-5 stroke-[2.5]" />
          <span>{t.nextPlayer}</span>
        </button>

        {/* Controls: Play/Pause & Reset */}
        <div className="flex items-center justify-center gap-2 w-full mb-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="flex-1 py-2 px-3 bg-stone-800 hover:bg-stone-750 text-stone-200 rounded-xl font-semibold text-xs border border-stone-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? t.pause : t.resume}</span>
          </button>
          <button
            onClick={handleReset}
            className="py-2 px-3 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded-xl font-semibold text-xs border border-stone-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title={lang === 'es' ? 'Reiniciar tiempo' : 'Reset timer'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Preset Selectors */}
        <div className="w-full">
          <div className="text-[11px] font-semibold text-stone-400 text-center mb-1.5">
            {lang === 'es' ? 'Duración por jugada' : 'Turn duration'}
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[15, 20, 25, 30, 45].map((sec) => (
              <button
                key={sec}
                onClick={() => handleSelectPreset(sec)}
                className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  duration === sec
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-stone-850 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
