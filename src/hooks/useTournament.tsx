import { useState, createContext, useContext, useEffect } from "react";
import { Tournament } from "../tournament";
import React from "react";

interface SavedTournament extends Tournament {
  finishedAt: Date;
}

interface TournamentHistory {
  tournaments: SavedTournament[];
}

interface TournamentContextType {
  currentTournament: Tournament | null;
  setCurrentTournament: (tournament: Tournament) => void;
  tournamentHistory: TournamentHistory;
  saveTournamentToHistory: (tournament: Tournament) => void;
  clearTournamentHistory: () => void;
}

const TournamentContext = createContext<TournamentContextType>({
  currentTournament: null,
  setCurrentTournament: () => {},
  tournamentHistory: { tournaments: [] },
  saveTournamentToHistory: () => {},
  clearTournamentHistory: () => {},
});

export const TournamentProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null);
  const [tournamentHistory, setTournamentHistory] = useState<TournamentHistory>({ tournaments: [] });

  // Загрузка истории при монтировании
  useEffect(() => {
    const savedHistory = sessionStorage.getItem('tournamentHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (parsed?.tournaments) {
          // Преобразуем строковые даты в объекты Date
          const tournaments = parsed.tournaments.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
            finishedAt: new Date(t.finishedAt)
          }));
          setTournamentHistory({ tournaments });
        }
      } catch (e) {
        console.error("Failed to parse tournament history", e);
        localStorage.removeItem('tournamentHistory');
      }
    }
  }, []);

  // Автосохранение истории при изменении
  useEffect(() => {
    if (tournamentHistory.tournaments.length > 0) {
      localStorage.setItem('tournamentHistory', JSON.stringify(tournamentHistory));
    }
  }, [tournamentHistory]);

  const saveTournamentToHistory = (tournament: Tournament) => {
    if (!tournament.isFinished) return;
    
    const savedTournament: SavedTournament = {
      ...tournament,
      finishedAt: new Date()
    };

    setTournamentHistory(prev => ({
      tournaments: [...prev.tournaments, savedTournament]
    }));
  };

  const clearTournamentHistory = () => {
    setTournamentHistory({ tournaments: [] });
    localStorage.removeItem('tournamentHistory');
  };

  return (
    <TournamentContext.Provider value={{ 
      currentTournament, 
      setCurrentTournament,
      tournamentHistory,
      saveTournamentToHistory,
      clearTournamentHistory
    }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};