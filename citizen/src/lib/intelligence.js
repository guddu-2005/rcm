// Shared intelligence helpers for citizen portal
export const CATEGORIES = [
  { id: 'water', icon: '💧', label: 'Water' },
  { id: 'electricity', icon: '⚡', label: 'Electricity' },
  { id: 'road', icon: '🛣️', label: 'Road' },
  { id: 'health', icon: '🏥', label: 'Health' },
  { id: 'sanitation', icon: '🗑️', label: 'Garbage' },
  { id: 'fire', icon: '🔥', label: 'Fire' },
  { id: 'flood', icon: '🌊', label: 'Flood' },
  { id: 'crime', icon: '🚨', label: 'Crime' },
  { id: 'gas', icon: '💨', label: 'Gas' },
  { id: 'other', icon: '📋', label: 'Other' },
  { id: 'noise', icon: '📢', label: 'Noise' },
  { id: 'animal', icon: '🐕', label: 'Animal' },
];

const patterns = {
  water: ['water', 'pipe', 'leak', 'flood', 'drain', 'sewer', 'tap', 'supply', 'pipeline', 'boring'],
  electricity: ['electricity', 'power', 'electric', 'light', 'wire', 'pole', 'blackout', 'outage', 'voltage', 'bulb'],
  road: ['road', 'pothole', 'street', 'bridge', 'footpath', 'pavement', 'signal', 'traffic', 'divider', 'speedbreaker'],
  health: ['health', 'hospital', 'ambulance', 'disease', 'epidemic', 'dengue', 'malaria', 'clinic', 'sick', 'fever'],
  sanitation: ['garbage', 'waste', 'dump', 'toilet', 'sewage', 'clean', 'trash', 'litter', 'filth', 'sweeping'],
  fire: ['fire', 'smoke', 'burn', 'flame', 'blazing', 'explosive'],
  flood: ['flood', 'waterlog', 'overflow', 'inundated', 'submerge'],
  crime: ['crime', 'theft', 'robbery', 'assault', 'harassment', 'fight', 'illegal'],
  gas: ['gas', 'lpg', 'cylinder', 'smell', 'leak', 'pipeline'],
  noise: ['noise', 'loud', 'music', 'speaker', 'disturbance', 'sound'],
  animal: ['dog', 'stray', 'animal', 'cow', 'monkey', 'snake'],
};

export function autoClassify(text) {
  const lower = text.toLowerCase();
  for (const [cat, kws] of Object.entries(patterns)) {
    if (kws.some(kw => lower.includes(kw))) return cat;
  }
  return 'other';
}

export function autoSeverity(text, mediaCount = 0, reportCount = 1) {
  const lower = text.toLowerCase();
  const critical = ['emergency', 'urgent', 'critical', 'dangerous', 'fire', 'injured', 'death', 'electrocution', 'explosion'];
  const high = ['severe', 'major', 'broken', 'collapsed', 'no supply', 'days', 'flood'];
  const medium = ['problem', 'issue', 'damaged', 'hours', 'not working'];
  if (critical.some(k => lower.includes(k)) || reportCount > 20) return 'critical';
  if (high.some(k => lower.includes(k)) || reportCount > 10) return 'high';
  if (medium.some(k => lower.includes(k)) || mediaCount >= 2 || reportCount > 5) return 'medium';
  return 'low';
}

export function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function tokenize(t) {
  return t.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
}

function similarities(t1, t2) {
  const w1 = tokenize(t1), w2 = tokenize(t2);
  const all = [...new Set([...w1, ...w2])];
  const v1 = all.map(w => w1.filter(x => x === w).length);
  const v2 = all.map(w => w2.filter(x => x === w).length);
  const dot = v1.reduce((a, v, i) => a + v * v2[i], 0);
  const m1 = Math.sqrt(v1.reduce((a, v) => a + v ** 2, 0));
  const m2 = Math.sqrt(v2.reduce((a, v) => a + v ** 2, 0));
  return (m1 && m2) ? dot / (m1 * m2) : 0;
}

export function findDuplicates(newC, list, radiusKm = 0.5) {
  return list.filter(c => {
    if (!c.location || !newC.location) return false;
    const dist = haversineKm(newC.location, c.location);
    if (dist > radiusKm) return false;
    const sim = similarities(newC.title + ' ' + newC.description, c.title + ' ' + (c.description || ''));
    return sim > 0.25;
  });
}

export function generateTicketId() {
  return 'GRV-' + Date.now().toString(36).toUpperCase().slice(-6);
}
