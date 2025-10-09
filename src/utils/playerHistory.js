const PLAYER_HISTORY_KEY = 'rtta_player_history';

export function getPlayerHistory() {
  try {
    const history = window.localStorage.getItem(PLAYER_HISTORY_KEY);
    if (history) {
      return JSON.parse(history);
    }
  } catch (error) {
    console.error('Error loading player history:', error);
  }
  return [];
}

export function addPlayer(playerName) {
  if (!playerName || playerName.trim() === '') return;

  const history = getPlayerHistory();

  // Ne pas ajouter si le joueur existe déjà
  const existingIndex = history.findIndex(p => p.name === playerName);
  if (existingIndex !== -1) {
    // Mettre à jour la date de dernière utilisation
    history[existingIndex].lastUsed = new Date().toISOString();
  } else {
    // Ajouter le nouveau joueur
    history.push({
      name: playerName,
      lastUsed: new Date().toISOString()
    });
  }

  // Trier par date de dernière utilisation (plus récent en premier)
  history.sort(function(a, b) {
    return new Date(b.lastUsed) - new Date(a.lastUsed);
  });

  try {
    window.localStorage.setItem(PLAYER_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving player history:', error);
  }

  return history;
}

export function removePlayer(playerName) {
  const history = getPlayerHistory();
  const filtered = history.filter(p => p.name !== playerName);

  try {
    window.localStorage.setItem(PLAYER_HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing player:', error);
  }

  return filtered;
}

export function updatePlayerName(oldName, newName) {
  if (!newName || newName.trim() === '') return;

  const history = getPlayerHistory();
  const playerIndex = history.findIndex(p => p.name === oldName);

  if (playerIndex !== -1) {
    history[playerIndex].name = newName;
    history[playerIndex].lastUsed = new Date().toISOString();

    try {
      window.localStorage.setItem(PLAYER_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error updating player name:', error);
    }
  }

  return history;
}

export function clearPlayerHistory() {
  try {
    window.localStorage.removeItem(PLAYER_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing player history:', error);
  }
}
