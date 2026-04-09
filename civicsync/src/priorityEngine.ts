
import type { Priority } from './types'
// keywords to check
const CRITICAL = [
  'fire', 'flood', 'death', 'died', 'dead', 'drowning', 'electrocution', 'electrocuted',
  'collapsed', 'collapse', 'explosion', 'exploded', 'blast', 'accident', 'injury', 'injured',
  'bleeding', 'emergency', 'serious', 'fatal', 'hospital', 'ambulance', 'unconscious',
  'danger', 'dangerous', 'life threatening', 'life-threatening', 'toxic', 'poisonous',
]
const SEVERE = [
  'burst', 'overflowing', 'overflow', 'sewage', 'contaminated', 'contamination',
  'no water', 'no supply', 'no electricity', 'power cut', 'blackout', 'major',
  'severe', 'critical', 'urgent', 'immediately', 'immediate', 'broken pipe',
  'road blocked', 'road closed', 'waterlogging', 'waterlogged',
  'pothole', 'garbage pile', 'overflowing garbage', 'rats', 'pest', 'health hazard',
  'deep', 'large', 'huge', 'massive', 'total failure',
]
const MODERATE = [
  'not working', 'broken', 'damaged', 'faulty', 'malfunction', 'stopped',
  'missing', 'leaking', 'leak', 'crack', 'cracked', 'pothole', 'dim',
  'irregular', 'intermittent', 'frequent', 'recurring', 'again',
  'days', 'week', 'weeks', 'months', 'long time', 'days ago',
  'multiple', 'several', 'many', 'various',
]
const HIGH_IMPACT = [
  'school', 'hospital', 'children', 'elderly', 'pregnant', 'baby',
  'entire colony', 'whole area', 'all residents', 'ward', 'entire ward',
  'main road', 'highway', 'signal', 'junction', 'market',
  'hundreds', 'thousand', 'families', 'community',
]
const CATEGORY_BASE: Record<string, number> = {
  'Water Leak': 55,
  'Water Supply Issue': 50,
  'No Water': 60,
  'Garbage Overflow': 52,
  'Waste Disposal': 38,
  'Sanitation Issue': 45,
  'Power Outage': 55,
  'Electricity Issue': 48,
  'Streetlight Broken': 35,
  'Pothole': 50,
  'Road Damage': 45,
  'Bridge Issue': 58,
  'Bus Delay': 30,
  'Metro Issue': 32,
  'Transport Disruption': 35,
  'Traffic Signal Broken': 48,
  'Illegal Parking': 28,
  'Traffic Jam': 30,
  'Other': 30,
}
export interface PriorityScore {
  score: number
  level: Priority
  confidence: number
  factors: string[]
}
export async function fetchGroqPriority(
  title: string,
  description: string,
  category = 'Other'
): Promise<PriorityScore | null> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  if (!apiKey) {
    console.warn('Groq API Key not found, falling back to local priority engine.')
    return null
  }
  const prompt = `
You are checking complaint priority levels.
Evaluate the following complaint for priority.
Task: Calculate a priority score from 0 (lowest) to 100 (critical life-threatening).
Category: ${category}
Title: ${title}
Description: ${description}
Consider:
- Danger to life, property, or public health (scores >80)
- Essential service disruptions (scores 50-80)
- Nuisance or minor issues (scores <50)
Return ONLY valid JSON. Format exactly as:
{
  "score": <number 0-100>,
  "level": "<Low | Medium | High>",
  "confidence": <number 0-100>,
  "factors": [ "<short string explaining key reason 1>", "<short string 2>" ]
}
`
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.1
      })
    })
    if (!res.ok) {
       console.error("Groq API error:", await res.text())
       return null
    }
    const data = await res.json()
    let content = data.choices[0].message.content
    // console.log("groq answer: " + content)
    const parsed = JSON.parse(content)
    if (typeof parsed.score !== 'number' || !['Low', 'Medium', 'High'].includes(parsed.level)) return null
    return parsed as PriorityScore
  } catch(err) {
    console.error("error fetching api:", err)
    return null
  }
}
export function computePriorityScore(
  title: string,
  description: string,
  category = 'Other'
): PriorityScore {
  let text = `${title} ${description}`.toLowerCase()
  let factors: string[] = []
  
  // start base score
  let raw = CATEGORY_BASE[category] ?? 30
  
  let critHits = 0
  for (let kw of CRITICAL) {
    if (text.includes(kw)) {
      raw += 25
      critHits++
      // if (critHits <= 2) factors.push(`Critical: "${kw}"`)
    }
  }
  let sevHits = 0
  for (const kw of SEVERE) {
    if (text.includes(kw)) {
      raw += 15
      sevHits++
      if (sevHits <= 3) factors.push(`Severe: "${kw}"`)
    }
  }
  let modHits = 0
  for (const kw of MODERATE) {
    if (text.includes(kw)) {
      raw += 8
      modHits++
    }
  }
  if (modHits > 0) factors.push(`${modHits} severity indicator${modHits > 1 ? 's' : ''} found`)
  let impactMultiplier = 1.0
  let impactHits = 0
  for (const kw of HIGH_IMPACT) {
    if (text.includes(kw)) {
      impactMultiplier += 0.12
      impactHits++
    }
  }
  if (impactHits > 0) {
    factors.push(`High-impact area (affects ${impactHits > 1 ? 'large community' : 'sensitive location'})`)
    impactMultiplier = Math.min(impactMultiplier, 1.6)
    raw = raw * impactMultiplier
  }
  const wordCount = description.trim().split(/\s+/).length
  if (wordCount > 50) { raw += 5; }
  else if (wordCount < 10) { raw -= 5 }
  const score = Math.min(100, Math.max(0, Math.round(raw)))
  const level: Priority = score >= 70 ? 'High' : score >= 42 ? 'Medium' : 'Low'
  const distFromBoundary = level === 'High'
    ? score - 70
    : level === 'Low'
    ? 42 - score
    : Math.min(score - 42, 70 - score)
  const confidence = Math.min(100, Math.round(50 + distFromBoundary * 2.5))
  if (factors.length === 0) factors.push(`Base score from category: ${category}`)
  return { score, level, confidence, factors }
}
export function scoreColor(score: number): string {
  if (score >= 70) return '#ef4444'
  if (score >= 42) return '#f59e0b'
  return '#22c55e'
}
export function scoreBg(score: number): string {
  if (score >= 70) return 'rgba(239,68,68,0.08)'
  if (score >= 42) return 'rgba(245,158,11,0.08)'
  return 'rgba(34,197,94,0.08)'
}
export function scoreLabel(score: number): string {
  if (score >= 85) return 'Critical'
  if (score >= 70) return 'High'
  if (score >= 55) return 'Elevated'
  if (score >= 42) return 'Medium'
  if (score >= 25) return 'Low'
  return 'Minimal'
}
