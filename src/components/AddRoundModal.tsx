import React, { useState, useEffect } from 'react';
import { X, Delete, Sparkles, Plus, Users, User, Edit3, Check } from 'lucide-react';
import { PlayerScore, WinReason } from '../types';
import { playTileClickSound, triggerVibration } from '../utils/sound';

interface AddRoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: PlayerScore[];
  defaultWinnerId?: string;
  roundNumber: number;
  capicuaBonus: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
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
  onSaveRound,
  onUpdatePlayerMembers,
  onUpdatePlayerName,
}) => {
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
  const [editTeam1Members, setEditTeam1Members] = useState<string[]>([]);
  const [editTeam2Members, setEditTeam2Members] = useState<string[]>([]);
  const [editTeam1Name, setEditTeam1Name] = useState<string>('');
  const [editTeam2Name, setEditTeam2Name] = useState<string>('');

  // Sync state when modal opens
  useEffect(() => {
    if (defaultWinnerId) {
      setSelectedWinnerId(defaultWinnerId);
    } else if (players.length > 0) {
      setSelectedWinnerId(players[0].id);
    }

    // Default player name if available for the selected team
    const defaultPlayer = players.find((p) => p.id === (defaultWinnerId || players[0]?.id));
    if (defaultPlayer?.members && defaultPlayer.members.length > 0) {
      setSelectedPlayerName(defaultPlayer.members[0] || '');
    } else {
      setSelectedPlayerName('');
    }

    setPointsInput('');
    setReason('normal');
    setNotes('');
    setIsEditingNames(false);

    // Prepare quick edit fields
    if (players.length >= 2) {
      setEditTeam1Name(players[0]?.name || 'Nosotros');
      setEditTeam2Name(players[1]?.name || 'Ellos');
      setEditTeam1Members(
        players[0]?.members?.length === 2
          ? [...players[0].members]
          : ['Jugador 1', 'Jugador 2']
      );
      setEditTeam2Members(
        players[1]?.members?.length === 2
          ? [...players[1].members]
          : ['Jugador 1', 'Jugador 2']
      );
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

  const handleSelectTeam = (playerId: string) => {
    setSelectedWinnerId(playerId);
    playTileClickSound(soundEnabled);
    const player = players.find((p) => p.id === playerId);
    if (player?.members && player.members.length > 0) {
      // If currently selected player is not in this team, default to first member
      if (!player.members.includes(selectedPlayerName)) {
        setSelectedPlayerName(player.members[0]);
      }
    } else {
      setSelectedPlayerName('');
    }
  };

  const handleSelectPlayerOut = (teamId: string, memberName: string) => {
    playTileClickSound(soundEnabled);
    triggerVibration(vibrationEnabled, 25);
    setSelectedWinnerId(teamId);
    setSelectedPlayerName(memberName);
  };

  const handleSaveNames = () => {
    playTileClickSound(soundEnabled);
    if (players.length >= 2) {
      if (onUpdatePlayerName) {
        onUpdatePlayerName(players[0].id, editTeam1Name.trim() || 'Nosotros');
        onUpdatePlayerName(players[1].id, editTeam2Name.trim() || 'Ellos');
      }
      if (onUpdatePlayerMembers) {
        onUpdatePlayerMembers(players[0].id, [
          editTeam1Members[0]?.trim() || 'Jugador 1',
          editTeam1Members[1]?.trim() || 'Jugador 2',
        ]);
        onUpdatePlayerMembers(players[1].id, [
          editTeam2Members[0]?.trim() || 'Jugador 1',
          editTeam2Members[1]?.trim() || 'Jugador 2',
        ]);
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
              <span>Anotar Mano #{roundNumber}</span>
            </h3>
            <p className="text-xs text-stone-400">
              Registra los puntos y el jugador que salió en la mano
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Winner Selector & Players section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                ¿Quién ganó la mano?
              </label>
              {isTwoTeams && (
                <button
                  type="button"
                  onClick={() => setIsEditingNames(!isEditingNames)}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingNames ? 'Cerrar edición' : 'Agregar / Editar nombres'}</span>
                </button>
              )}
            </div>

            {/* Inline Names Editing Panel */}
            {isEditingNames && isTwoTeams && (
              <div className="mb-3 p-3 bg-stone-950 border border-amber-500/30 rounded-2xl space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Editar Nombres de Parejas
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveNames}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Guardar nombres</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Team 1 (Nosotros) */}
                  <div className="p-2.5 bg-stone-900 rounded-xl border border-stone-800 space-y-1.5">
                    <label className="text-[11px] font-bold text-emerald-400 block">
                      Equipo 1 (ej. Nosotros)
                    </label>
                    <input
                      type="text"
                      value={editTeam1Name}
                      onChange={(e) => setEditTeam1Name(e.target.value)}
                      placeholder="Nosotros"
                      className="w-full bg-stone-950 border border-stone-750 rounded-lg px-2 py-1 text-xs text-stone-100 mb-1 focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[10px] text-stone-500 block font-semibold">Jugadores:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        value={editTeam1Members[0] || ''}
                        onChange={(e) => {
                          const updated = [...editTeam1Members];
                          updated[0] = e.target.value;
                          setEditTeam1Members(updated);
                        }}
                        placeholder="Jugador 1"
                        className="w-full bg-stone-950 border border-stone-750 rounded-lg px-2 py-1 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                      />
                      <input
                        type="text"
                        value={editTeam1Members[1] || ''}
                        onChange={(e) => {
                          const updated = [...editTeam1Members];
                          updated[1] = e.target.value;
                          setEditTeam1Members(updated);
                        }}
                        placeholder="Jugador 2"
                        className="w-full bg-stone-950 border border-stone-750 rounded-lg px-2 py-1 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Team 2 (Ellos) */}
                  <div className="p-2.5 bg-stone-900 rounded-xl border border-stone-800 space-y-1.5">
                    <label className="text-[11px] font-bold text-amber-400 block">
                      Equipo 2 (ej. Ellos)
                    </label>
                    <input
                      type="text"
                      value={editTeam2Name}
                      onChange={(e) => setEditTeam2Name(e.target.value)}
                      placeholder="Ellos"
                      className="w-full bg-stone-950 border border-stone-750 rounded-lg px-2 py-1 text-xs text-stone-100 mb-1 focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[10px] text-stone-500 block font-semibold">Jugadores:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        value={editTeam2Members[0] || ''}
                        onChange={(e) => {
                          const updated = [...editTeam2Members];
                          updated[0] = e.target.value;
                          setEditTeam2Members(updated);
                        }}
                        placeholder="Jugador 1"
                        className="w-full bg-stone-950 border border-stone-750 rounded-lg px-2 py-1 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                      />
                      <input
                        type="text"
                        value={editTeam2Members[1] || ''}
                        onChange={(e) => {
                          const updated = [...editTeam2Members];
                          updated[1] = e.target.value;
                          setEditTeam2Members(updated);
                        }}
                        placeholder="Jugador 2"
                        className="w-full bg-stone-950 border border-stone-750 rounded-lg px-2 py-1 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team & Players selection cards */}
            {isTwoTeams ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {players.map((team, idx) => {
                  const isTeamSelected = selectedWinnerId === team.id;
                  const members = team.members && team.members.length > 0
                    ? team.members
                    : ['Jugador 1', 'Jugador 2'];

                  return (
                    <div
                      key={team.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        isTeamSelected
                          ? 'bg-stone-850 border-amber-500/50 shadow-md ring-1 ring-amber-500/20'
                          : 'bg-stone-850/60 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      {/* Team Header Button */}
                      <button
                        type="button"
                        onClick={() => handleSelectTeam(team.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left font-bold transition-all mb-2.5 ${
                          isTeamSelected
                            ? 'text-stone-950 shadow'
                            : 'bg-stone-900/80 text-stone-300 hover:text-white'
                        }`}
                        style={{
                          backgroundColor: isTeamSelected ? team.color : undefined,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: isTeamSelected ? '#1c1917' : team.color,
                            }}
                          />
                          <span className="text-sm font-extrabold">{team.name}</span>
                        </div>
                        {isTeamSelected && (
                          <span className="text-[11px] font-black uppercase tracking-wider bg-stone-950/20 px-2 py-0.5 rounded-full">
                            Ganó la mano
                          </span>
                        )}
                      </button>

                      {/* Players / Salió selector for this team */}
                      <div>
                        <span className="text-[11px] font-semibold text-stone-400 block mb-1.5 flex items-center gap-1">
                          <User className="w-3 h-3 text-stone-500" />
                          <span>¿Quién salió / dominó de {team.name}?</span>
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {members.map((memberName, mIdx) => {
                            const isMemberSelected =
                              isTeamSelected && selectedPlayerName === memberName;
                            return (
                              <button
                                key={mIdx}
                                type="button"
                                onClick={() => handleSelectPlayerOut(team.id, memberName)}
                                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center truncate ${
                                  isMemberSelected
                                    ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm font-extrabold ring-1 ring-white/30'
                                    : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700 hover:text-stone-100'
                                }`}
                              >
                                {memberName}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Individual mode */
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {players.map((p) => {
                  const isSelected = selectedWinnerId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedWinnerId(p.id);
                        setSelectedPlayerName(p.name);
                        playTileClickSound(soundEnabled);
                      }}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all ${
                        isSelected
                          ? 'border-transparent text-stone-950 shadow-md ring-2 ring-white/20'
                          : 'border-stone-800 bg-stone-850/80 text-stone-300 hover:border-stone-700'
                      }`}
                      style={{
                        backgroundColor: isSelected ? p.color : undefined,
                      }}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: isSelected ? '#1c1917' : p.color }}
                      />
                      <span className="truncate">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Selected winner and player summary badge */}
            <div className="mt-2.5 px-3 py-1.5 bg-stone-950/70 border border-stone-800/80 rounded-xl flex items-center justify-between text-xs">
              <span className="text-stone-400">Mano a favor de:</span>
              <div className="flex items-center gap-1.5 font-bold">
                <span style={{ color: selectedPlayerObj?.color || '#f59e0b' }}>
                  {selectedPlayerObj?.name || 'Equipo'}
                </span>
                {selectedPlayerName && (
                  <>
                    <span className="text-stone-600">•</span>
                    <span className="text-amber-400">Salió: {selectedPlayerName}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Win Type Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
              Tipo de victoria
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: 'normal', label: 'Dominó' },
                { id: 'tranca', label: 'Tranca / Cierre' },
                { id: 'capicua', label: 'Capicúa' },
                { id: 'penalizacion', label: 'Penalización' },
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
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
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
                    Bonificación de Capicúa: <strong>+{capicuaBonus} pts</strong>
                  </span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeBonus}
                    onChange={(e) => setIncludeBonus(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <span className="text-xs text-stone-300 font-medium">Aplicar</span>
                </label>
              </div>
            )}
          </div>

          {/* Points Display */}
          <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 text-center">
            <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
              Puntos a anotar
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-5xl font-black font-display tracking-tight text-amber-400">
                {totalPointsToSave}
              </span>
              <span className="text-base text-stone-400 font-semibold">pts</span>
            </div>
            {reason === 'capicua' && includeBonus && (
              <p className="text-xs text-stone-400 mt-1">
                ({currentPoints} fichas + {capicuaBonus} bono capicúa)
              </p>
            )}
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <div className="text-xs text-stone-400 mb-1.5 flex items-center justify-between">
              <span>Suma rápida</span>
              <span className="text-[11px] text-stone-500">Toca para sumar</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
              {[5, 10, 15, 20, 25, 30].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddPreset(preset)}
                  className="py-1.5 px-2 bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700/60 rounded-xl text-xs font-bold transition-all active:scale-95"
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
                  className="py-3 bg-stone-800 hover:bg-stone-750 active:bg-stone-700 text-stone-100 text-xl font-bold rounded-xl border border-stone-750 shadow-sm transition-all active:scale-95"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="py-3 bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-red-400 text-sm font-bold rounded-xl border border-stone-800 transition-all active:scale-95"
              >
                C
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="py-3 bg-stone-800 hover:bg-stone-750 active:bg-stone-700 text-stone-100 text-xl font-bold rounded-xl border border-stone-750 shadow-sm transition-all active:scale-95"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="py-3 bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center rounded-xl border border-stone-800 transition-all active:scale-95"
                title="Borrar último dígito"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <input
              type="text"
              placeholder="Nota opcional (ej. Tranca con la cochina / doble 6)"
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
                  ? `Guardar Mano (+${totalPointsToSave} pts)`
                  : 'Ingresa los puntos para guardar'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
