import { Pairing, Player } from "../tournament";
import { useState } from "react";
import React from "react";

interface ResultsFormProps {
  pairings: Pairing[];
  players: Player[];
  round: number;
  onSubmit: (results: { pairingIndex: number; result: number }[]) => Promise<void>;
  isLoading?: boolean;
}

export const ResultsForm = ({ 
  pairings, 
  players, 
  round, 
  onSubmit,
  isLoading = false
}: ResultsFormProps) => {
  const [results, setResults] = useState<Record<number, number>>({});
  const currentPairings = pairings.filter(p => p.round === round);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const allResults = currentPairings
      .map((pairing, index) => ({
        pairingIndex: index,
        result: pairing.player2Id === null ? 1 : (results[index] ?? -1)
      }))
      .filter(r => r.result !== -1);

    if (allResults.length !== currentPairings.length) {
      alert("Пожалуйста, укажите результаты для всех пар");
      return;
    }

    try {
      await onSubmit(allResults);
    } catch (error) {
      console.error("Ошибка при сохранении результатов:", error);
    }
  };

  const handleResultChange = (index: number, result: number) => {
    setResults(prev => ({ ...prev, [index]: result }));
  };

  return (
    <form onSubmit={handleSubmit} className="compact-form">
      <h2>
        <span className="emoji">📊</span> Результаты {round} тура
      </h2>
      
      {currentPairings.map((pairing, index) => {
        const player1 = players.find(p => p.id === pairing.player1Id);
        const player2 = pairing.player2Id ? players.find(p => p.id === pairing.player2Id) : null;

        return (
          <div key={index} className="pairing-result">
            <div className="players-names">
              <span className="player-name player1">
                <span className="chess-icon">♔</span> {player1?.firstName} {player1?.lastName}
                <span className="player-rating"> ({player1?.rating})</span>
              </span>
              
              <span className="vs-divider">
                <span className="vs-icon">⚔️</span>
              </span>
              
              <span className="player-name player2">
                {player2 ? (
                  <>
                    <span className="chess-icon">♚</span> {player2.firstName} {player2.lastName}
                    <span className="player-rating"> ({player2.rating})</span>
                  </>
                ) : (
                  <span className="bye-text">BYE</span>
                )}
              </span>
            </div>

            {pairing.player2Id === null ? (
              <div className="radio-group compact">
                <label className="radio-option auto-win">
                  <input 
                    type="radio" 
                    checked
                    readOnly
                  />
                  <span className="result-icon">🏆</span> Автопобеда (BYE)
                </label>
              </div>
            ) : (
              <div className="radio-group compact">
                <label className={`radio-option ${results[index] === 1 ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name={`result-${index}`} 
                    checked={results[index] === 1}
                    onChange={() => handleResultChange(index, 1)}
                    disabled={isLoading}
                  />
                  <span className="result-icon">👑</span> Победа первого игрока
                </label>
                
                <label className={`radio-option ${results[index] === 0.5 ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name={`result-${index}`} 
                    checked={results[index] === 0.5}
                    onChange={() => handleResultChange(index, 0.5)}
                    disabled={isLoading}
                  />
                  <span className="result-icon">⚖️</span> Ничья
                </label>
                
                <label className={`radio-option ${results[index] === 0 ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name={`result-${index}`} 
                    checked={results[index] === 0}
                    onChange={() => handleResultChange(index, 0)}
                    disabled={isLoading}
                  />
                  <span className="result-icon">🏆</span> Победа второго игрока
                </label>
              </div>
            )}
          </div>
        );
      })}
      
      <button 
        type="submit" 
        className={`btn-primary ${isLoading ? 'loading' : ''}`}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner">🌀</span> Сохранение...
          </>
        ) : (
          <>
            <span className="save-icon">💾</span> Сохранить результаты
          </>
        )}
      </button>
    </form>
  );
};