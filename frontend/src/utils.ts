import { AxiosError } from "axios"
import type { ApiError } from "./client"

export * from "./utils/date"
export * from "./utils/thresholds"

function extractErrorMessage(err: ApiError | Error | unknown): string {
  if (err instanceof AxiosError) {
    return err.message
  }
  if (err instanceof Error && !("body" in err)) {
    return err.message
  }

  const apiErr = err as ApiError
  const errDetail = (apiErr?.body as { detail?: unknown })?.detail
  if (Array.isArray(errDetail) && errDetail.length > 0) {
    const first = errDetail[0]
    if (typeof first === "object" && first !== null && "msg" in first) {
      return String(first.msg)
    }
    return String(first)
  }
  if (typeof errDetail === "string") {
    return errDetail
  }
  return "Something went wrong."
}

export const handleError = function (
  this: (msg: string) => void,
  err: ApiError | Error | unknown,
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
