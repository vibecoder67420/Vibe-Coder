'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, Traveler } from '@/lib/supabase'
import { groupTravelers } from '@/lib/grouping'

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function exportCSV(travelers: Traveler[]) {
  const headers = [
    'ID', 'Name', 'Email', 'Phone',
    'Arrival Flight', 'Arrival Time', 'Departure Time',
    'Luggage', 'Notes', 'Created At',
  ]
  const rows = travelers.map((t) => [
    t.id,
    t.name,
    t.email,
    t.phone,
    t.arrival_flight ?? '',
    t.arrival_time,
    t.departure_time,
    t.luggage,
    t.notes ?? '',
    t.created_at,
  ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))

  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sea-offsite-travelers-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [pwError, setPwError] = useState(false)
  const [travelers, setTravelers] = useState<Traveler[]>([])
  const [loading, setLoading] = useState(false)
  const [recomputing, setRecomputing] = useState(false)

  const fetchTravelers = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('travelers')
      .select('*')
      .order('arrival_time', { ascending: true })
    if (data) setTravelers(data as Traveler[])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (authed) fetchTravelers()
  }, [authed, fetchTravelers])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    // NOTE: For a proper internal tool, move this check to a server route.
    // We expose NEXT_PUBLIC_ADMIN_PASSWORD for simplicity since this is internal-only.
    if (password === adminPassword) {
      setAuthed(true)
    } else {
      setPwError(true)
      setPassword('')
    }
  }

  async function handleRecompute() {
    setRecomputing(true)
    await fetchTravelers()
    setRecomputing(false)
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto mt-24">
        <h1 className="text-xl font-semibold mb-6 text-center">Admin Access</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setPwError(false) }}
            placeholder="Enter admin password"
            className={[
              'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
              pwError ? 'border-red-400' : 'border-gray-300',
            ].join(' ')}
            autoFocus
          />
          {pwError && <p className="text-xs text-red-500">Incorrect password</p>}
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    )
  }

  const arrivalGroups = groupTravelers(travelers, 'arrival_time')
  const departureGroups = groupTravelers(travelers, 'departure_time')
  const arrivalGroupCount = arrivalGroups.filter((g) => g.travelers.length >= 2).length
  const departureGroupCount = departureGroups.filter((g) => g.travelers.length >= 2).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="flex gap-3">
          <button
            onClick={handleRecompute}
            disabled={recomputing || loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {recomputing ? 'Recomputing...' : 'Recompute Pairings'}
          </button>
          <button
            onClick={() => exportCSV(travelers)}
            disabled={travelers.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Registrants" value={travelers.length} />
        <StatCard label="Arrival Groups" value={arrivalGroupCount} />
        <StatCard label="Departure Groups" value={departureGroupCount} />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center text-gray-400 py-16 text-sm">Loading...</div>
      ) : travelers.length === 0 ? (
        <div className="text-center text-gray-400 py-16 text-sm">No submissions yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Name', 'Email', 'Phone', 'Arrival Flight', 'Arrives', 'Departs', 'Luggage', 'Notes', 'Submitted'].map(
                  (h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {travelers.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{t.name}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{t.email}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{t.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{t.arrival_flight ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatTime(t.arrival_time)}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatTime(t.departure_time)}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{t.luggage}</td>
                  <td className="px-4 py-3 text-gray-400 max-w-xs truncate">{t.notes ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  )
}
