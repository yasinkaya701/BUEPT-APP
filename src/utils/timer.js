export function getTimerForLevel(level = 'P2') {
  switch (level) {
    case 'P1': return 20;
    case 'P2': return 25;
    case 'P3': return 30;
    case 'P4': return 40;
    default: return 30;
  }
}
