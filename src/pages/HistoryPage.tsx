import { Link } from "react-router-dom";
import { useTournament } from "../hooks/useTournament";
import React from "react";

export const HistoryPage = () => {
  const { tournamentHistory } = useTournament();

  return (
    <div className="container">
      <h1>🏆 История турниров</h1>
      
      {tournamentHistory.tournaments.length === 0 ? (
        <p>Нет завершенных турниров</p>
      ) : (
        <div className="tournaments-list">
          {tournamentHistory.tournaments.map((tournament) => (
            <div key={tournament.id} className="tournament-card">
              <h3>{tournament.name}</h3>
              <div className="tournament-meta">
                <span>📅 {new Date(tournament.createdAt).toLocaleDateString()}</span>
                <span>🏁 {new Date(tournament.finishedAt).toLocaleDateString()}</span>
                <span>👥 {tournament.players.length} участников</span>
                <span>🌀 {tournament.totalRounds} туров</span>
              </div>
              <Link 
                to={`/results/${tournament.id}`} 
                className="btn-secondary"
              >
                Просмотреть результаты
              </Link>
            </div>
          ))}
        </div>
      )}
      
      <Link to="/" className="btn-primary" style={{ marginTop: '2rem' }}>
        На главную
      </Link>
    </div>
  );
};