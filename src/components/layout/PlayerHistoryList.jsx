import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function PlayerHistoryList({ playerHistory, onDeletePlayer, onUpdatePlayer }) {
  const { t } = useTranslation();
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editedName, setEditedName] = useState('');

  function handleStartEdit(playerName) {
    setEditingPlayer(playerName);
    setEditedName(playerName);
  }

  function handleSaveEdit() {
    if (editedName && editedName.trim() !== '') {
      onUpdatePlayer(editingPlayer, editedName.trim());
      setEditingPlayer(null);
      setEditedName('');
    }
  }

  function handleCancelEdit() {
    setEditingPlayer(null);
    setEditedName('');
  }

  if (playerHistory.length === 0) {
    return <p className="text-gray-500 dark:text-dark-text-muted text-sm">{t('common.noRegisteredPlayers')}</p>;
  }

  return (
    <div className="space-y-2">
      {playerHistory.map(function(player) {
        const isEditing = editingPlayer === player.name;

        return (
          <div key={player.name} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-dark-elevated rounded transition-colors">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="flex-1 px-2 py-1 border-2 border-amber-500 dark:border-amber-dark-600 dark:bg-dark-surface dark:text-dark-text rounded transition-colors"
                  autoFocus
                />
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-green-600 dark:bg-green-700 text-white text-sm rounded hover:bg-green-700 dark:hover:bg-green-800 cursor-pointer transition-colors"
                >
                  ✓
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 bg-gray-500 dark:bg-gray-600 text-white text-sm rounded hover:bg-gray-600 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 font-semibold dark:text-dark-text">{player.name}</span>
                <button
                  onClick={() => handleStartEdit(player.name)}
                  className="px-3 py-1 bg-blue-500 dark:bg-blue-600 text-white text-sm rounded hover:bg-blue-600 dark:hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  {t('common.edit')}
                </button>
                <button
                  onClick={() => onDeletePlayer(player.name)}
                  className="px-3 py-1 bg-red-500 dark:bg-red-600 text-white text-sm rounded hover:bg-red-600 dark:hover:bg-red-700 cursor-pointer transition-colors"
                >
                  {t('common.delete')}
                </button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
