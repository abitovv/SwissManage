import { useParams, useNavigate, Link } from "react-router-dom";
import { StandingsTable } from "../components/StandingsTable";
import { useTournament } from "../hooks/useTournament";
import { Tournament } from "../tournament";
import React from "react";

interface SavedTournament extends Tournament {
  finishedAt: Date;
}

export const ResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentTournament, tournamentHistory } = useTournament();

  // Определяем тип для турнира с учетом истории
  const tournament = id 
    ? tournamentHistory.tournaments.find(t => t.id === id) 
    : currentTournament;

  if (!tournament) {
    return (
      <div className="container">
        <div className="tournament-status">
          <h3>Турнир не найден</h3>
          <p>Возможно, турнир был удален или еще не завершен</p>
          <button 
            onClick={() => navigate('/')} 
            className="btn-primary"
            style={{ marginTop: '1rem' }}
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  // Проверяем, является ли турнир сохраненным (имеет finishedAt)
  const isSavedTournament = (t: Tournament | SavedTournament): t is SavedTournament => {
    return 'finishedAt' in t;
  };

  return (
    <div className="container">
      <h1>
        <span className="emoji">🏆</span> Результаты турнира: {tournament.name}
      </h1>
      
      <div className="tournament-meta">
        <span>📅 Дата создания: {new Date(tournament.createdAt).toLocaleDateString()}</span>
        {isSavedTournament(tournament) && (
          <span>🏁 Завершен: {new Date(tournament.finishedAt).toLocaleDateString()}</span>
        )}
        <span>👥 Участников: {tournament.players.length}</span>
        <span>🌀 Сыграно: {tournament.currentRound} из {tournament.totalRounds} туров</span>
      </div>
      
      <StandingsTable players={tournament.players} />
      
      <div className="actions">
        <Link to="/history" className="btn-secondary">
          📜 К истории турниров
        </Link>
        <Link to="/" className="btn-primary">
          🏠 На главную
        </Link>
      </div>
    </div>
  );
};