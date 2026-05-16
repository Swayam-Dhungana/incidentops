"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "../../lib/api"

type Organization = { id: string; name: string; slug: string; role: string }
type Environment = { id: string; name: string; organization_id: string }
type Service = { id: string; name: string; description: string; environment_id: string }
type Monitor = { id: string; service_id: string; url: string; method: string; is_active: boolean }

export default function SetupPage() {
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [envs, setEnvs] = useState<Environment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [monitors, setMonitors] = useState<Monitor[]>([])
  const [message, setMessage] = useState("")

  const [orgName, setOrgName] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [envName, setEnvName] = useState("")
  const [serviceName, setServiceName] = useState("")
  const [serviceDescription, setServiceDescription] = useState("")
  const [serviceId, setServiceId] = useState("")
  const [monitorId, setMonitorId] = useState("")

  const [url, setUrl] = useState("")
  const [method, setMethod] = useState("GET")
  const [duration, setDuration] = useState(60)
  const [threshold, setThreshold] = useState(3)
  const [timeout, setTimeoutValue] = useState(5)

  async function loadAll() {
    const [orgRes, envRes, serviceRes, monitorRes] = await Promise.all([
      apiFetch<{ organizations: Organization[] }>("/organization/list"),
      apiFetch<{ environments: Environment[] }>("/environment/list"),
      apiFetch<{ services: Service[] }>("/service/list"),
      apiFetch<{ monitors: Monitor[] }>("/monitor/list"),
    ])

    setOrgs(orgRes.organizations ?? [])
    setEnvs(envRes.environments ?? [])
    setServices(serviceRes.services ?? [])
    setMonitors(monitorRes.monitors ?? [])
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function createOrg(e: React.FormEvent) {
    e.preventDefault()
    const res = await apiFetch<{ message: string }>("/organization/create", {
      method: "POST",
      body: JSON.stringify({ name: orgName }),
    })
    setMessage(res.message)
    setOrgName("")
    loadAll()
  }

  async function joinOrg(e: React.FormEvent) {
    e.preventDefault()
    const res = await apiFetch<{ message: string }>("/organization/join", {
      method: "POST",
      body: JSON.stringify({ code: joinCode }),
    })
    setMessage(res.message)
    setJoinCode("")
    loadAll()
  }

  async function createEnv(e: React.FormEvent) {
    e.preventDefault()
    const res = await apiFetch<{ message: string }>("/environment/create", {
      method: "POST",
      body: JSON.stringify({ name: envName }),
    })
    setMessage(res.message)
    setEnvName("")
    loadAll()
  }

  async function createService(e: React.FormEvent) {
    e.preventDefault()
    const res = await apiFetch<{ message: string }>("/service/create", {
      method: "POST",
      body: JSON.stringify({ name: serviceName, description: serviceDescription }),
    })
    setMessage(res.message)
    setServiceName("")
    setServiceDescription("")
    loadAll()
  }

  async function createMonitor(e: React.FormEvent) {
    e.preventDefault()
    const res = await apiFetch<{ message: string }>("/monitor/create", {
      method: "POST",
      body: JSON.stringify({
        service_id: serviceId,
        method,
        duration_between_calls: duration,
        failure_threshold: threshold,
        timeout_seconds: timeout,
        url,
        is_active: true,
      }),
    })
    setMessage(res.message)
    setUrl("")
    loadAll()
  }

  async function startMonitor(e: React.FormEvent) {
    e.preventDefault()
    const res = await apiFetch<{ message: string }>("/monitor/start", {
      method: "POST",
      body: JSON.stringify({ monitor_id: monitorId }),
    })
    setMessage(res.message)
    setMonitorId("")
    loadAll()
  }

  return (
    <main className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Setup</h1>
        {message && <p className="mt-2 border p-2">{message}</p>}
      </div>

      <section className="grid md:grid-cols-2 gap-4">
        <form onSubmit={createOrg} className="border p-4 rounded space-y-3">
          <h2 className="text-xl font-semibold">Create Organization</h2>
          <input className="border p-2 w-full" placeholder="Organization name" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
          <button className="bg-black text-white px-4 py-2">Create</button>
        </form>

        <form onSubmit={joinOrg} className="border p-4 rounded space-y-3">
          <h2 className="text-xl font-semibold">Join Organization</h2>
          <input className="border p-2 w-full" placeholder="Organization join code / slug" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
          <button className="bg-black text-white px-4 py-2">Join</button>
        </form>

        <form onSubmit={createEnv} className="border p-4 rounded space-y-3">
          <h2 className="text-xl font-semibold">Create Environment</h2>
          <input className="border p-2 w-full" placeholder="Production / Staging" value={envName} onChange={(e) => setEnvName(e.target.value)} />
          <button className="bg-black text-white px-4 py-2">Create</button>
        </form>

        <form onSubmit={createService} className="border p-4 rounded space-y-3">
          <h2 className="text-xl font-semibold">Create Service</h2>
          <input className="border p-2 w-full" placeholder="Service name" value={serviceName} onChange={(e) => setServiceName(e.target.value)} />
          <textarea className="border p-2 w-full" placeholder="Service description" value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)} />
          <button className="bg-black text-white px-4 py-2">Create</button>
        </form>

        <form onSubmit={createMonitor} className="border p-4 rounded space-y-3 md:col-span-2">
          <h2 className="text-xl font-semibold">Create Monitor</h2>

          <select className="border p-2 w-full" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
            <option value="">Select service</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <input className="border p-2 w-full" placeholder="https://example.com/health" value={url} onChange={(e) => setUrl(e.target.value)} />

          <select className="border p-2 w-full" value={method} onChange={(e) => setMethod(e.target.value)}>
            {["GET", "POST", "PUT", "DELETE", "PATCH"].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <div className="grid md:grid-cols-3 gap-2">
            <input className="border p-2" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
            <input className="border p-2" type="number" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
            <input className="border p-2" type="number" value={timeout} onChange={(e) => setTimeoutValue(Number(e.target.value))} />
          </div>

          <button className="bg-black text-white px-4 py-2">Create Monitor</button>
        </form>

        <form onSubmit={startMonitor} className="border p-4 rounded space-y-3 md:col-span-2">
          <h2 className="text-xl font-semibold">Start Monitor</h2>

          <select className="border p-2 w-full" value={monitorId} onChange={(e) => setMonitorId(e.target.value)}>
            <option value="">Select monitor</option>
            {monitors.map((m) => (
              <option key={m.id} value={m.id}>{m.method} {m.url}</option>
            ))}
          </select>

          <button className="bg-black text-white px-4 py-2">Start</button>
        </form>
      </section>
    </main>
  )
}