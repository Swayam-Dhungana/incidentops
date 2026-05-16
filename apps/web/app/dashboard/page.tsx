"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "../lib/api"

type MonitorDashboardItem = {
  monitor_id: string
  service_name: string
  service_status: string
  environment_name: string
  url: string
  method: string
  is_active: boolean
  last_checked_at: string | null
  last_response_time_ms: number | null
  consecutive_failure_count: number | null
  last_failure_at: string | null
  last_success_at: string | null
}

export default function DashboardPage() {
  const [monitors, setMonitors] = useState<MonitorDashboardItem[]>([])

  async function loadDashboard() {
    const res = await apiFetch<{ success: boolean; monitors: MonitorDashboardItem[] }>("/monitor/dashboard")
    setMonitors(res.monitors ?? [])
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">IncidentOps Dashboard</h1>

      <div className="border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="p-2 text-left">Service</th>
              <th className="p-2 text-left">Env</th>
              <th className="p-2 text-left">URL</th>
              <th className="p-2 text-left">Response</th>
              <th className="p-2 text-left">Failures</th>
              <th className="p-2 text-left">Last Checked</th>
            </tr>
          </thead>
          <tbody>
            {monitors.map((m) => (
              <tr key={m.monitor_id} className="border-b">
                <td className="p-2">{m.service_name}</td>
                <td className="p-2">{m.environment_name}</td>
                <td className="p-2">{m.method} {m.url}</td>
                <td className="p-2">{m.last_response_time_ms ?? "-"} ms</td>
                <td className="p-2">{m.consecutive_failure_count ?? 0}</td>
                <td className="p-2">{m.last_checked_at ?? "Never"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}