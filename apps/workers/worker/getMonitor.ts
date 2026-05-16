import {sql} from "../db.config"

interface MonitorRow {
  id: string
  service_id: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  duration_between_calls: number
  failure_threshold: number
  timeout_seconds: number
  url: string
  is_active: boolean
  monitor_id: string
  last_checked_at: Date | null
  last_response_time_ms: number | null
  consecutive_failure_count: number
  last_failure_at: Date | null
  last_success_at: Date | null
}
export const getMonitor=async():Promise<MonitorRow[]>=>{
    const monitor=await sql`SELECT 
      mc.id,
      mc.service_id,
      mc.method,
      mc.duration_between_calls,
      mc.failure_threshold,
      mc.timeout_seconds,
      mc.url,
      mc.is_active,
      ms.monitor_id,
      ms.last_checked_at,
      ms.last_response_time_ms,
      ms.consecutive_failure_count,
      ms.last_failure_at,
      ms.last_success_at
    FROM monitor_config AS mc
    JOIN monitor_state AS ms
      ON ms.monitor_id = mc.id
    WHERE 
      mc.is_active = true
      AND (
        ms.last_checked_at IS NULL 
        OR ms.last_checked_at + INTERVAL '1 second' * mc.duration_between_calls <= now()
      )
    LIMIT 1` as MonitorRow[];
    return monitor;
}
