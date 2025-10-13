import { useTranslation } from 'react-i18next';

export default function DisasterWarning({ totalSkulls, currentPlayer }) {
  const { t } = useTranslation();

  if (totalSkulls < 2) return null;

  let disasterType = null;
  let disasterMessage = '';
  let disasterAffected = '';

  if (totalSkulls === 2) {
    disasterType = 'drought';
    const hasIrrigation = currentPlayer.developments.indexOf('irrigation') !== -1;
    if (hasIrrigation) {
      disasterMessage = t('disasters.droughtAvoided');
      disasterAffected = 'protected';
    } else {
      disasterMessage = t('disasters.drought') + ' !';
      disasterAffected = t('disasters.youLose2Points');
    }
  } else if (totalSkulls === 3) {
    disasterType = 'plague';
    const hasMedicine = currentPlayer.developments.indexOf('medicine') !== -1;
    if (hasMedicine) {
      disasterMessage = t('disasters.plagueAvoided');
      disasterAffected = t('disasters.othersLose3Points');
    } else {
      disasterMessage = t('disasters.plague') + ' !';
      disasterAffected = t('disasters.othersLose3PointsUnprotected');
    }
  } else if (totalSkulls === 4) {
    disasterType = 'invasion';
    const hasSmithing = currentPlayer.developments.indexOf('smithing') !== -1;
    let hasGreatWall = false;
    for (let i = 0; i < currentPlayer.monuments.length; i++) {
      if (currentPlayer.monuments[i].id === 'great_wall' && currentPlayer.monuments[i].completed) {
        hasGreatWall = true;
        break;
      }
    }

    if (hasSmithing) {
      disasterMessage = t('disasters.invasionReversed');
      disasterAffected = t('disasters.youInvadeOpponents');
    } else if (hasGreatWall) {
      disasterMessage = t('disasters.invasionBlocked');
      disasterAffected = 'protected';
    } else {
      disasterMessage = t('disasters.invasion') + ' !';
      disasterAffected = t('disasters.youLose4Points');
    }
  } else if (totalSkulls >= 5) {
    disasterType = 'revolt';
    const hasReligion = currentPlayer.developments.indexOf('religion') !== -1;
    if (hasReligion) {
      disasterMessage = t('disasters.revoltAvoided');
      disasterAffected = t('disasters.othersLoseAllResources');
    } else {
      disasterMessage = t('disasters.revolt') + ' !';
      disasterAffected = t('disasters.youLoseAllResources');
    }
  }

  const isSmithingInvasion = disasterType === 'invasion' && disasterAffected === t('disasters.youInvadeOpponents');
  const isProtected = disasterAffected === 'protected';

  return (
    <div className={`mb-4 p-4 rounded-lg border-2 ${
      isProtected
        ? 'bg-green-50 border-green-400'
        : isSmithingInvasion
        ? 'bg-orange-50 border-orange-400'
        : 'bg-red-50 border-red-400'
    }`}>
      <div className="text-center">
        <div className="text-3xl mb-2">
          {isProtected ? '🛡️' : isSmithingInvasion ? '⚔️' : '☠️'}
        </div>
        <div className={`text-lg font-bold mb-1 ${
          isProtected ? 'text-green-700' : isSmithingInvasion ? 'text-orange-700' : 'text-red-700'
        }`}>
          {disasterMessage}
        </div>
        <div className="text-sm text-gray-600">
          {!isProtected && disasterAffected}
        </div>
      </div>
    </div>
  );
}
