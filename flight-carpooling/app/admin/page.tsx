'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, Traveler } from '@/lib/supabase'
import { groupTravelers } from '@/lib/grouping'

const LUGGAGE_OPTIONS = ['carry-on only', '1 checked bag', '2+ checked bags'] as const

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function toLocalDatetime(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function exportCSV(travelers: Traveler[]) {
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Arrival Flight', 'Arrival Time', 'Departure Time', 'Luggage', 'Notes', 'Created At']
  const rows = travelers.map((t) =>
    [t.id, t.name, t.email, t.phone, t.arrival_flight ?? '', t.arrival_time, t.departure_time, t.luggage, t.notes ?? '', t.created_at]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  )
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sea-offsite-travelers-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

type EditForm = {
  name: string
  email: string
  phone: string
  arrival_flight: string
  arrival_time: string
  departure_time: string
  luggage: string
  notes: string
}

function EditModal({
  traveler,
  onSave,
  onClose,
}: {
  traveler: Traveler
  onSave: (id: string, data: EditForm) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState<EditForm>({
    name: traveler.name,
    email: traveler.email,
    phone: traveler.phone,
    arrival_flight: traveler.arrival_flight ?? '',
    arrival_time: toLocalDatetime(traveler.arrival_time),
    departure_time: toLocalDatetime(traveler.departure_time),
    luggage: traveler.luggage,
    notes: traveler.notes ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update(field: keyof EditForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (form.arrival_time >= form.departure_time) {
      setError('Departure must be after arrival')
      return
    }
    setSaving(true)
    await onSave(traveler.id, form)
    setSaving(false)
  }

  const inputCls = 'w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-lg">Edit — {traveler.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
          {error && <p className="text-xs text-red-500">{error}</p>}
          {([
            ['Full Name', 'name', 'text'],
            ['Work Email', 'email', 'email'],
            ['Phone', 'phone', 'tel'],
            ['Arrival Flight', 'arrival_flight', 'text'],
          ] as [string, keyof EditForm, string][]).map(([label, field, type]) => (
            <div key={field}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input type={type} value={form[field]} onChange={update(field)} className={inputCls} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Arrival Date & Time</label>
            <input type="datetime-local" value={form.arrival_time} onChange={update('arrival_time')} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Departure Date & Time</label>
            <input type="datetime-local" value={form.departure_time} onChange={update('departure_time')} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Luggage</label>
            <select value={form.luggage} onChange={update('luggage')} className={inputCls}>
              {LUGGAGE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea value={form.notes} onChange={update('notes')} rows={2} className={inputCls + ' resize-none'} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [pwError, setPwError] = useState(false)
  const [travelers, setTravelers] = useState<Traveler[]>([])
  const [loading, setLoading] = useState(false)
  const [recomputing, setRecomputing] = useState(false)
  const [editingTraveler, setEditingTraveler] = useState<Traveler | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchTravelers = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('travelers').select('*').order('arrival_time', { ascending: true })
    if (data) setTravelers(data as Traveler[])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (authed) fetchTravelers()
  }, [authed, fetchTravelers])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setAuthed(true)
    } else {
      setPwError(true)
      setPassword('')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this traveler? This cannot be undone.')) return
    setDeletingId(id)
    await supabase.from('travelers').delete().eq('id', id)
    setTravelers((prev) => prev.filter((t) => t.id !== id))
    setDeletingId(null)
  }

  async function handleSaveEdit(id: string, form: EditForm) {
    const { data } = await supabase
      .from('travelers')
      .update({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        arrival_flight: form.arrival_flight.trim() || null,
        arrival_time: new Date(form.arrival_time).toISOString(),
        departure_time: new Date(form.departure_time).toISOString(),
        luggage: form.luggage,
        notes: form.notes.trim() || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (data) {
      setTravelers((prev) => prev.map((t) => (t.id === id ? (data as Traveler) : t)))
    }
    setEditingTraveler(null)
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
            className={['w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500', pwError ? 'border-red-400' : 'border-gray-300'].join(' ')}
            autoFocus
          />
          {pwError && <p className="text-xs text-red-500">Incorrect password</p>}
          <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
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
    <>
      {editingTraveler && (
        <EditModal
          traveler={editingTraveler}
          onSave={handleSaveEdit}
          onClose={() => setEditingTraveler(null)}
        />
      )}

      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <div className="flex gap-3">
            <button
              onClick={async () => { setRecomputing(true); await fetchTravelers(); setRecomputing(false) }}
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

        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Registrants" value={travelers.length} />
          <StatCard label="Arrival Groups" value={arrivalGroupCount} />
          <StatCard label="Departure Groups" value={departureGroupCount} />
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-16 text-sm">Loading...</div>
        ) : travelers.length === 0 ? (
          <div className="text-center text-gray-400 py-16 text-sm">No submissions yet.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name', 'Email', 'Phone', 'Arrival Flight', 'Arrives', 'Departs', 'Luggage', 'Notes', 'Submitted', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
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
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{new Date(t.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingTraveler(t)}
                          className="px-2.5 py-1 text-xs font-medium border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={deletingId === t.id}
                          className="px-2.5 py-1 text-xs font-medium border border-red-200 text-red-600 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {deletingId === t.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
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
