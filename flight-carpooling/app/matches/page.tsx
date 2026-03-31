'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, Traveler } from '@/lib/supabase'
import { groupTravelers, TravelerGroup } from '@/lib/grouping'

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function GroupCard({
  group,
  myId,
  label,
}: {
  group: TravelerGroup
  myId: string | null
  label: string
}) {
  const windowStr =
    group.windowStart === group.windowEnd
      ? formatTime(group.windowStart)
      : `${formatTime(group.windowStart)} – ${formatTime(group.windowEnd)}`

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {label} Group {group.id}
        </span>
        <span className="text-xs text-gray-500">{windowStr}</span>
      </div>
      <div className="space-y-3">
        {group.travelers.map((t) => (
          <div
            key={t.id}
            className={[
              'flex items-start justify-between gap-3 py-2 px-3 rounded-lg',
              t.id === myId ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50',
            ].join(' ')}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t.name}</span>
                {t.id === myId && (
                  <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium">
                    You
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{t.phone}</div>
              {t.notes && (
                <div className="text-xs text-gray-400 mt-0.5 italic">{t.notes}</div>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-gray-600">{formatTime(t.arrival_time)}</div>
              <div className="text-xs text-gray-400">{t.luggage}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Section({
  title,
  groups,
  myId,
  label,
}: {
  title: string
  groups: TravelerGroup[]
  myId: string | null
  label: string
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {groups.length === 0 ? (
        <p className="text-gray-400 text-sm">No registrations yet.</p>
      ) : (
        <div className="space-y-4">
          {groups.map((g) =>
            g.travelers.length < 2 ? (
              <div
                key={g.id}
                className="bg-white border border-dashed border-gray-300 rounded-xl p-5"
              >
                <p className="text-sm text-gray-400">
                  Waiting for more travelers in this time window ({formatTime(g.windowStart)})
                </p>
                {myId && g.travelers.some((t) => t.id === myId) && (
                  <p className="text-xs text-blue-500 mt-1">You&apos;re in this window</p>
                )}
              </div>
            ) : (
              <GroupCard key={g.id} group={g} myId={myId} label={label} />
            )
          )}
        </div>
      )}
    </section>
  )
}

export default function MatchesPage() {
  const [travelers, setTravelers] = useState<Traveler[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [myId, setMyId] = useState<string | null>(null)

  const fetchTravelers = useCallback(async () => {
    const { data } = await supabase
      .from('travelers')
      .select('*')
      .order('arrival_time', { ascending: true })

    if (data) {
      setTravelers(data as Traveler[])
      setLastUpdated(new Date())
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const id = localStorage.getItem('submissionId')
    setMyId(id)
    fetchTravelers()

    const interval = setInterval(fetchTravelers, 60000)
    return () => clearInterval(interval)
  }, [fetchTravelers])

  const arrivalGroups = groupTravelers(travelers, 'arrival_time')
  const departureGroups = groupTravelers(travelers, 'departure_time')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Ride Groups</h1>
          <p className="text-gray-500 text-sm mt-1">
            People are grouped by flight times within 45 minutes of each other, up to 4 per Uber.
          </p>
        </div>
        {lastUpdated && (
          <span className="text-xs text-gray-400 shrink-0">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm text-center py-16">Loading...</div>
      ) : (
        <div className="space-y-12">
          <Section
            title="Arrival Groups (Hotel → Airport pickup)"
            groups={arrivalGroups}
            myId={myId}
            label="Arrival"
          />
          <Section
            title="Departure Groups (Hotel → Airport dropoff)"
            groups={departureGroups}
            myId={myId}
            label="Departure"
          />
        </div>
      )}

      <p className="mt-10 text-center text-xs text-gray-400">
        This page auto-refreshes every 60 seconds.
        {myId && (
          <> Your submission ID: <span className="font-mono">{myId.slice(0, 8)}…</span></>
        )}
      </p>
    </div>
  )
}
