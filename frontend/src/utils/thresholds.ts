/**
 * Habitability threshold settings & localStorage persistence.
 */

export const DEFAULT_HABITABILITY_SCORE_THRESHOLD = 80.0
export const DEFAULT_HABITABILITY_CONFIDENCE_THRESHOLD = 0.8

export interface HabitabilityThresholds {
  score: number
  confidence: number
}

const STORAGE_KEY = "habitability_thresholds"

export function getStoredThresholds(): HabitabilityThresholds {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        score:
          typeof parsed.score === "number"
            ? parsed.score
            : DEFAULT_HABITABILITY_SCORE_THRESHOLD,
        confidence:
          typeof parsed.confidence === "number"
            ? parsed.confidence
            : DEFAULT_HABITABILITY_CONFIDENCE_THRESHOLD,
      }
    }
  } catch {}
  return {
    score: DEFAULT_HABITABILITY_SCORE_THRESHOLD,
    confidence: DEFAULT_HABITABILITY_CONFIDENCE_THRESHOLD,
  }
}

export function saveStoredThresholds(score: number, confidence: number): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ score, confidence }))
}
