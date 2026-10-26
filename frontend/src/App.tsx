import { useState } from 'react';
import {
  DEFAULT_GAME_RULES,
  FLEET_COMPOSITION,
  GameSession,
  ProbabilityDensityOpponent,
} from 'engine';
import type { Ship, Side } from 'engine';
import type { LogEntry } from './components/AttackLog';
import { PlacementScreen } from './screens/PlacementScreen';
import { GameScreen } from './screens/GameScreen';
import { GameOverScreen } from './screens/GameOverScreen';

const RULES = DEFAULT_GAME_RULES;

type Phase =
  | { name: 'placement' }
  | { name: 'battle' }
  | { name: 'over'; winner: Side; log: LogEntry[] };

// player is always side A, the AI opponent is hardcoded to probability density for now
function createSession(): GameSession {
  return new GameSession({
    rules: RULES,
    sideA: 'player',
    sideB: new ProbabilityDensityOpponent(
      FLEET_COMPOSITION.map((s) => s.size),
      RULES
    ),
  });
}

function App() {
  const [session, setSession] = useState(createSession);
  const [phase, setPhase] = useState<Phase>({ name: 'placement' });

  const handleConfirmPlacement = (ships: Ship[]) => {
    session.placePlayerFleet('A', ships);
    setPhase({ name: 'battle' });
  };

  const handleRestart = () => {
    setSession(createSession());
    setPhase({ name: 'placement' });
  };

  return (
    <div className="min-h-screen px-4 pt-8 pb-16 md:px-10">
      <header className="mx-auto mb-10 max-w-6xl">
        <h1>
          <img
            src="/logo.png"
            alt="Lorentzburn"
            className="h-auto w-full max-w-sm md:max-w-md"
          />
        </h1>
      </header>

      <main className="mx-auto max-w-6xl">
        {phase.name === 'placement' && (
          <PlacementScreen
            board={session.boardA}
            rules={RULES}
            onConfirm={handleConfirmPlacement}
          />
        )}
        {phase.name === 'battle' && (
          <GameScreen
            session={session}
            onGameOver={(winner, log) =>
              setPhase({ name: 'over', winner, log })
            }
          />
        )}
        {phase.name === 'over' && (
          <GameOverScreen
            session={session}
            winner={phase.winner}
            log={phase.log}
            onRestart={handleRestart}
          />
        )}
      </main>
    </div>
  );
}

export default App;
