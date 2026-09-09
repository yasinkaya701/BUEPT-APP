export const bueptAssets = {
  campus: {
    southGate: {
      source: require('../assets/images/real_south_gate.webp'),
      alt: 'Boğaziçi University South Campus entrance',
      focalPoint: { x: 0.5, y: 0.48 },
    },
    northCampus: {
      source: require('../assets/images/real_north_campus.webp'),
      alt: 'Boğaziçi University campus view',
      focalPoint: { x: 0.52, y: 0.46 },
    },
    sunset: {
      source: require('../assets/images/boun_sunset.webp'),
      alt: 'Boğaziçi campus and Bosphorus at sunset',
      focalPoint: { x: 0.55, y: 0.5 },
    },
    bosphorus: {
      source: require('../assets/images/boun_campus.webp'),
      alt: 'Boğaziçi campus atmosphere overlooking Istanbul',
      focalPoint: { x: 0.5, y: 0.48 },
    },
    splash: {
      source: require('../assets/images/boun_splash.webp'),
      alt: 'Boğaziçi University campus atmosphere',
      focalPoint: { x: 0.5, y: 0.5 },
    },
  },
};

export const odtuAssets = {
  campus: {
    southGate: {
      source: require('../assets/images/odtu_gate.webp'),
      alt: 'METU campus entrance',
      focalPoint: { x: 0.5, y: 0.5 },
    },
    northCampus: {
      source: require('../assets/images/odtu_campus_panorama.webp'),
      alt: 'METU campus panorama',
      focalPoint: { x: 0.5, y: 0.5 },
    },
    sunset: {
      source: require('../assets/images/odtu_campus_walkway.webp'),
      alt: 'METU campus walkway',
      focalPoint: { x: 0.5, y: 0.5 },
    },
    bosphorus: {
      source: require('../assets/images/odtu_campus_panorama.webp'),
      alt: 'METU campus panorama',
      focalPoint: { x: 0.5, y: 0.5 },
    },
    splash: {
      source: require('../assets/images/odtu_gate.webp'),
      alt: 'METU campus',
      focalPoint: { x: 0.5, y: 0.5 },
    },
  },
};

export function getV2Assets(uniKey = 'buept') {
  const pack = uniKey === 'odtu' ? odtuAssets : bueptAssets;
  return {
    ...pack,
    skills: {
      reading: pack.campus.northCampus,
      listening: pack.campus.sunset,
      writing: pack.campus.southGate,
      grammar: pack.campus.bosphorus,
      vocabulary: pack.campus.splash,
    },
    editorial: {
      today: pack.campus.sunset,
      progress: pack.campus.bosphorus,
      mock: pack.campus.southGate,
    },
  };
}
