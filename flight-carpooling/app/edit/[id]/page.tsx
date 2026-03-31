'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, Traveler } from '@/lib/supabase'

const LUGGAGE_OPTIONS = ['carry-on only', '1 checked bag', '2+ checked bags'] as const

type FormData = {
  name: string
  email: string
  phone: string
  arrival_flight: string
  arrival_time: string
  departure_time: string
  luggage: string
  notes: string
}

function toLocalDatetime(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData | null>(null)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [unauthorized, setUnauthorized] = useState(false)

  useEffect(() => {
    params.then(({ id: resolvedId }) => {
      setId(resolvedId)

      // Verify this is the user's own submission
      const myId = localStorage.getItem('submissionId')
      if (myId !== resolvedId) {
        setUnauthorized(true)
        return
      }

      supabase
        .from('travelers')
        .select('*')
        .eq('id', resolvedId)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            setNotFound(true)
            return
          }
          const t = data as Traveler
          setForm({
            name: t.name,
            email: t.email,
            phone: t.phone,
            arrival_flight: t.arrival_flight ?? '',
            arrival_time: toLocalDatetime(t.arrival_time),
            departure_time: toLocalDatetime(t.departure_time),
            luggage: t.luggage,
            notes: t.notes ?? '',
          })
        })
    })
  }, [params])

  function validate(): boolean {
    if (!form) return false
    const newErrors: Partial<FormData> = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address'
    }
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!form.arrival_time) newErrors.arrival_time = 'Arrival time is required'
    if (!form.departure_time) newErrors.departure_time = 'Departure time is required'
    if (form.arrival_time && form.departure_time && form.arrival_time >= form.departure_time) {
      newErrors.departure_time = 'Departure must be after arrival'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form || !id || !validate()) return
    setSubmitting(true)

    const { error } = await supabase
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

    setSubmitting(false)
    if (!error) setSaved(true)
  }

  function update(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((f) => f ? { ...f, [field]: e.target.value } : f)
      setErrors((err) => ({ ...err, [field]: undefined }))
      setSaved(false)
    }
  }

  if (unauthorized) {
    return (
      <div className="max-w-sm mx-auto mt-24 text-center">
        <p className="text-gray-600 mb-4">You can only edit your own submission.</p>
        <Link href="/" className="text-blue-600 text-sm hover:underline">Go back home</Link>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="max-w-sm mx-auto mt-24 text-center">
        <p className="text-gray-600 mb-4">Submission not found.</p>
        <Link href="/" className="text-blue-600 text-sm hover:underline">Go back home</Link>
      </div>
    )
  }

  if (!form) {
    return <div className="text-center text-gray-400 text-sm py-16">Loading...</div>
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/matches" className="text-gray-400 hover:text-gray-600 text-sm transition-colors">
          ← Back to Matches
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-1">Edit Your Registration</h1>
      <p className="text-gray-500 text-sm mb-8">Update your flight info if anything has changed.</p>

      {saved && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
          Changes saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Full Name" error={errors.name} required>
          <input type="text" value={form.name} onChange={update('name')} className={input(errors.name)} />
        </Field>

        <Field label="Work Email" error={errors.email} required>
          <input type="email" value={form.email} onChange={update('email')} className={input(errors.email)} />
        </Field>

        <Field label="Phone Number" error={errors.phone} required>
          <input type="tel" value={form.phone} onChange={update('phone')} className={input(errors.phone)} />
        </Field>

        <Field label="Arrival Flight Number" hint="Optional">
          <input type="text" value={form.arrival_flight} onChange={update('arrival_flight')} placeholder="AA 1234" className={input()} />
        </Field>

        <Field label="Arrival Date & Time" error={errors.arrival_time} required>
          <input type="datetime-local" value={form.arrival_time} onChange={update('arrival_time')} className={input(errors.arrival_time)} />
        </Field>

        <Field label="Departure Date & Time" error={errors.departure_time} required>
          <input type="datetime-local" value={form.departure_time} onChange={update('departure_time')} className={input(errors.departure_time)} />
        </Field>

        <Field label="Luggage" required>
          <select value={form.luggage} onChange={update('luggage')} className={input()}>
            {LUGGAGE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </Field>

        <Field label="Notes" hint="Optional">
          <textarea value={form.notes} onChange={update('notes')} rows={3} className={input() + ' resize-none'} />
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

function input(error?: string) {
  return [
    'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white',
    error ? 'border-red-400' : 'border-gray-300',
  ].join(' ')
}

function Field({
  label,
  children,
  error,
  hint,
  required,
}: {
  label: string
  children: React.ReactNode
  error?: string
  hint?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {hint && <span className="text-gray-400 font-normal ml-1">({hint})</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
