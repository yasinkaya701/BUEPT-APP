export function getWordTarget(task = 'paragraph', level = 'P2') {
  if (task === 'essay') {
    switch (level) {
      case 'P1': return 180;
      case 'P2': return 220;
      case 'P3': return 260;
      case 'P4': return 300;
      default: return 220;
    }
  }
  switch (level) {
    case 'P1': return 120;
    case 'P2': return 150;
    case 'P3': return 170;
    case 'P4': return 200;
    default: return 150;
  }
}
