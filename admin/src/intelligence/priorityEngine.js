
export const SEVERITY_WEIGHTS = {
  critical: 40,
  high: 30,
  medium: 20,
  low: 10,
};
export const CATEGORY_MULTIPLIERS = {
  water: 1.3,
  electricity: 1.2,
  road: 1.1,
  health: 1.4,
  sanitation: 1.2,
  fire: 1.5,
  flood: 1.5,
  crime: 1.3,
  gas: 1.4,
  other: 1.0,
};
export const LOCATION_IMPORTANCE = {
  hospital: 1.5,
  school: 1.4,
  market: 1.2,
  residential: 1.0,
  commercial: 1.1,
  industrial: 0.9,
};
export function calculatePriorityScore(complaint) {
  const {
    severity = 'low',
    category = 'other',
    reportCount = 1,
    createdAt,
    populationImpact = 1,
    locationType = 'residential',
    mediaCount = 0,
    upvotes = 0,
  } = complaint;
  const severityScore = SEVERITY_WEIGHTS[severity] || 10;
  const ageHours = createdAt
    ? (Date.now() - new Date(createdAt.seconds ? createdAt.seconds * 1000 : createdAt).getTime()) / 3600000
    : 0;
  const ageScore = Math.min(20, ageHours / 4);
  const reportScore = Math.min(20, reportCount * 2);
  const impactScore = Math.min(10, populationImpact);
  const evidenceScore = Math.min(5, mediaCount);
  const upvoteScore = Math.min(5, upvotes * 0.5);
  const rawScore = severityScore + ageScore + reportScore + impactScore + evidenceScore + upvoteScore;
  const categoryMult = CATEGORY_MULTIPLIERS[category] || 1.0;
  const locationMult = LOCATION_IMPORTANCE[locationType] || 1.0;
  const finalScore = Math.min(100, rawScore * categoryMult * locationMult);
  return Math.round(finalScore);
}
export function classifyComplaint(text) {
  const lower = text.toLowerCase();
  const patterns = {
    water: ['water', 'pipe', 'leak', 'flood', 'drain', 'sewer', 'tap', 'supply', 'pipeline'],
    electricity: ['electricity', 'power', 'electric', 'light', 'wire', 'pole', 'blackout', 'outage', 'voltage'],
    road: ['road', 'pothole', 'street', 'bridge', 'footpath', 'pavement', 'signal', 'traffic', 'divider'],
    health: ['health', 'hospital', 'ambulance', 'disease', 'epidemic', 'dengue', 'malaria', 'clinic'],
    sanitation: ['garbage', 'waste', 'dump', 'toilet', 'sewage', 'clean', 'trash', 'litter', 'filth'],
    fire: ['fire', 'smoke', 'burn', 'flame', 'blazing'],
    flood: ['flood', 'waterlog', 'overflow', 'inundated', 'submerge'],
    crime: ['crime', 'theft', 'robbery', 'assault', 'harassment', 'eve-teas'],
    gas: ['gas', 'lpg', 'cylinder', 'leak', 'smell'],
  };
  for (const [category, keywords] of Object.entries(patterns)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return category;
    }
  }
  return 'other';
}
export function detectSeverity(text, mediaCount = 0, reportCount = 1) {
  const lower = text.toLowerCase();
  const criticalKeywords = ['emergency', 'urgent', 'critical', 'dangerous', 'deadly', 'fire', 'explosion', 'injured', 'death', 'electrocution'];
  const highKeywords = ['severe', 'major', 'broken', 'collapsed', 'flooded', 'no supply', 'complete outage', 'days'];
  const mediumKeywords = ['broken', 'damaged', 'hours', 'problem', 'issue', 'facing'];
  if (criticalKeywords.some(kw => lower.includes(kw)) || reportCount > 20) return 'critical';
  if (highKeywords.some(kw => lower.includes(kw)) || reportCount > 10) return 'high';
  if (mediumKeywords.some(kw => lower.includes(kw)) || reportCount > 5 || mediaCount >= 3) return 'medium';
  return 'low';
}
export function checkDuplicate(newComplaint, existingComplaints, radiusKm = 0.5) {
  const duplicates = [];
  for (const existing of existingComplaints) {
    if (!existing.location || !newComplaint.location) continue;
    const distance = haversineDistance(
      { lat: newComplaint.location.lat, lng: newComplaint.location.lng },
      { lat: existing.location.lat, lng: existing.location.lng }
    );
    if (distance > radiusKm) continue;
    const similarity = cosineSimilarity(
      newComplaint.title + ' ' + newComplaint.description,
      existing.title + ' ' + existing.description
    );
    if (similarity > 0.3) {
      duplicates.push({ ...existing, distance, similarity });
    }
  }
  return duplicates.sort((a, b) => b.similarity - a.similarity);
}
export function haversineDistance(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
function cosineSimilarity(text1, text2) {
  const words1 = tokenize(text1);
  const words2 = tokenize(text2);
  const allWords = [...new Set([...words1, ...words2])];
  const vec1 = allWords.map(w => words1.filter(x => x === w).length);
  const vec2 = allWords.map(w => words2.filter(x => x === w).length);
  const dot = vec1.reduce((acc, v, i) => acc + v * vec2[i], 0);
  const mag1 = Math.sqrt(vec1.reduce((acc, v) => acc + v ** 2, 0));
  const mag2 = Math.sqrt(vec2.reduce((acc, v) => acc + v ** 2, 0));
  if (!mag1 || !mag2) return 0;
  return dot / (mag1 * mag2);
}
function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
}
export function getPriorityLabel(score) {
  if (score >= 75) return 'critical';
  if (score >= 55) return 'high';
  if (score >= 35) return 'medium';
  return 'low';
}
export function rankComplaints(complaints) {
  return [...complaints]
    .map(c => ({ ...c, priorityScore: calculatePriorityScore(c) }))
    .sort((a, b) => b.priorityScore - a.priorityScore);
}
