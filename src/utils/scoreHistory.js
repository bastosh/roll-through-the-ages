const SCORE_HISTORY_KEY = 'rtta_score_history';

export function getScoreHistory() {
  try {
    const history = window.localStorage.getItem(SCORE_HISTORY_KEY);
    if (history) {
      return JSON.parse(history);
    }
  } catch (error) {
    console.error('Error loading score history:', error);
  }
  return { solo: [], multi: [] };
}

export function addScore(playerName, score, isSolo) {
  const history = getScoreHistory();
  const newEntry = {
    playerName: playerName,
    score: score,
    date: new Date().toISOString(),
    isSolo: isSolo
  };

  const category = isSolo ? 'solo' : 'multi';
  history[category].push(newEntry);

  // Trier par score décroissant
  history[category].sort(function(a, b) {
    return b.score - a.score;
  });

  // Garder seulement les 10 meilleurs
  history[category] = history[category].slice(0, 10);

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
