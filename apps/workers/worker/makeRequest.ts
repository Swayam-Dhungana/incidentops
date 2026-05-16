import sql from "../db.config"

interface MakeRequestInput {
  monitor_id: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  failure_threshold: number
  timeout_seconds: number
  url: string
}

type CheckStatus = "success" | "failure" | "timeout"

export const makeRequest = async (data: MakeRequestInput) => {
  const startedAt = performance.now()
  const checkedAt = new Date()

  let statusCode: number | null = null
  let responseTimeMs: number | null = null
  let errorMessage: string | null = null
  let isSuccess = false

  try {
    const response = await fetch(data.url, {
      method: data.method,
      signal: AbortSignal.timeout(data.timeout_seconds * 1000),
    })

    responseTimeMs = Math.round(performance.now() - startedAt)
    statusCode = response.status
    isSuccess = response.ok
  } catch (error) {
    responseTimeMs = Math.round(performance.now() - startedAt)
    errorMessage = error instanceof Error ? error.message : "Unknown error"
    isSuccess = false
  }

  if (isSuccess) {
    await sql.begin(async(tx)=>{
        await tx`
        UPDATE monitor_state
      SET
        last_checked_at = ${checkedAt},
        last_response_time_ms = ${responseTimeMs},
        consecutive_failure_count = 0,
        last_success_at = ${checkedAt}
      WHERE monitor_id = ${data.monitor_id}`

      await tx`
      INSERT INTO monitor_history (
        monitor_id,
        checked_at,
        status,
        status_code,
        response_time_ms,
        error_message
      )
      VALUES (
        ${data.monitor_id},
        ${checkedAt},
        'success',
        ${statusCode},
        ${responseTimeMs},
        NULL
      )`
    })
    return
  }

  const state = await sql<{ consecutive_failure_count: number }[]>`
    SELECT consecutive_failure_count
    FROM monitor_state
    WHERE monitor_id = ${data.monitor_id}
  `

  const newFailureCount = (state[0]?.consecutive_failure_count ?? 0) + 1

  const newStatus: CheckStatus =
    newFailureCount >= data.failure_threshold ? "failure" : "success"

  await sql.begin(async(tx)=>{
    await tx`UPDATE monitor_state
    SET
      last_checked_at = ${checkedAt},
      last_response_time_ms = ${responseTimeMs},
      consecutive_failure_count = ${newFailureCount},
      last_failure_at = ${checkedAt}
    WHERE monitor_id = ${data.monitor_id}`

    await tx`
    INSERT INTO monitor_history (
      monitor_id,
      checked_at,
      status,
      status_code,
      response_time_ms,
      error_message
    )
    VALUES (
      ${data.monitor_id},
      ${checkedAt},
      ${newStatus},
      ${statusCode},
      ${responseTimeMs},
      ${errorMessage}
    )`
  })
  return
}