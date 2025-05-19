import { Tournament } from "../tournament";
import React from "react";

interface TournamentFormProps {
  tournamentData: Partial<Tournament>;
  onChange: (field: keyof Tournament, value: any) => void;
  onSubmit: () => void;
}

export const TournamentForm = ({ tournamentData, onChange, onSubmit }: TournamentFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handlePlayerCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const playerCount = parseInt(e.target.value) || 2;
    const newPlayers = Array(playerCount).fill(null).map((_, i) => ({
      id: `player-${i}-${Date.now()}`,
      firstName: "",
      lastName: "",
      rating: 0,
      points: 0,
      opponents: [],
    }));
    onChange('players', newPlayers);
  };

  return (
    <form onSubmit={handleSubmit} className="compact-form">
      <h3>Параметры турнира</h3>
      <div className="form-group">
        <label>Название турнира:</label>
        <input 
          type="text" 
          value={tournamentData.name || ''} 
          onChange={(e) => onChange('name', e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Количество участников:</label>
        <input
          type="number"
          min="2"
          max="100"
          value={tournamentData.players?.length || 2}
          onChange={handlePlayerCountChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Количество туров:</label>
        <input
          type="number"
          min="1"
          max="20"
          value={tournamentData.totalRounds || 5}
          onChange={(e) => onChange('totalRounds', parseInt(e.target.value) || 5)}
          required
        />
      </div>
      <button type="submit" className="btn-primary">Создать турнир</button>
    </form>
  );
};