import { Player } from "../tournament";
import React from "react";

interface PlayersFormProps {
  players: Player[];
  onPlayerChange: (index: number, field: keyof Player, value: string | number) => void;
  onSubmit: () => void;
}

export const PlayersForm = ({ players, onPlayerChange, onSubmit }: PlayersFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="compact-form">
      <h3>Ввод участников</h3>
      <div className="players-grid">
        {players.map((player, index) => (
          <div key={player.id} className="player-card">
            <h4>Участник {index + 1}</h4>
            <div className="form-group">
              <label>Имя:</label>
              <input 
                type="text" 
                value={player.firstName}
                onChange={(e) => onPlayerChange(index, 'firstName', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Фамилия:</label>
              <input 
                type="text" 
                value={player.lastName}
                onChange={(e) => onPlayerChange(index, 'lastName', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Рейтинг:</label>
              <input 
                type="number" 
                value={player.rating}
                onChange={(e) => onPlayerChange(index, 'rating', parseInt(e.target.value) || 0)}
                required
                min="0"
              />
            </div>
          </div>
        ))}
      </div>
      <button type="submit" className="btn-primary">Сохранить участников</button>
    </form>
  );
};