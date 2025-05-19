import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PairingsTable } from "../components/PairingsTable";
import { ResultsForm } from "../components/ResultsForm";
import { useTournament } from "../hooks/useTournament";
import { generatePairings, updateResults } from "../tournament";
import React from "react";

export const TournamentPage = () => {
  const { 
    currentTournament: tournament, 
    setCurrentTournament: setTournament,
    saveTournamentToHistory
  } = useTournament();
  const [isPairingsGenerated, setIsPairingsGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  if (!tournament) {
    return (
      <div className="container">
        <div className="tournament-status">
          <h3>Турнир не найден</h3>
          <p>Пожалуйста, создайте новый турнир</p>
          <button 
            onClick={() => navigate('/setup')} 
            className="btn-primary"
            style={{ marginTop: '1rem' }}
          >
            🛠️ Создать турнир
          </button>
        </div>
      </div>
    );
  }

  const handleStartTournament = () => {
    const newPairings = generatePairings(tournament);
    setTournament({
      ...tournament,
      pairings: newPairings,
      isStarted: true,
      currentRound: 1
    });
    setIsPairingsGenerated(true);
  };

  const handleGeneratePairings = () => {
    const newPairings = generatePairings(tournament);
    setTournament({
      ...tournament,
      pairings: newPairings,
    });
    setIsPairingsGenerated(true);
  };

  const handleResultsSubmit = async (results: { pairingIndex: number; result: number }[]) => {
    setIsLoading(true);
    try {
      const updatedTournament = updateResults(tournament, tournament.currentRound, results);
      if (updatedTournament.currentRound > updatedTournament.totalRounds) {
        updatedTournament.isFinished = true;
        updatedTournament.currentRound = updatedTournament.totalRounds;
      }
      setTournament(updatedTournament);
      setIsPairingsGenerated(false);
      
      if (updatedTournament.isFinished) {
        saveTournamentToHistory(updatedTournament);
        navigate("/results");
      }
    } catch (error) {
      console.error("Ошибка при сохранении результатов:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewTournament = () => {
    if (confirm("Создать новый турнир? Текущий турнир будет сохранен в истории.")) {
      navigate("/setup");
    }
  };

  return (
    <div className="container">
      <header>
        <h1>
          <span className="emoji">🏆</span> {tournament.name}
        </h1>
        <div className="tournament-info">
          <span>📅 Дата создания: {new Date(tournament.createdAt).toLocaleDateString()}</span>
          <span>🌀 Тур: {tournament.currentRound} из {tournament.totalRounds}</span>
          <span>👥 Участников: {tournament.players.length}</span>
        </div>
      </header>
      
      <div className="actions" style={{ margin: '1rem 0' }}>
        <button 
          onClick={() => navigate('/results')} 
          className="btn-secondary"
        >
          📊 Текущие результаты
        </button>
        <button 
          onClick={handleNewTournament}
          className="btn-secondary"
        >
          🆕 Новый турнир
        </button>
      </div>
      
      {!tournament.isStarted ? (
        <div className="tournament-status">
          <h3>Турнир готов к началу</h3>
          <p>Все участники добавлены, можно начинать турнир</p>
          <button 
            onClick={handleStartTournament} 
            className="btn-primary"
            style={{ marginTop: '1rem' }}
          >
            🚀 Начать турнир
          </button>
        </div>
      ) : tournament.isFinished ? (
        <div className="tournament-status">
          <h3>🏆 Турнир завершен!</h3>
          <p>Все туры сыграны, можно посмотреть итоговые результаты</p>
          <div className="actions" style={{ marginTop: '1rem' }}>
            <button 
              onClick={() => navigate('/results')} 
              className="btn-primary"
            >
              📊 Посмотреть результаты
            </button>
            <button 
              onClick={handleNewTournament}
              className="btn-primary"
            >
              🆕 Создать новый турнир
            </button>
          </div>
        </div>
      ) : (
        <>
          <h2>
            <span className="emoji">⚔️</span> Пары {tournament.currentRound} тура
          </h2>
          
          {tournament.pairings.filter(p => p.round === tournament.currentRound).length === 0 ? (
            <div className="tournament-status">
              <p>Пары для текущего тура еще не сгенерированы</p>
              <button 
                onClick={handleGeneratePairings} 
                className="btn-primary"
                style={{ marginTop: '1rem' }}
                disabled={isLoading}
              >
                {isLoading ? '🌀 Генерация...' : '🔄 Сгенерировать пары'}
              </button>
            </div>
          ) : (
            <>
              <PairingsTable 
                pairings={tournament.pairings} 
                players={tournament.players} 
                round={tournament.currentRound} 
              />
              
              <h2>
                <span className="emoji">📝</span> Ввод результатов
              </h2>
              <ResultsForm 
                pairings={tournament.pairings}
                players={tournament.players}
                round={tournament.currentRound}
                onSubmit={handleResultsSubmit} 
                isLoading={isLoading}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};