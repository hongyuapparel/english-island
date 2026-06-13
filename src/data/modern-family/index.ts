import { MODERN_FAMILY as MF_META } from './meta'
import { SEASON_1_META } from './seasons'

export const MODERN_FAMILY = MF_META

export { SEASON_1_META }

export function getEpisodeMeta(episodeId: string) {
  const m = episodeId.match(/^s(\d+)e(\d+)$/)
  if (!m) return undefined
  const season = parseInt(m[1], 10)
  const ep = parseInt(m[2], 10)
  if (season !== 1) return undefined
  const found = SEASON_1_META.find((x) => x.ep === ep)
  if (!found) return undefined
  return {
    id: episodeId,
    season,
    episode: ep,
    title: found.title,
    titleZh: found.titleZh,
  }
}

export function listSeasons(): { season: number; episodeCount: number }[] {
  return [{ season: 1, episodeCount: SEASON_1_META.length }]
}

export function getSeasonEpisodeMetas(season: number) {
  if (season !== 1) return []
  return SEASON_1_META.map((m) => ({
    id: `s${String(season).padStart(2, '0')}e${String(m.ep).padStart(2, '0')}`,
    season,
    episode: m.ep,
    title: m.title,
    titleZh: m.titleZh,
  }))
}
