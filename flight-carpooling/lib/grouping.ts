import { Traveler } from './supabase'

export type TravelerGroup = {
  id: number
  travelers: Traveler[]
  windowStart: string
  windowEnd: string
}

const HEAVY_LUGGAGE = ['1 checked bag', '2+ checked bags']

function isHeavy(t: Traveler) {
  return HEAVY_LUGGAGE.includes(t.luggage)
}

/**
 * Groups travelers by time proximity.
 * @param travelers - array of traveler records
 * @param timeKey - which time field to group by ('arrival_time' | 'departure_time')
 * @param windowMinutes - max spread within a group (default 45)
 * @param maxGroupSize - max people per group (default 4)
 */
export function groupTravelers(
  travelers: Traveler[],
  timeKey: 'arrival_time' | 'departure_time',
  windowMinutes = 45,
  maxGroupSize = 4
): TravelerGroup[] {
  if (travelers.length === 0) return []

  // Sort by the relevant time
  const sorted = [...travelers].sort(
    (a, b) => new Date(a[timeKey]).getTime() - new Date(b[timeKey]).getTime()
  )

  const rawGroups: Traveler[][] = []
  let currentGroup: Traveler[] = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    const groupStart = new Date(currentGroup[0][timeKey]).getTime()
    const candidateTime = new Date(sorted[i][timeKey]).getTime()
    const diffMinutes = (candidateTime - groupStart) / 60000

    if (diffMinutes <= windowMinutes && currentGroup.length < maxGroupSize) {
      currentGroup.push(sorted[i])
    } else {
      rawGroups.push(currentGroup)
      currentGroup = [sorted[i]]
    }
  }
  rawGroups.push(currentGroup)

  // Balance luggage: if a group has > 2 heavy bags, try to redistribute
  const balanced = balanceLuggage(rawGroups, maxGroupSize)

  return balanced.map((group, index) => {
    const times = group.map((t) => new Date(t[timeKey]).getTime())
    return {
      id: index + 1,
      travelers: group,
      windowStart: new Date(Math.min(...times)).toISOString(),
      windowEnd: new Date(Math.max(...times)).toISOString(),
    }
  })
}

/**
 * Attempts to rebalance groups so no group has more than 2 heavy-luggage travelers.
 * Uses a greedy swap approach.
 */
function balanceLuggage(groups: Traveler[][], maxGroupSize: number): Traveler[][] {
  // Work on a deep copy
  const result: Traveler[][] = groups.map((g) => [...g])

  for (let i = 0; i < result.length; i++) {
    const heavyCount = result[i].filter(isHeavy).length
    if (heavyCount <= 2) continue

    // Find excess heavy travelers to move
    const excessHeavy = result[i].filter(isHeavy).slice(2)

    for (const traveler of excessHeavy) {
      // Find adjacent group that has room and fewer than 2 heavy bags
      const neighbors = [i - 1, i + 1].filter((idx) => idx >= 0 && idx < result.length)
      let moved = false

      for (const nIdx of neighbors) {
        const neighborHeavy = result[nIdx].filter(isHeavy).length
        if (result[nIdx].length < maxGroupSize && neighborHeavy < 2) {
          result[i] = result[i].filter((t) => t.id !== traveler.id)
          result[nIdx].push(traveler)
          moved = true
          break
        }
      }

      // If no neighbor can take them, check any group
      if (!moved) {
        for (let j = 0; j < result.length; j++) {
          if (j === i) continue
          const jHeavy = result[j].filter(isHeavy).length
          if (result[j].length < maxGroupSize && jHeavy < 2) {
            result[i] = result[i].filter((t) => t.id !== traveler.id)
            result[j].push(traveler)
            break
          }
        }
      }
    }
  }

  // Remove empty groups
  return result.filter((g) => g.length > 0)
}
