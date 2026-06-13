import {
  MODERN_FAMILY,
  getSeasonEpisodeMetas,
  listSeasons,
} from '../data/modern-family'
import { mfStorage } from '../storage/mf-imports'
import { renderMfImport } from './mf-import'
import { renderTvViewer } from './tv-viewer'

export function renderModernFamily(onBack: () => void): HTMLElement {
  const el = document.createElement('div')
  el.className = 'page mf-page'

  async function renderSeasonList() {
    const seasons = listSeasons()
    el.innerHTML = `
      <button class="btn btn-ghost back-btn" id="back">← 全部课程</button>
      <header class="mf-hero" style="background-image:url('${MODERN_FAMILY.coverImage}')">
        <div class="mf-hero-overlay">
          <span class="mf-badge">Your Subtitles · Your Stills</span>
          <h1>${MODERN_FAMILY.titleZh}</h1>
          <p>${MODERN_FAMILY.description}</p>
        </div>
      </header>
      <div class="import-notice compact">
        <p>📺 导入你<strong>合法片源</strong>的 .srt 英文字幕 + 截图，台词<strong>一字不差</strong>，像看电视一样学。</p>
      </div>
      <div class="season-list">
        ${seasons
          .map(
            (s) => `
          <button class="season-card" data-season="${s.season}">
            <div class="season-num">Season ${s.season}</div>
            <div class="season-title">第 ${s.season} 季 · 共 ${s.episodeCount} 集</div>
            <span class="season-arrow">→</span>
          </button>
        `,
          )
          .join('')}
      </div>
    `
    el.querySelector('#back')?.addEventListener('click', onBack)
    el.querySelectorAll('.season-card').forEach((card) => {
      card.addEventListener('click', () => {
        showSeason(Number((card as HTMLElement).dataset.season))
      })
    })
  }

  async function showSeason(season: number) {
    const episodes = getSeasonEpisodeMetas(season)
    const importedSet = new Set(await mfStorage.listIds())

    el.innerHTML = `
      <button class="btn btn-ghost back-btn" id="back">← ${MODERN_FAMILY.titleZh}</button>
      <header class="page-header">
        <h1>第 ${season} 季</h1>
        <p class="subtitle">已导入的集可直接观看 · 未导入的点「导入」</p>
      </header>
      <div class="episode-grid">
        ${episodes
          .map((ep) => {
            const imported = importedSet.has(ep.id)
            return `
          <div class="episode-card ${imported ? 'imported' : ''}" data-ep="${ep.id}" data-imported="${imported}">
            <div class="ep-num">E${String(ep.episode).padStart(2, '0')}</div>
            <div class="ep-info-block">
              <h3>${esc(ep.title)}</h3>
              <p class="ep-zh">${esc(ep.titleZh)}</p>
              <span class="ep-status ${imported ? 'ready' : 'need'}">${imported ? '✓ 已导入' : '待导入字幕'}</span>
            </div>
            <div class="ep-actions">
              ${
                imported
                  ? `<button class="btn btn-primary btn-sm ep-watch" data-ep="${ep.id}">📺 观看</button>
                     <button class="btn btn-ghost btn-sm ep-reimport" data-ep="${ep.id}">重新导入</button>`
                  : `<button class="btn btn-accent btn-sm ep-import" data-ep="${ep.id}">导入本集</button>`
              }
            </div>
          </div>
        `
          })
          .join('')}
      </div>
    `

    el.querySelector('#back')?.addEventListener('click', renderSeasonList)
    el.querySelectorAll('.ep-watch').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        openViewer((btn as HTMLElement).dataset.ep!)
      })
    })
    el.querySelectorAll('.ep-import, .ep-reimport').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        openImport((btn as HTMLElement).dataset.ep!)
      })
    })
  }

  function openImport(episodeId: string) {
    el.innerHTML = ''
    el.appendChild(renderMfImport(episodeId, () => showSeason(1)))
  }

  async function openViewer(episodeId: string) {
    const has = await mfStorage.has(episodeId)
    if (!has) {
      openImport(episodeId)
      return
    }
    el.innerHTML = ''
    el.appendChild(renderTvViewer(episodeId, () => showSeason(1)))
  }

  renderSeasonList()
  return el
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
