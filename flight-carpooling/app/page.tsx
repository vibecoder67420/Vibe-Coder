'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

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

const EMPTY_FORM: FormData = {
  name: '',
  email: '',
  phone: '',
  arrival_flight: '',
  arrival_time: '',
  departure_time: '',
  luggage: 'carry-on only',
  notes: '',
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm">
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="ml-auto text-white/80 hover:text-white text-lg leading-none">&times;</button>
    </div>
  )
}

export default function SubmitPage() {
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<{ id: string } | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [registrantCount, setRegistrantCount] = useState<number | null>(null)

  useEffect(() => {
    supabase
      .from('travelers')
      .select('id', { count: 'exact', head: true })
      .then(({ count }) => { if (count !== null) setRegistrantCount(count) })
  }, [])

  function validate(): boolean {
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
    if (!validate()) return
    setSubmitting(true)

    const { data, error } = await supabase
      .from('travelers')
      .insert({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        arrival_flight: form.arrival_flight.trim() || null,
        arrival_time: new Date(form.arrival_time).toISOString(),
        departure_time: new Date(form.departure_time).toISOString(),
        luggage: form.luggage,
        notes: form.notes.trim() || null,
      })
      .select('id')
      .single()

    setSubmitting(false)

    if (error || !data) {
      setErrors({ name: 'Something went wrong. Please try again.' })
      return
    }

    localStorage.setItem('submissionId', data.id)
    setSubmitted({ id: data.id })
    setToast('Registration submitted!')
  }

  function update(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }))
      setErrors((err) => ({ ...err, [field]: undefined }))
    }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-semibold mb-2">You&apos;re registered!</h1>
        <p className="text-gray-600 mb-6">
          Your submission has been saved. Check the matches page to see your ride group once enough people have registered.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/matches"
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            View Matches
          </Link>
          <Link
            href={`/edit/${submitted.id}`}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Edit My Submission
          </Link>
        </div>
        <p className="mt-4 text-xs text-gray-400">Submission ID: {submitted.id}</p>
      </div>
    )
  }

  return (
    <>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Full-width banner — sits outside the constrained form column */}
      <div className="relative w-full rounded-xl overflow-hidden mb-8" style={{ maxWidth: '100%' }}>
        <Image
          src="/seattle-banner.png.png"
          alt="Seattle Company Meeting"
          width={1700}
          height={600}
          className="w-full h-auto object-cover"
          priority
        />
      </div>

      <div className="max-w-xl mx-auto">
        {registrantCount !== null && (
          <div className="mb-6 flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-lg">
            <span className="text-lg font-bold">{registrantCount}</span>
            <span>{registrantCount === 1 ? 'traveler registered' : 'travelers registered'} so far</span>
          </div>
        )}
        <h1 className="text-2xl font-semibold mb-1">Register Your Flights</h1>
        <p className="text-gray-500 text-sm mb-4">
          Submit your arrival and departure info so we can group you with coworkers for shared Ubers.
        </p>
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-3 rounded-lg mb-8">
          All times should be entered in Pacific Time (Seattle)
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <Field label="Full Name" error={errors.name} required>
            <input
              type="text"
              value={form.name}
              onChange={update('name')}
              placeholder="Andrew Pollard"
              className={input(errors.name)}
            />
          </Field>

          {/* Email */}
          <Field label="Work Email" error={errors.email} required>
            <input
              type="email"
              value={form.email}
              onChange={update('email')}
              placeholder="apollard@clarkstonconsulting.com"
              className={input(errors.email)}
            />
          </Field>

          {/* Phone */}
          <Field label="Phone Number" error={errors.phone} required>
            <input
              type="tel"
              value={form.phone}
              onChange={update('phone')}
              placeholder="+1 (555) 000-0000"
              className={input(errors.phone)}
            />
          </Field>

          {/* Arrival flight */}
          <Field label="Arrival Flight Number" hint="Optional">
            <input
              type="text"
              value={form.arrival_flight}
              onChange={update('arrival_flight')}
              placeholder="AA 1234"
              className={input()}
            />
          </Field>

          {/* Arrival time */}
          <Field label="Arrival at Seattle-Tacoma International Airport (SEA)" hint="Enter time in Seattle time (Pacific Time)" error={errors.arrival_time} required>
            <input
              type="datetime-local"
              value={form.arrival_time}
              onChange={update('arrival_time')}
              className={input(errors.arrival_time)}
            />
          </Field>

          {/* Departure time */}
          <Field label="Departure from Hyatt Regency Seattle" hint="Enter time in Seattle time (Pacific Time)" error={errors.departure_time} required>
            <input
              type="datetime-local"
              value={form.departure_time}
              onChange={update('departure_time')}
              className={input(errors.departure_time)}
            />
          </Field>

          {/* Luggage */}
          <Field label="Luggage" required>
            <select
              value={form.luggage}
              onChange={update('luggage')}
              className={input()}
            >
              {LUGGAGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </Field>

          {/* Notes */}
          <Field label="Notes" hint="Optional — e.g. 'My flight often delays'">
            <textarea
              value={form.notes}
              onChange={update('notes')}
              rows={3}
              placeholder="Any relevant info for your group..."
              className={input() + ' resize-none'}
            />
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Registration'}
          </button>
        </form>
      </div>
    </>
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
