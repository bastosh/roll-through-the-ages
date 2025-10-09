export default function DisasterWarning({ totalSkulls, currentPlayer }) {
  if (totalSkulls < 2) return null;

  let disasterType = null;
  let disasterMessage = '';
  let disasterAffected = '';

  if (totalSkulls === 2) {
    disasterType = 'drought';
    const hasIrrigation = currentPlayer.developments.indexOf('irrigation') !== -1;
    if (hasIrrigation) {
      disasterMessage = 'Sécheresse évitée grâce à l\'Irrigation';
      disasterAffected = 'protected';
    } else {
      disasterMessage = 'Sécheresse !';
      disasterAffected = 'Vous perdez 2 points';
    }
  } else if (totalSkulls === 3) {
    disasterType = 'plague';
    const hasMedicine = currentPlayer.developments.indexOf('medicine') !== -1;
    if (hasMedicine) {
      disasterMessage = 'Peste évitée grâce à la Médecine';
      disasterAffected = 'Les autres joueurs perdent 3 points';
    } else {
      disasterMessage = 'Peste !';
      disasterAffected = 'Les autres joueurs non protégés perdent 3 points';
    }
  } else if (totalSkulls === 4) {
    disasterType = 'invasion';
    let hasGreatWall = false;
    for (let i = 0; i < currentPlayer.monuments.length; i++) {
      if (currentPlayer.monuments[i].id === 'great_wall' && currentPlayer.monuments[i].completed) {
        hasGreatWall = true;
        break;
      }
    }
    if (hasGreatWall) {
      disasterMessage = 'Invasion repoussée par la Grande Muraille';
      disasterAffected = 'protected';
    } else {
      disasterMessage = 'Invasion !';
      disasterAffected = 'Vous perdez 4 points';
    }
  } else if (totalSkulls >= 5) {
    disasterType = 'revolt';
    const hasReligion = currentPlayer.developments.indexOf('religion') !== -1;
    if (hasReligion) {
      disasterMessage = 'Révolte évitée grâce à la Religion';
      disasterAffected = 'Les autres joueurs perdent toutes leurs ressources';
    } else {
      disasterMessage = 'Révolte !';
      disasterAffected = 'Vous perdez toutes vos ressources';
    }
  }

  return (
    <div className={`mb-4 p-4 rounded-lg border-2 ${
      disasterAffected === 'protected'
        ? 'bg-green-50 border-green-400'
        : 'bg-red-50 border-red-400'
    }`}>
      <div className="text-center">
        <div className="text-3xl mb-2">
          {disasterAffected === 'protected' ? '🛡️' : '☠️'}
        </div>
        <div className={`text-lg font-bold mb-1 ${
          disasterAffected === 'protected' ? 'text-green-700' : 'text-red-700'
        }`}>
          {disasterMessage}
        </div>
        <div className="text-sm text-gray-600">
          {disasterAffected !== 'protected' && disasterAffected}
        </div>
      </div>
    </div>
  );
}
