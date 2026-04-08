import { type Complaint } from './types'

// ─── Token similarity (Jaccard) ──────────────────────────────
export function tokenSimilarity(a: string, b: string): number {
  const tokenize = (s: string) =>
    new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2))
  const setA = tokenize(a)
  const setB = tokenize(b)
  if (!setA.size && !setB.size) return 1
  if (!setA.size || !setB.size) return 0
  let intersect = 0
  setA.forEach(w => { if (setB.has(w)) intersect++ })
  return intersect / (setA.size + setB.size - intersect) // Jaccard
}

// ─── Core duplicate detector ──────────────────────────────────
export interface DuplicateMatch {
  existing: Complaint
  newTitle: string
  newDesc: string
  newLocation: string
  newCategory: string
  score: number           // 0–1
  reason: string
}

/**
 * Given a new complaint (before saving), checks existing open complaints
 * for duplicates. Returns the best match or null.
 *
 * Detection rules:
 *  1. Same citizenId + same category + same location keywords → EXACT SELF-DUPLICATE
 *  2. Same category + location sim > 0.5 + desc sim > 0.35 → NEAR DUPLICATE
 *  3. Same category + desc sim > 0.6 → TEXT DUPLICATE
 */
export function findDuplicate(
  newC: { title: string; description: string; location: string; category: string; citizenId: string },
  existing: Complaint[],
  windowDays = 30
): DuplicateMatch | null {
  const cutoff = Date.now() - windowDays * 86400000
  const open = existing.filter(c =>
    !['Resolved', 'Closed'].includes(c.status) &&
    new Date(c.createdAt).getTime() > cutoff
  )

  let best: DuplicateMatch | null = null

  for (const c of open) {
    if (c.category !== newC.category) continue  // Must be same category

    const locSim  = tokenSimilarity(c.location, newC.location)
    const descSim = tokenSimilarity(c.description, newC.description)
    const titSim  = tokenSimilarity(c.title, newC.title)

    // Rule 1: Same citizen submitting effectively the same complaint
    const selfDup = c.citizenId === newC.citizenId && locSim > 0.4 && (descSim > 0.3 || titSim > 0.4)

    // Rule 2: Different citizen, same location + similar description
    const nearDup = locSim > 0.5 && descSim > 0.35

    // Rule 3: Very similar description regardless of location
    const textDup = descSim > 0.6 || titSim > 0.65

    if (!selfDup && !nearDup && !textDup) continue

    const score = Math.max(
      selfDup ? 0.9 : 0,
      nearDup ? (locSim + descSim) / 2 : 0,
      textDup ? Math.max(descSim, titSim) : 0,
    )

    const reason = selfDup
      ? 'You already submitted a similar complaint'
      : nearDup
      ? 'Another complaint at the same location is already open'
      : 'A very similar complaint is already being tracked'

    if (!best || score > best.score) {
      best = {
        existing: c,
        newTitle: newC.title,
        newDesc: newC.description,
        newLocation: newC.location,
        newCategory: newC.category,
        score,
        reason,
      }
    }
  }

  return best && best.score >= 0.4 ? best : null
}

/**
 * Scans ALL existing complaints and returns groups of duplicates.
 * Used by admin to bulk-delete duplicates.
 */
export interface DuplicateGroup {
  primary: Complaint      // oldest / most progressed — keep this one
  duplicates: Complaint[] // these should be deleted
  reason: string
}

export function scanAllDuplicates(complaints: Complaint[]): DuplicateGroup[] {
  const open = complaints.filter(c => !['Resolved', 'Closed'].includes(c.status))
  const visited = new Set<string>()
  const groups: DuplicateGroup[] = []

  for (let i = 0; i < open.length; i++) {
    const a = open[i]
    if (visited.has(a.id)) continue

    const dups: Complaint[] = []
    for (let j = i + 1; j < open.length; j++) {
      const b = open[j]
      if (visited.has(b.id)) continue
      if (a.category !== b.category) continue

      const locSim  = tokenSimilarity(a.location, b.location)
      const descSim = tokenSimilarity(a.description, b.description)
      const titSim  = tokenSimilarity(a.title, b.title)

      const isDup = (locSim > 0.5 && descSim > 0.35) || descSim > 0.6 || titSim > 0.65

      if (isDup) {
        dups.push(b)
        visited.add(b.id)
      }
    }

    if (dups.length > 0) {
      visited.add(a.id)
      // Primary = most progressed complaint (highest status index)
      const statusOrder: Record<string, number> = {
        Submitted: 0, Verified: 1, Assigned: 2, 'In Progress': 3, Resolved: 4, Closed: 5
      }
      const all = [a, ...dups].sort((x, y) =>
        (statusOrder[y.status] ?? 0) - (statusOrder[x.status] ?? 0) ||
        new Date(x.createdAt).getTime() - new Date(y.createdAt).getTime() // earlier = primary
      )
      groups.push({
        primary: all[0],
        duplicates: all.slice(1),
        reason: `${all.length} complaints in category "${a.category}" at similar location`,
      })
    }
  }

  return groups
}
