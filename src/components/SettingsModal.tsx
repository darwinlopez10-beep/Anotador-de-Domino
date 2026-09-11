import React, { useState } from 'react';
import { X, Settings, Users, Target, Shield, Sparkles, Volume2, Check } from 'lucide-react';
import { GameMode, GameSettings, TrancaRule } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: GameSettings;
  onSaveSettings: (newSettings: GameSettings, shouldResetGame: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSaveSettings,
}) => {
  const [targetScore, setTargetScore] = useState<number>(currentSettings.targetScore);
  const [customTarget, setCustomTarget] = useState<string>('');
  const [isCustomTarget, setIsCustomTarget] = useState<boolean>(
    ![50, 100, 150, 200, 500].includes(currentSettings.targetScore)
  );

  const [gameMode, setGameMode] = useState<GameMode>(currentSettings.gameMode);
  const [team1Name, setTeam1Name] = useState<string>(currentSettings.team1Name);
  const [team2Name, setTeam2Name] = useState<string>(currentSettings.team2Name);
  const [team1Members, setTeam1Members] = useState<[string, string]>([
    currentSettings.team1Members?.[0] || 'Jugador 1',
    currentSettings.team1Members?.[1] || 'Jugador 2',
  ]);
  const [team2Members, setTeam2Members] = useState<[string, string]>([
    currentSettings.team2Members?.[0] || 'Jugador 3',
    currentSettings.team2Members?.[1] || 'Jugador 4',
  ]);
  const [individualNames, setIndividualNames] = useState<string[]>(
    currentSettings.individualPlayerNames
  );
  const [individualCount, setIndividualCount] = useState<number>(
    currentSettings.individualPlayerNames.length
  );

  const [trancaRule, setTrancaRule] = useState<TrancaRule>(currentSettings.trancaRule);
  const [capicuaBonus, setCapicuaBonus] = useState<number>(currentSettings.capicuaBonus);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(currentSettings.soundEnabled);
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(
    currentSettings.vibrationEnabled
  );
  const [timerDurationSeconds, setTimerDurationSeconds] = useState<number>(
    currentSettings.timerDurationSeconds
  );

  if (!isOpen) return null;

  const handleTargetPreset = (val: number) => {
    setTargetScore(val);
    setIsCustomTarget(false);
  };

  const handleCustomTargetChange = (val: string) => {
    const num = parseInt(val.replace(/\D/g, ''), 10);
    setCustomTarget(val);
    if (!isNaN(num) && num > 0) {
      setTargetScore(num);
    }
  };

  const handleIndividualNameChange = (idx: number, name: string) => {
    const updated = [...individualNames];
    updated[idx] = name;
    setIndividualNames(updated);
  };

  const handleSave = (resetGame: boolean) => {
    const activeScore = isCustomTarget && customTarget ? parseInt(customTarget, 10) : targetScore;

    const trimmedIndividual = individualNames.slice(0, individualCount).map((n, i) => {
      const t = n.trim();
      return t || `Jugador ${i + 1}`;
    });

    const newSettings: GameSettings = {
      targetScore: Math.max(10, activeScore || 100),
      gameMode,
      team1Name: team1Name.trim() || 'Nosotros',
      team2Name: team2Name.trim() || 'Ellos',
      team1Members: [
        team1Members[0].trim() || 'Jugador 1',
        team1Members[1].trim() || 'Jugador 2',
      ],
      team2Members: [
        team2Members[0].trim() || 'Jugador 3',
        team2Members[1].trim() || 'Jugador 4',
      ],
      individualPlayerNames: trimmedIndividual,
      trancaRule,
      capicuaBonus,
      soundEnabled,
      vibrationEnabled,
      timerDurationSeconds,
    };

    onSaveSettings(newSettings, resetGame);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-850">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Settings className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-stone-100 font-display">
              Ajustes de la Partida
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-sm">
          {/* Target Score */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-400" />
              <span>Meta de Puntos para Ganar</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mb-2">
              {[50, 100, 150, 200, 500].map((pts) => (
                <button
                  key={pts}
                  type="button"
                  onClick={() => handleTargetPreset(pts)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                    !isCustomTarget && targetScore === pts
                      ? 'bg-amber-500 text-stone-950 border-amber-500'
                      : 'bg-stone-850 border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  {pts} pts
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCustomTarget(true)}
                className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                  isCustomTarget
                    ? 'bg-amber-500 text-stone-950 border-amber-500'
                    : 'bg-stone-850 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                Otro
              </button>
            </div>
            {isCustomTarget && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Ej. 75, 250, 300"
                  value={customTarget}
                  onChange={(e) => handleCustomTargetChange(e.target.value)}
                  className="bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 w-full focus:outline-none focus:border-amber-500"
                />
                <span className="text-xs text-stone-400 font-semibold whitespace-nowrap">
                  puntos
                </span>
              </div>
            )}
          </div>

          {/* Game Mode */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Modalidad de Juego</span>
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setGameMode('teams')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  gameMode === 'teams'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-semibold'
                    : 'bg-stone-850 border-stone-800 text-stone-400'
                }`}
              >
                <div className="font-bold text-stone-100">Por Parejas (2 Equipos)</div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  El clásico &quot;Nosotros vs Ellos&quot;
                </div>
              </button>
              <button
                type="button"
                onClick={() => setGameMode('individual')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  gameMode === 'individual'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-semibold'
                    : 'bg-stone-850 border-stone-800 text-stone-400'
                }`}
              >
                <div className="font-bold text-stone-100">Individual (Todos contra todos)</div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  De 2 a 4 jugadores
                </div>
              </button>
            </div>

            {/* Names configuration depending on mode */}
            {gameMode === 'teams' ? (
              <div className="space-y-3 p-3 bg-stone-850 rounded-xl border border-stone-800">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] text-stone-400 font-bold block mb-1">
                        Nombre Equipo 1
                      </label>
                      <input
                        type="text"
                        value={team1Name}
                        maxLength={20}
                        onChange={(e) => setTeam1Name(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-750 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 font-semibold focus:outline-none focus:border-amber-500"
                        placeholder="Ej. Nosotros"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-500 font-medium block mb-1">
                        Jugadores de {team1Name || 'Equipo 1'}
                      </label>
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={team1Members[0]}
                          maxLength={18}
                          onChange={(e) => setTeam1Members([e.target.value, team1Members[1]])}
                          className="w-full bg-stone-950/80 border border-stone-800 rounded-lg px-2 py-1 text-[11px] text-stone-200 focus:outline-none focus:border-amber-500"
                          placeholder="Jugador 1"
                        />
                        <input
                          type="text"
                          value={team1Members[1]}
                          maxLength={18}
                          onChange={(e) => setTeam1Members([team1Members[0], e.target.value])}
                          className="w-full bg-stone-950/80 border border-stone-800 rounded-lg px-2 py-1 text-[11px] text-stone-200 focus:outline-none focus:border-amber-500"
                          placeholder="Jugador 2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] text-stone-400 font-bold block mb-1">
                        Nombre Equipo 2
                      </label>
                      <input
                        type="text"
                        value={team2Name}
                        maxLength={20}
                        onChange={(e) => setTeam2Name(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-750 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 font-semibold focus:outline-none focus:border-amber-500"
                        placeholder="Ej. Ellos"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-500 font-medium block mb-1">
                        Jugadores de {team2Name || 'Equipo 2'}
                      </label>
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={team2Members[0]}
                          maxLength={18}
                          onChange={(e) => setTeam2Members([e.target.value, team2Members[1]])}
                          className="w-full bg-stone-950/80 border border-stone-800 rounded-lg px-2 py-1 text-[11px] text-stone-200 focus:outline-none focus:border-amber-500"
                          placeholder="Jugador 3"
                        />
                        <input
                          type="text"
                          value={team2Members[1]}
                          maxLength={18}
                          onChange={(e) => setTeam2Members([team2Members[0], e.target.value])}
                          className="w-full bg-stone-950/80 border border-stone-800 rounded-lg px-2 py-1 text-[11px] text-stone-200 focus:outline-none focus:border-amber-500"
                          placeholder="Jugador 4"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-3 bg-stone-850 rounded-xl border border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400 font-semibold">
                    Número de jugadores:
                  </span>
                  <div className="flex items-center gap-1">
                    {[2, 3, 4].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setIndividualCount(count)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold ${
                          individualCount === count
                            ? 'bg-amber-500 text-stone-950'
                            : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: individualCount }).map((_, idx) => (
                    <div key={idx}>
                      <input
                        type="text"
                        placeholder={`Jugador ${idx + 1}`}
                        value={individualNames[idx] || ''}
                        maxLength={20}
                        onChange={(e) => handleIndividualNameChange(idx, e.target.value)}
                        className="w-full bg-stone-950 border border-stone-750 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tranca Rule & Capicúa Bonus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Regla de Tranca</span>
              </label>
              <select
                value={trancaRule}
                onChange={(e) => setTrancaRule(e.target.value as TrancaRule)}
                className="w-full bg-stone-850 border border-stone-750 rounded-xl p-2.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              >
                <option value="sum_opponent">Suma del Rival (tradicional)</option>
                <option value="point_difference">Diferencia de Puntos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Bono de Capicúa</span>
              </label>
              <div className="flex items-center gap-1.5">
                {[0, 25, 50, 100].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setCapicuaBonus(b)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      capicuaBonus === b
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-stone-850 border-stone-800 text-stone-400'
                    }`}
                  >
                    {b === 0 ? 'Sin bono' : `+${b}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sound, Vibration & Timer options */}
          <div className="p-3 bg-stone-850 rounded-xl border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-300 font-medium flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-stone-400" />
                Efectos de sonido (fichas y victorias)
              </span>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-300 font-medium">
                Vibración háptica al pulsar
              </span>
              <input
                type="checkbox"
                checked={vibrationEnabled}
                onChange={(e) => setVibrationEnabled(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Save Buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => handleSave(false)}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Guardar y Continuar Partida Actual</span>
            </button>
            <button
              onClick={() => handleSave(true)}
              className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white font-medium rounded-xl text-xs border border-stone-750 transition-all cursor-pointer"
            >
              Guardar y Reiniciar Nueva Partida desde 0 pts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
