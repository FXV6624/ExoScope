import { AxiosError } from "axios"
import type { ApiError } from "./client"

function extractErrorMessage(err: ApiError): string {
  if (err instanceof AxiosError) {
    return err.message
  }

  const errDetail = (err.body as any)?.detail
  if (Array.isArray(errDetail) && errDetail.length > 0) {
    return errDetail[0].msg
  }
  return errDetail || "Something went wrong."
}

export const handleError = function (
  this: (msg: string) => void,
  err: ApiError,
) {
  const errorMessage = extractErrorMessage(err)
  this(errorMessage)
}

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}

export const DEFAULT_HABITABILITY_SCORE_THRESHOLD = 80.0
export const DEFAULT_HABITABILITY_CONFIDENCE_THRESHOLD = 0.8

export function getStoredThresholds(): { score: number; confidence: number } {
  try {
    const raw = localStorage.getItem("habitability_thresholds")
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
  localStorage.setItem(
    "habitability_thresholds",
    JSON.stringify({ score, confidence }),
  )
}
