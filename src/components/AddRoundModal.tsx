import React, { useState, useEffect } from 'react';
import { X, Delete, Sparkles, Plus, Users, User, Edit3, Check } from 'lucide-react';
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
  capicuaBonus,
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
  const [includeBonus, setIncludeBonus] = useState<boolean>(true);

  // Quick edit names panel
  const [isEditingNames, setIsEditingNames] = useState<boolean>(false);
  const [editPlayer1Name, setEditPlayer1Name] = useState<string>('');
  const [editPlayer2Name, setEditPlayer2Name] = useState<string>('');

  // Sync state when modal opens
  useEffect(() => {
    const activeWinnerId = defaultWinnerId || players[0]?.id || '';
    setSelectedWinnerId(activeWinnerId);

    const defaultPlayer = players.find((p) => p.id === activeWinnerId);
    setSelectedPlayerName(defaultPlayer?.name || '');

    setPointsInput('');
    setReason('normal');
    setNotes('');
    setIsEditingNames(false);

    // Prepare quick edit fields
    if (players.length >= 2) {
      setEditPlayer1Name(players[0]?.name || 'Jugador 1');
      setEditPlayer2Name(players[1]?.name || 'Jugador 2');
    }
  }, [isOpen, defaultWinnerId, players]);

  if (!isOpen) return null;

  const currentPoints = parseInt(pointsInput || '0', 10);
  const totalPointsToSave =
    reason === 'capicua' && includeBonus
      ? currentPoints + capicuaBonus
      : currentPoints;

  const isTwoTeams = players.length === 2;

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

  const handleSaveNames = () => {
    playTileClickSound(soundEnabled);
    if (players.length >= 2) {
      const p1 = editPlayer1Name.trim() || 'Jugador 1';
      const p2 = editPlayer2Name.trim() || 'Jugador 2';
      if (onUpdatePlayerName) {
        onUpdatePlayerName(players[0].id, p1);
        onUpdatePlayerName(players[1].id, p2);
      }
      if (onUpdatePlayerMembers) {
        onUpdatePlayerMembers(players[0].id, [p1]);
        onUpdatePlayerMembers(players[1].id, [p2]);
      }
      if (selectedWinnerId === players[0].id) {
        setSelectedPlayerName(p1);
      } else if (selectedWinnerId === players[1].id) {
        setSelectedPlayerName(p2);
      }
    }
    setIsEditingNames(false);
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
            <h3 className="text-lg font-bold text-stone-100 font-display flex items-center gap-2">
              <span>{t.recordHand} #{roundNumber}</span>
            </h3>
            <p className="text-xs text-stone-400">
              {lang === 'es'
                ? 'Registra los puntos y el jugador que salió en la mano'
                : 'Record points and the player who won the hand'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Winner Selector & Players section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                {lang === 'es' ? '¿Quién ganó la mano?' : 'Who won the hand?'}
              </label>
              {isTwoTeams && (
                <button
                  type="button"
                  onClick={() => {
                    const next = !isEditingNames;
                    setIsEditingNames(next);
                    if (next) {
                      if (/^(jugador|player)\s*1$/i.test(editPlayer1Name.trim())) setEditPlayer1Name('');
                      if (/^(jugador|player)\s*2$/i.test(editPlayer2Name.trim())) setEditPlayer2Name('');
                    }
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>
                    {isEditingNames
                      ? (lang === 'es' ? 'Cerrar edición' : 'Close editing')
                      : (lang === 'es' ? 'Agregar / Editar nombres' : 'Add / Edit names')}
                  </span>
                </button>
              )}
            </div>

            {/* Inline Names Editing Panel */}
            {isEditingNames && isTwoTeams && (
              <div className="mb-3 p-3 bg-stone-950 border border-amber-500/30 rounded-2xl space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {lang === 'es' ? 'Editar Nombres de Jugadores' : 'Edit Player Names'}
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveNames}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{lang === 'es' ? 'Guardar nombres' : 'Save names'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Jugador 1 */}
                  <div className="p-2.5 bg-stone-900 rounded-xl border border-stone-800 space-y-1.5">
                    <label className="text-[11px] font-bold text-emerald-400 block">
                      {lang === 'es' ? 'Jugador 1' : 'Player 1'}
                    </label>
                    <input
                      type="text"
                      value={editPlayer1Name}
                      onChange={(e) => setEditPlayer1Name(e.target.value)}
                      onFocus={(e) => {
                        if (/^(jugador|player)\s*1$/i.test(editPlayer1Name.trim())) setEditPlayer1Name('');
                        e.target.select();
                      }}
                      placeholder={lang === 'es' ? 'Jugador 1' : 'Player 1'}
                      className="w-full bg-stone-950 border border-stone-750 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Jugador 2 */}
                  <div className="p-2.5 bg-stone-900 rounded-xl border border-stone-800 space-y-1.5">
                    <label className="text-[11px] font-bold text-amber-400 block">
                      {lang === 'es' ? 'Jugador 2' : 'Player 2'}
                    </label>
                    <input
                      type="text"
                      value={editPlayer2Name}
                      onChange={(e) => setEditPlayer2Name(e.target.value)}
                      onFocus={(e) => {
                        if (/^(jugador|player)\s*2$/i.test(editPlayer2Name.trim())) setEditPlayer2Name('');
                        e.target.select();
                      }}
                      placeholder={lang === 'es' ? 'Jugador 2' : 'Player 2'}
                      className="w-full bg-stone-950 border border-stone-750 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Winner Selection Cards */}
            <div className={`grid gap-2.5 sm:gap-3 ${isTwoTeams ? 'grid-cols-2' : players.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
              {players.map((player) => {
                const isSelected = selectedWinnerId === player.id;
                const displayName = formatPlayerDisplayName(player.name, lang);
                return (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => handleSelectWinner(player.id)}
                    className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between min-h-[64px] cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 shadow-md ring-2 ring-amber-400/40 font-bold'
                        : 'bg-stone-850/70 border-stone-800 text-stone-300 hover:border-stone-700 hover:bg-stone-850'
                    }`}
                    style={{
                      backgroundColor: isSelected ? player.color : undefined,
                      color: isSelected ? '#0c0a09' : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                          style={{
                            backgroundColor: isSelected ? '#1c1917' : player.color,
                          }}
                        />
                        <span className="text-sm sm:text-base font-black truncate">
                          {displayName}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 flex-shrink-0 stroke-[3]" />
                      )}
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-black uppercase tracking-wider mt-1 bg-stone-950/20 px-2 py-0.5 rounded-md self-start">
                        {t.wonHand}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected winner summary badge */}
            <div className="mt-2.5 px-3 py-1.5 bg-stone-950/70 border border-stone-800/80 rounded-xl flex items-center justify-between text-xs">
              <span className="text-stone-400">{lang === 'es' ? 'Mano a favor de:' : 'Hand awarded to:'}</span>
              <div className="flex items-center gap-1.5 font-bold">
                <span style={{ color: selectedPlayerObj?.color || '#f59e0b' }}>
                  {formatPlayerDisplayName(selectedPlayerObj?.name || '', lang)}
                </span>
                {selectedPlayerName && selectedPlayerName !== selectedPlayerObj?.name && (
                  <>
                    <span className="text-stone-600">•</span>
                    <span className="text-amber-400">
                      {lang === 'es' ? `Salió: ${selectedPlayerName}` : `Played: ${selectedPlayerName}`}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Win Type Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
              {lang === 'es' ? 'Tipo de victoria' : 'Win Type'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: 'normal', label: t.reasonDomino },
                { id: 'tranca', label: t.reasonTranca },
                { id: 'capicua', label: t.reasonCapicua },
                { id: 'penalizacion', label: t.reasonPenalization },
              ].map((item) => {
                const active = reason === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setReason(item.id as WinReason);
                      playTileClickSound(soundEnabled);
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                      active
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                        : 'bg-stone-850 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Capicúa Bonus Callout */}
            {reason === 'capicua' && capicuaBonus > 0 && (
              <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-xs text-amber-300">
                    {lang === 'es' ? `Bonificación de Capicúa: +${capicuaBonus} pts` : `Capicúa Bonus: +${capicuaBonus} pts`}
                  </span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeBonus}
                    onChange={(e) => setIncludeBonus(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <span className="text-xs text-stone-300 font-medium">
                    {lang === 'es' ? 'Aplicar' : 'Apply'}
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Points Display */}
          <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 text-center">
            <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
              {lang === 'es' ? 'Puntos a anotar' : 'Points to record'}
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-5xl font-black font-display tracking-tight text-amber-400">
                {totalPointsToSave}
              </span>
              <span className="text-base text-stone-400 font-semibold">{t.pts}</span>
            </div>
            {reason === 'capicua' && includeBonus && (
              <p className="text-xs text-stone-400 mt-1">
                ({currentPoints} {lang === 'es' ? 'fichas' : 'tiles'} + {capicuaBonus} {lang === 'es' ? 'bono capicúa' : 'capicúa bonus'})
              </p>
            )}
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <div className="text-xs text-stone-400 mb-1.5 flex items-center justify-between">
              <span>{lang === 'es' ? 'Suma rápida' : 'Quick Add'}</span>
              <span className="text-[11px] text-stone-500">
                {lang === 'es' ? 'Toca para sumar' : 'Tap to add'}
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
              {[5, 10, 15, 20, 25, 30].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddPreset(preset)}
                  className="py-1.5 px-2 bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700/60 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Large Tactile Numeric Keypad */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-3 gap-1.5">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeypadPress(digit)}
                  className="py-3 bg-stone-800 hover:bg-stone-750 active:bg-stone-700 text-stone-100 text-xl font-bold rounded-xl border border-stone-750 shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="py-3 bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-red-400 text-sm font-bold rounded-xl border border-stone-800 transition-all active:scale-95 cursor-pointer"
              >
                C
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="py-3 bg-stone-800 hover:bg-stone-750 active:bg-stone-700 text-stone-100 text-xl font-bold rounded-xl border border-stone-750 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="py-3 bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center rounded-xl border border-stone-800 transition-all active:scale-95 cursor-pointer"
                title={lang === 'es' ? 'Borrar último dígito' : 'Delete last digit'}
              >
                <Delete className="w-5 h-5" />
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
