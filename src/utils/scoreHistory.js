const SCORE_HISTORY_KEY = 'rtta_score_history';

export function getScoreHistory() {
  try {
    const history = window.localStorage.getItem(SCORE_HISTORY_KEY);
    if (history) {
      const parsed = JSON.parse(history);
      // Migration: si l'ancien format existe, le convertir
      if (parsed.solo && !Array.isArray(parsed.solo[Object.keys(parsed.solo)[0] || ''])) {
        return migrateOldFormat(parsed);
      }
      return parsed;
    }
  } catch (error) {
    console.error('Error loading score history:', error);
  }
  return {};
}

function migrateOldFormat(oldHistory) {
  // Ancien format: { solo: [], multi: [] }
  // Nouveau format: { bronze_age: { solo: [], multi: [] }, ... }
  const newHistory = {};

  if (oldHistory.solo && Array.isArray(oldHistory.solo)) {
    // Supposer que c'était pour bronze_age
    newHistory.bronze_age = {
      solo: oldHistory.solo,
      multi: oldHistory.multi || []
    };
  }

  return newHistory;
}

export function addScore(playerName, score, isSolo, variantId) {
  const history = getScoreHistory();

  // Initialiser la variante si elle n'existe pas
  if (!history[variantId]) {
    history[variantId] = { solo: [], multi: [] };
  }

  const newEntry = {
    playerName: playerName,
    score: score,
    date: new Date().toISOString()
  };

  const category = isSolo ? 'solo' : 'multi';
  history[variantId][category].push(newEntry);

  // Trier par score décroissant
  history[variantId][category].sort(function(a, b) {
    return b.score - a.score;
  });

  // Garder seulement les 10 meilleurs
  history[variantId][category] = history[variantId][category].slice(0, 10);

  try {
    window.localStorage.setItem(SCORE_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving score history:', error);
  }

  return history;
}

export function clearScoreHistory() {
  try {
    window.localStorage.removeItem(SCORE_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing score history:', error);
  }
}

export function formatDate(isoDate) {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return day + '/' + month + '/' + year;
}
