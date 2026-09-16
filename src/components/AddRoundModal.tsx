import React, { useState, useEffect } from 'react';
import { X, Delete, Plus } from 'lucide-react';
import { PlayerScore, WinReason } from '../types';
import { playTileClickSound, triggerVibration } from '../utils/sound';
import { AppLanguage, TRANSLATIONS, formatPlayerDisplayName } from '../utils/i18n';

interface AddRoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: PlayerScore[];
  defaultWinnerId?: string;
  roundNumber: number;
  capicuaBonus: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  lang: AppLanguage;
  onSaveRound: (
    winnerId: string,
    points: number,
    reason: WinReason,
    notes?: string,
    winnerPlayerName?: string
  ) => void;
  onUpdatePlayerMembers?: (playerId: string, members: string[]) => void;
  onUpdatePlayerName?: (playerId: string, name: string) => void;
}

export const AddRoundModal: React.FC<AddRoundModalProps> = ({
  isOpen,
  onClose,
  players,
  defaultWinnerId,
  roundNumber,
  capicuaBonus: _capicuaBonus,
  soundEnabled,
  vibrationEnabled,
  lang,
  onSaveRound,
  onUpdatePlayerMembers,
  onUpdatePlayerName,
}) => {
  const t = TRANSLATIONS[lang];
  const [selectedWinnerId, setSelectedWinnerId] = useState<string>(
    defaultWinnerId || (players[0]?.id ?? '')
  );
  const [selectedPlayerName, setSelectedPlayerName] = useState<string>('');
  const [pointsInput, setPointsInput] = useState<string>('');
  const [reason, setReason] = useState<WinReason>('normal');
  const [notes, setNotes] = useState<string>('');

  // Sync state when modal opens
  useEffect(() => {
    const activeWinnerId = defaultWinnerId || players[0]?.id || '';
    setSelectedWinnerId(activeWinnerId);

    const defaultPlayer = players.find((p) => p.id === activeWinnerId);
    setSelectedPlayerName(defaultPlayer?.name || '');

    setPointsInput('');
    setReason('normal');
    setNotes('');
  }, [isOpen, defaultWinnerId, players]);

  if (!isOpen) return null;

  const currentPoints = parseInt(pointsInput || '0', 10);
  const totalPointsToSave = currentPoints;

  const handleKeypadPress = (val: string) => {
    playTileClickSound(soundEnabled);
    triggerVibration(vibrationEnabled, 25);
    if (pointsInput.length >= 4) return;
    if (pointsInput === '' && val === '0') return;
    setPointsInput((prev) => prev + val);
  };

  const handleBackspace = () => {
    playTileClickSound(soundEnabled);
    triggerVibration(vibrationEnabled, 25);
    setPointsInput((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    playTileClickSound(soundEnabled);
    triggerVibration(vibrationEnabled, 35);
    setPointsInput('');
  };

  const handleAddPreset = (pts: number) => {
    playTileClickSound(soundEnabled);
    triggerVibration(vibrationEnabled, 30);
    const curr = parseInt(pointsInput || '0', 10);
    setPointsInput(String(curr + pts));
  };

  const handleSelectWinner = (playerId: string) => {
    setSelectedWinnerId(playerId);
    playTileClickSound(soundEnabled);
    triggerVibration(vibrationEnabled, 25);
    const player = players.find((p) => p.id === playerId);
    setSelectedPlayerName(player?.name || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalPointsToSave <= 0) return;
    onSaveRound(
      selectedWinnerId,
      totalPointsToSave,
      reason,
      notes.trim() || undefined,
      selectedPlayerName.trim() || undefined
    );
    onClose();
  };

  const selectedPlayerObj = players.find((p) => p.id === selectedWinnerId);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-850">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-stone-100 font-display">
                {t.recordHand} #{roundNumber}
              </h3>
              {selectedPlayerObj && (
                <button
                  type="button"
                  onClick={() => {
                    if (players.length === 2) {
                      const other = players.find((p) => p.id !== selectedWinnerId);
                      if (other) handleSelectWinner(other.id);
                    }
                  }}
                  title={players.length === 2 ? (lang === 'es' ? 'Toca para cambiar de jugador' : 'Tap to switch player') : undefined}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black border transition-all active:scale-95 cursor-pointer shadow-sm"
                  style={{
                    backgroundColor: `${selectedPlayerObj.color}25`,
                    borderColor: `${selectedPlayerObj.color}60`,
                    color: selectedPlayerObj.color,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: selectedPlayerObj.color }}
                  />
                  <span>{formatPlayerDisplayName(selectedPlayerObj.name, lang)}</span>
                  {players.length === 2 && (
                    <span className="text-[10px] text-stone-400 font-normal underline ml-0.5">
                      {lang === 'es' ? 'cambiar' : 'change'}
                    </span>
                  )}
                </button>
              )}
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              {lang === 'es'
                ? `Ingresa los puntos ganados para ${formatPlayerDisplayName(selectedPlayerObj?.name || '', lang)}`
                : `Enter points scored for ${formatPlayerDisplayName(selectedPlayerObj?.name || '', lang)}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3.5 sm:p-4 overflow-y-auto space-y-3 flex-1">
          {/* Points Display */}
          <div className="bg-stone-950 p-2.5 sm:p-3 rounded-xl border border-stone-800 text-center shadow-inner">
            <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-0.5">
              {lang === 'es' ? 'Puntos a anotar' : 'Points to record'}
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-3xl sm:text-4xl font-black font-display tracking-tight text-amber-400">
                {totalPointsToSave}
              </span>
              <span className="text-sm text-stone-400 font-semibold">{t.pts}</span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <div className="text-[11px] text-stone-400 mb-1 flex items-center justify-between">
              <span>{lang === 'es' ? 'Suma rápida' : 'Quick Add'}</span>
              <span className="text-[10px] text-stone-500">
                {lang === 'es' ? 'Toca para sumar' : 'Tap to add'}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {[5, 10, 15, 20, 25, 30].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddPreset(preset)}
                  className="py-1 px-1 bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700/60 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer text-center"
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Large Tactile Numeric Keypad */}
          <div className="space-y-1">
            <div className="grid grid-cols-3 gap-1.5">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeypadPress(digit)}
                  className="py-2.5 bg-stone-800 hover:bg-stone-750 active:bg-stone-700 text-stone-100 text-lg font-bold rounded-xl border border-stone-750 shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="py-2.5 bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-red-400 text-xs font-bold rounded-xl border border-stone-800 transition-all active:scale-95 cursor-pointer"
              >
                C
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="py-2.5 bg-stone-800 hover:bg-stone-750 active:bg-stone-700 text-stone-100 text-lg font-bold rounded-xl border border-stone-750 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="py-2.5 bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center rounded-xl border border-stone-800 transition-all active:scale-95 cursor-pointer"
                title={lang === 'es' ? 'Borrar último dígito' : 'Delete last digit'}
              >
                <Delete className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <input
              type="text"
              placeholder={lang === 'es' ? 'Nota opcional (ej. Tranca con la cochina / doble 6)' : 'Optional note (e.g. Block with double 6)'}
              value={notes}
              maxLength={40}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-300 placeholder-stone-600 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-1">
            <button
              id="btn-confirm-add-round"
              type="submit"
              disabled={totalPointsToSave <= 0}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 ${
                totalPointsToSave > 0
                  ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-950/40 active:scale-[0.99] cursor-pointer'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700/50'
              }`}
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>
                {totalPointsToSave > 0
                  ? (lang === 'es' ? `Guardar Mano (+${totalPointsToSave} pts)` : `Save Hand (+${totalPointsToSave} pts)`)
                  : (lang === 'es' ? 'Ingresa los puntos para guardar' : 'Enter points to save')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
