export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  rating: number;
  points: number;
  opponents: string[];
  receivedBye?: boolean;
}

export interface Pairing {
  round: number;
  player1Id: string;
  player2Id: string | null;
  result?: number; // 1 - победа 1-го, 0 - победа 2-го, 0.5 - ничья
}

export interface Tournament {
  id: string;
  name: string;
  totalRounds: number;
  currentRound: number;
  players: Player[];
  pairings: Pairing[];
  isStarted: boolean;
  isFinished: boolean;
  createdAt: Date;
}

export interface SavedTournament extends Tournament {
  finishedAt: Date;
}

export const createNewTournament = (
  name: string,
  totalRounds: number,
  playerCount: number
): Tournament => {
  return {
    id: Date.now().toString(),
    name,
    totalRounds,
    currentRound: 1,
    players: Array.from({ length: playerCount }, (_, i) => ({
      id: `player-${i}-${Date.now()}`,
      firstName: "",
      lastName: "",
      rating: 0,
      points: 0,
      opponents: [],
      receivedBye: false,
      colorPreference: 0,
    })),
    pairings: [],
    isStarted: false,
    isFinished: false,
    createdAt: new Date(),
  };
};

export const generatePairings = (tournament: Tournament): Pairing[] => {
  const { players, currentRound } = tournament;
  
  // Фильтруем активных игроков (кроме первого тура)
  const activePlayers = currentRound === 1 
    ? [...players] 
    : players.filter(p => !p.receivedBye);

  // Сортируем по очкам (по убыванию), затем по рейтингу
  const sortedPlayers = [...activePlayers].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.rating - a.rating;
  });

  const newPairings: Pairing[] = [];
  const pairedIds = new Set<string>();

  // Первый тур - жеребьёвка по рейтингу
  if (currentRound === 1) {
    const half = Math.ceil(sortedPlayers.length / 2);
    for (let i = 0; i < half; i++) {
      const player1 = sortedPlayers[i];
      const player2 = i + half < sortedPlayers.length ? sortedPlayers[i + half] : null;
      
      if (player2) {
        newPairings.push({
          round: currentRound,
          player1Id: player1.id,
          player2Id: player2.id,
        });
      } else if (!player1.receivedBye) {
        newPairings.push({
          round: currentRound,
          player1Id: player1.id,
          player2Id: null, // BYE
        });
        player1.receivedBye = true;
      }
    }
    return newPairings;
  }

  // Швейцарская система для последующих туров
  for (let i = 0; i < sortedPlayers.length; i++) {
    const player1 = sortedPlayers[i];
    if (pairedIds.has(player1.id)) continue;

    // Ищем лучшего соперника
    let bestOpponent: Player | null = null;
    let bestScore = -Infinity;

    for (let j = i + 1; j < sortedPlayers.length; j++) {
      const player2 = sortedPlayers[j];
      if (!pairedIds.has(player2.id) && !player1.opponents.includes(player2.id)) {
        const score = calculatePairingScore(player1, player2);
        if (score > bestScore) {
          bestScore = score;
          bestOpponent = player2;
        }
      }
    }

    // Создаём пару или назначаем BYE
    if (bestOpponent) {
      newPairings.push({
        round: currentRound,
        player1Id: player1.id,
        player2Id: bestOpponent.id,
      });
      pairedIds.add(player1.id);
      pairedIds.add(bestOpponent.id);
    } else if (!player1.receivedBye) {
      newPairings.push({
        round: currentRound,
        player1Id: player1.id,
        player2Id: null, // BYE
      });
      player1.receivedBye = true;
      pairedIds.add(player1.id);
    }
  }

  // Проверяем, что все игроки получили пары
  if (newPairings.length < Math.ceil(activePlayers.length / 2)) {
    console.warn("Не все игроки получили пары в туре", currentRound);
  }

  return newPairings;
};

const calculatePairingScore = (player1: Player, player2: Player): number => {
  // Баллы за разницу очков (чем ближе по очкам, тем лучше)
  const pointsDiff = 10 - Math.abs(player1.points - player2.points);
  
  return pointsDiff;
};

export const updateResults = (
  tournament: Tournament,
  round: number,
  results: { pairingIndex: number; result: number }[]
): Tournament => {
  const updated = {
    ...tournament,
    players: tournament.players.map(p => ({ ...p })),
    pairings: tournament.pairings.map(p => ({ ...p })),
  };

  // Обновляем результаты пар
  const currentPairings = updated.pairings.filter(p => p.round === round);
  results.forEach(({ pairingIndex, result }) => {
    if (pairingIndex >= 0 && pairingIndex < currentPairings.length) {
      const pairing = currentPairings[pairingIndex];
      pairing.result = result;

      const player1 = updated.players.find(p => p.id === pairing.player1Id);
      const player2 = pairing.player2Id 
        ? updated.players.find(p => p.id === pairing.player2Id) 
        : null;

      if (player1) {
        player1.points += result ?? 0;
        if (player2) {
          player2.points += 1 - (result ?? 0);
          player1.opponents.push(player2.id);
          player2.opponents.push(player1.id);
        } else {
          player1.receivedBye = true;
        }
      }
    }
  });

  // Проверяем завершение турнира
  const isLastRound = round >= updated.totalRounds;
  const allPairsPlayed = checkAllPairsPlayed(updated.players);
  updated.isFinished = isLastRound || allPairsPlayed;
  updated.currentRound = updated.isFinished ? round : round + 1;

  return updated;
};

const checkAllPairsPlayed = (players: Player[]): boolean => {
  const activePlayers = players.filter(p => !p.receivedBye);
  
  // Если осталось меньше 2 игроков
  if (activePlayers.length < 2) return true;

  // Проверяем все возможные пары
  for (let i = 0; i < activePlayers.length; i++) {
    for (let j = i + 1; j < activePlayers.length; j++) {
      if (!activePlayers[i].opponents.includes(activePlayers[j].id)) {
        return false;
      }
    }
  }

  return true;
};

// Вспомогательные функции для тай-брейков
export const calculateBuchholz = (player: Player, allPlayers: Player[]): number => {
  return player.opponents.reduce((sum, opponentId) => {
    const opponent = allPlayers.find(p => p.id === opponentId);
    return sum + (opponent?.points ?? 0);
  }, 0);
};

