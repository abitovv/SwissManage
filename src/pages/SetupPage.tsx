import { useState } from "react";
import { TournamentForm } from "../components/TournamentForm";
import { PlayersForm } from "../components/PlayersForm";
import { useNavigate } from "react-router-dom";
import { createNewTournament , Tournament, Player} from "../tournament";
import { useTournament } from "../hooks/useTournament";
import React from "react";

export const SetupPage = () => {
  const navigate = useNavigate();
  const { setCurrentTournament } = useTournament();
  const [step, setStep] = useState<"params" | "players">("params");
  const [tournamentData, setTournamentData] = useState<Partial<Tournament>>({
    name: "",
    totalRounds: 5,
    players: Array(8).fill(null).map((_, i) => ({
      id: `player-${i}-${Date.now()}`,
      firstName: "",
      lastName: "",
      rating: 0,
      points: 0,
      opponents: [],
    })),
  });

  const handleTournamentSubmit = () => {
    setStep("players");
  };

  const handlePlayersSubmit = () => {
    const newTournament = {
      ...createNewTournament(
        tournamentData.name || "Новый турнир",
        tournamentData.totalRounds || 5,
        tournamentData.players?.length || 8
      ),
      players: tournamentData.players || [],
    };
    
    setCurrentTournament(newTournament);
    navigate("/tournament");
  };

  const handlePlayerChange = (index: number, field: keyof Player, value: string | number) => {
    const updatedPlayers = [...(tournamentData.players || [])];
    updatedPlayers[index] = { ...updatedPlayers[index], [field]: value };
    setTournamentData({ ...tournamentData, players: updatedPlayers });
  };

  return (
    <div className="container">
      <h1>Настройка турнира</h1>
      
      {step === "params" ? (
        <TournamentForm 
          tournamentData={tournamentData}
          onChange={(field, value) => setTournamentData({ ...tournamentData, [field]: value })}
          onSubmit={handleTournamentSubmit}
        />
      ) : (
        <PlayersForm 
          players={tournamentData.players || []}
          onPlayerChange={handlePlayerChange}
          onSubmit={handlePlayersSubmit}
        />
      )}
    </div>
  );
};