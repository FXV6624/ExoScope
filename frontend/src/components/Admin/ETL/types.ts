export interface DetailedETLReport {
  id?: string
  extracted: number
  transformed: number
  load_result: {
    attempted: number
    inserted: number
    updated: number
    skipped: number
  }
  started_at?: string
  finished_at?: string
  duration_seconds: number
  extract_time: number
  transform_time: number
  load_time: number
  total_time?: number
  success: boolean
  errors: string[]
}
